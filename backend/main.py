from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://python-runner-frontend.onrender.com",  # <-- Use your actual frontend URL
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    input: str = ""

@app.post("/run-python")
def run_code(request: CodeRequest):
    try:
        process = subprocess.Popen(
            ["python", "-c", request.code],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        stdout, stderr = process.communicate(request.input, timeout=10)
        return {"output": stdout, "error": stderr}
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Backend is running!"}
