import base64
from openai import AsyncOpenAI
import fitz


async def analyze_image(image_bytes: bytes, mime_type: str, prompt: str, openai_key: str) -> str:
    """
    Analyze an image with GPT-4o Vision and return concise context text.
    """
    client = AsyncOpenAI(api_key=openai_key)
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64_image}"

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Decris precisement ce que tu vois dans cette image en lien avec une conversation e-commerce WhatsApp. Sois concis (max 150 mots).",
                    },
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        max_tokens=300,
    )

    return response.choices[0].message.content or ""


async def extract_pdf_text(pdf_bytes: bytes, max_chars: int = 3000) -> str:
    """
    Extract text from a PDF using PyMuPDF, capped to max_chars.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
        if len(text) >= max_chars:
            break
    doc.close()
    return text[:max_chars].strip()
