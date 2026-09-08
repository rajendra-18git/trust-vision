from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any

from app.services.inference_integrity import (
    calculate_inference_hash,
    verify_inference_integrity
)

router = APIRouter(
    prefix="/inference",
    tags=["Inference Integrity"]
)


@router.post("/hash")
async def generate_inference_hash(record: Dict[str, Any] = Body(...)):
    """Generate SHA-256 hash for an inference prediction record."""
    if not record:
        raise HTTPException(status_code=400, detail="Inference record is required")
    hash_val = calculate_inference_hash(record)
    return {
        "record": record,
        "sha256": hash_val,
        "status": "generated"
    }


@router.post("/verify")
async def verify_inference(payload: Dict[str, Any] = Body(...)):
    """Verify an inference record against an expected SHA-256 hash."""
    record = payload.get("record")
    expected_sha256 = payload.get("expected_sha256", "")
    
    if not record or not expected_sha256:
        raise HTTPException(status_code=400, detail="Both 'record' and 'expected_sha256' are required")

    return verify_inference_integrity(record, expected_sha256)
