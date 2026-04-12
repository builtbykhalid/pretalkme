import io
import os
import asyncio
from faster_whisper import WhisperModel
from utils.r2 import download_from_r2

# Global model instance
_model = None

def get_model() -> WhisperModel:
    global _model
    if _model is None:
        model_size = os.getenv("WHISPER_MODEL_SIZE", "base") 
        device = os.getenv("WHISPER_DEVICE", "cpu")
        _model = WhisperModel(
            model_size,
            device=device,
            compute_type="int8"
        )
    return _model

async def transcribe_from_url(audio_url: str, language_hint: str = None) -> dict:
    """
    Downloads audio from R2 and transcribes it.
    """
    audio_bytes = await download_from_r2(audio_url)
    return await transcribe(audio_bytes, language_hint)

async def transcribe(audio_bytes: bytes, language_hint: str = None) -> dict:
    model = get_model()
    audio_io = io.BytesIO(audio_bytes)

    loop = asyncio.get_event_loop()
    def _run_transcription():
        segments, info = model.transcribe(
            audio_io,
            language=language_hint,
            task="transcribe",
            vad_filter=True,
            beam_size=5,
        )
        text = " ".join([seg.text for seg in segments])
        return {
            "text": text.strip(),
            "language": info.language,
            "language_probability": info.language_probability,
        }

    return await loop.run_in_executor(None, _run_transcription)
