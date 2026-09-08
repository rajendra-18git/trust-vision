from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.dataset import router as dataset_router
from app.api.model import router as model_router
from app.api.inference import router as inference_router
from app.api.assistant import router as assistant_router


app = FastAPI(
    title="TrustVision — AI Integrity Assurance & Forensics Backend",
    description="Integrity assurance framework for datasets, models, inference outputs, and AI investigation",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(dataset_router)
app.include_router(model_router)
app.include_router(inference_router)
app.include_router(assistant_router)
app.include_router(assistant_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "TrustVision Integrity Assurance Backend",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }