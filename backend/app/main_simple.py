from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

app = FastAPI(
    title="Daily Flow API",
    description="API for Daily Flow - Turn vague daily intentions into structured timetables",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Daily Flow API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "daily-flow-api"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {"message": "API is working", "groq_key": "GROQ_API_KEY" in os.environ}

if __name__ == "__main__":
    uvicorn.run(
        "app.main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
