import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

function App() {
  const [code, setCode] = useState(`# Write Python code here
print("Hello, World!")`);
  const [input, setInput] = useState("");
  const [terminalLines, setTerminalLines] = useState([]);
  const [showInput, setShowInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  async function runCode() {
  setLoading(true);
  setTerminalLines((lines) => [...lines, `> Input:\n${input || "(no input)"}`]);

  try {
    const response = await fetch("https://python-runner-mini-code-editor-1.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, input }),
    });
    const data = await response.json();

    setTerminalLines((lines) =>
      [
        ...lines,
        data.output ? `> Output:\n${data.output}` : "> Output:\n(no output)",
        data.error ? `Error:\n${data.error}` : null,
      ].filter(Boolean)
    );
  } catch {
    setTerminalLines((lines) => [...lines, "Error:\nError connecting to server"]);
  }

  setLoading(false);
}

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full flex flex-col items-center gap-6 text-center px-6">

    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full flex flex-col items-center gap-6 text-center px-6">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          🐍 Mini Code Editor - Python Runner
        </h1>

        <div className="w-full flex justify-center">
          <Editor
            height="40vh"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              lineNumbers: "on",
              minimap: { enabled: false },
              fontSize: 14,
            }}
            className="w-full"
          />
        </div>

        {/* Moved Toggle Button back above input */}
        <button
          onClick={() => setShowInput(!showInput)}
          className="px-6 py-2 rounded font-semibold disabled:opacity-50 flex items-center gap-2 text-white"
          style={{ backgroundColor: "#191970" }}
        >
          {showInput ? "Hide Input" : "Show Input"}
        </button>

        {showInput && (
          <textarea
            className="bg-gray-800 p-3 rounded w-full font-mono text-white"
            placeholder="Standard input (stdin)"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}

        {/* Button Group with spacing */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {/* Run Code */}
          <button
            onClick={runCode}
            disabled={loading}
            className="px-6 py-2 rounded font-semibold disabled:opacity-50 flex items-center gap-2 text-white"
            style={{ backgroundColor: "#191970" }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Running...
              </>
            ) : (
              "Run Code"
            )}
          </button>

          {/* Clear Terminal */}
          <button
            onClick={() => setTerminalLines([])}
            className="px-6 py-2 rounded font-semibold disabled:opacity-50 flex items-center gap-2 text-white"
            style={{ backgroundColor: "#191970" }}
          >
            Clear Terminal
          </button>

          {/* Copy Output */}
          <button
            onClick={() => navigator.clipboard.writeText(terminalLines.join("\n"))}
            className="px-6 py-2 rounded font-semibold disabled:opacity-50 flex items-center gap-2 text-white"
            style={{ backgroundColor: "#191970" }}
          >
            Copy Terminal Output
          </button>
        </div>

        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="p-4 rounded font-mono h-64 overflow-y-auto whitespace-pre-wrap w-full mt-4 text-left border border-gray-700"
          style={{ backgroundColor: "black", color: "white" }}
        >
          {terminalLines.length === 0 ? (
            <p className="text-gray-500 italic">
              Terminal is empty. Run code to see output.
            </p>
          ) : (
            terminalLines.map((line, i) => (
              <pre
                key={i}
                className={
                  line.startsWith("Error")
                    ? "text-red-500 bg-red-900 rounded p-1"
                    : line.startsWith("> Input")
                    ? "text-yellow-300"
                    : line.startsWith("> Output")
                    ? "text-green-400"
                    : ""
                }
              >
                {line}
              </pre>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default App;
