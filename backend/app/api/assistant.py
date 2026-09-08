from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.assistant_service import assistant_service

router = APIRouter(
    prefix="/assistant",
    tags=["AI Investigator Assistant"]
)

class AssistantChatRequest(BaseModel):
    message: str = Field(..., description="User query or quick-action prompt", min_length=1, max_length=2000)
    analysis_id: Optional[str] = Field(None, description="Analysis record ID e.g. VAL-123456")
    analysis_context: Optional[Dict[str, Any]] = Field(None, description="Analysis result object containing evidence fields")
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="Chat history context")

class AssistantChatResponse(BaseModel):
    reply: str
    evidence_used: Dict[str, Any]
    timestamp: str
    provider: str

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(request: AssistantChatRequest):
    """
    Query the Trust Vision AI Investigator regarding the current file analysis.
    The assistant analyzes structured evidence (hashes, model predictions, metadata, detected issues)
    and provides clear explanations grounded strictly in the backend evidence.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message content cannot be empty."
        )

    try:
        result = await assistant_service.generate_response(
            message=request.message,
            analysis_data=request.analysis_context,
            chat_history=request.history
        )

        return AssistantChatResponse(
            reply=result["reply"],
            evidence_used=result["evidence_used"],
            timestamp=datetime.utcnow().isoformat() + "Z",
            provider=result.get("provider", "FORENSIC_EVIDENCE_ENGINE")
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Investigator is temporarily unavailable: {str(e)}"
        )
