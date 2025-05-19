from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

# ✅ Add CORS Middleware for frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or limit to your frontend domain
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
            ["python3", "-c", request.code],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        stdout, stderr = process.communicate(request.input, timeout=10)
        return {"output": stdout, "error": stderr}
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}
