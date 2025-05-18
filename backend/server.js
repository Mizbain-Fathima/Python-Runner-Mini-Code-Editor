import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run-python', (req, res) => {
  const { code, input } = req.body;

  // Spawn python process
  const python = spawn('python', ['-c', code]);

  let output = '';
  let error = '';

  // If input exists, write to python stdin
  if (input) {
    python.stdin.write(input);
  }
  python.stdin.end();

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    error += data.toString();
  });

  python.on('close', (code) => {
    res.json({ output, error });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
