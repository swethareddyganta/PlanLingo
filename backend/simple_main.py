from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Daily Flow API",
    description="Daily Flow Backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Daily Flow API is running!", "status": "success"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/v1/test")
async def test():
    return {"message": "API is working!", "data": {"test": True}}
