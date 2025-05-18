// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run-python", async (req, res) => {
  const { code, input } = req.body;
  const id = uuidv4();
  const workdir = path.join(tmpdir(), `code-${id}`);

  try {
    await fs.mkdir(workdir);
    const codeFile = path.join(workdir, "script.py");
    const inputFile = path.join(workdir, "input.txt");

    await fs.writeFile(codeFile, code);
    await fs.writeFile(inputFile, input);

    const cmd = `docker run --rm -i -v ${workdir}:/code -w /code python:3.11-slim bash -c "timeout 5 python script.py < input.txt"`;

    exec(cmd, { timeout: 7000 }, (error, stdout, stderr) => {
      if (error) {
        let errMsg = error.killed ? "Execution timed out" : error.message;
        res.json({ output: stdout, error: errMsg || stderr });
      } else {
        res.json({ output: stdout, error: stderr });
      }
      // Cleanup
      fs.rm(workdir, { recursive: true, force: true });
    });
  } catch (e) {
    res.json({ output: "", error: e.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
