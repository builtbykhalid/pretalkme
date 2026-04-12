import openai
import os
import json
import asyncio
from typing import Tuple, List, Dict, Any
from utils.qdrant import search_kb

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Define tools for the AI agent
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_stock",
            "description": "Vérifier le stock disponible d'un produit.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Nom du produit"}
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Récupérer le statut d'une commande.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "ID de la commande"}
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "transfer_to_human",
            "description": "Transférer la conversation à un agent humain si la demande est trop complexe ou si le client est mécontent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Raison du transfert"}
                },
                "required": ["reason"]
            }
        }
    }
]

async def call_llm(
    messages: list,
    system_prompt: str,
    tenant_id: str,
) -> Tuple[str, List[dict], float, str]:
    """
    Calls GPT-4o with tools and handles function calling results.
    Returns: (response_text, function_calls, confidence_score, model_used)
    """
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    model_used = "gpt-4o"

    # RAG: Search KB for context
    query_text = messages[-1]["content"] if messages else ""
    # In a real app, you'd generate a vector for query_text here
    # context = await search_kb(tenant_id, [0.1]*1536) # Dummy vector 
    context = [] # Placeholder
    
    kb_context = "\n".join([c["text"] for c in context])
    augmented_system = f"{system_prompt}\n\nCONTEXTE BUSINESS:\n{kb_context}"

    try:
        response = await client.chat.completions.create(
            model=model_used,
            messages=[{"role": "system", "content": augmented_system}, *messages],
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.7,
        )

        message = response.choices[0].message
        function_calls = []
        response_text = message.content or ""

        if message.tool_calls:
            for tool_call in message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                # Placeholder for actual function execution logic
                result = {"status": "success", "data": "dummy_result"} 
                function_calls.append({"name": fn_name, "arguments": fn_args, "result": result})

            # Second call if function results are needed to respond
            if not response_text:
                 # Normally we would re-call LLM here with results. 
                 # For now, let's keep it simple.
                 response_text = "Je vérifie cela pour vous..."

        confidence = 0.9 # Placeholder logic
        return response_text, function_calls, confidence, model_used

    except Exception as e:
        print(f"LLM Error: {e}")
        return "Désolé, j'ai rencontré une erreur.", [], 0.0, model_used
