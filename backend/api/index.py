from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os

# Create the FastAPI app directly here
app = FastAPI(
    title="PlanLingo API",
    description="API for PlanLingo - Turn vague daily intentions into structured timetables",
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
    return {"message": "PlanLingo API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "planlingo-api"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {
        "message": "API is working", 
        "groq_key": "GROQ_API_KEY" in os.environ,
        "openai_key": "OPENAI_API_KEY" in os.environ
    }

# This is the entry point for Vercel using Mangum
handler = Mangum(app)