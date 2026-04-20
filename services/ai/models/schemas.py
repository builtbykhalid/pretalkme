from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AITask(BaseModel):
    tenant_id: str
    conversation_id: str
    message_id: str
    text_message: Optional[str] = None
    audio_url: Optional[str] = None  # R2 URL of the voice note
    image_url: Optional[str] = None
    image_mime_type: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_filename: Optional[str] = None

class FunctionCall(BaseModel):
    name: str
    arguments: Dict[str, Any]
    result: Any

class AIResult(BaseModel):
    tenant_id: str
    conversation_id: str
    message_id: str
    stt_text: Optional[str] = None
    llm_response: Optional[str] = None
    tts_url: Optional[str] = None
    function_calls: List[FunctionCall] = []
    confidence_score: float = 1.0
    hitl_triggered: bool = False
    hitl_reason: Optional[str] = None
    model_used: str = "gpt-4o"
    latency_ms: int = 0

class TenantAIConfig(BaseModel):
    tenant_id: str
    voice_enabled: bool = True
    voice_id: str = "elevenlabs_default"
    language: str = "fr"  # fr | ar | darija
    hitl_threshold: float = 0.70
    safety_mode: bool = False
    system_prompt: Optional[str] = None
    hitl_keywords: List[str] = ["remboursement", "arnaque", "problème", "avocat"]
