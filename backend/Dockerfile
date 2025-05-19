from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run")
async def run_code(request: Request):
    body = await request.json()
    code = body.get("code", "")
    user_input = body.get("input", "")

    try:
        # Save code to file
        with open("script.py", "w") as f:
            f.write(code)

        # Run the code with input
        result = subprocess.run(
            ["python", "script.py"],
            input=user_input,
            capture_output=True,
            text=True,
            timeout=10,
        )

        return {
            "output": result.stdout.strip(),
            "error": result.stderr.strip(),
        }

    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}
