import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

function App() {
  const [code, setCode] = useState(`# Write Python code here\nprint("Hello, World!")`);
  const [input, setInput] = useState("");
  const [terminalLines, setTerminalLines] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  async function runCode() {
    setLoading(true);
    setTerminalLines((lines) => [
      ...lines,
      `> Input:\n${input || "(no input)"}`,
    ]);
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/run-python",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, input }),
        }
      );
      const data = await response.json();
      setTerminalLines((lines) =>
        [
          ...lines,
          data.output ? `> Output:\n${data.output}` : "> Output:\n(no output)",
          data.error ? `Error:\n${data.error}` : null,
        ].filter(Boolean)
      );
    } catch {
      setTerminalLines((lines) => [
        ...lines,
        "Error:\nError connecting to server",
      ]);
    }
    setLoading(false);
  }

  function clearTerminal() {
    setTerminalLines([]);
  }

  function copyTerminal() {
    if (terminalLines.length > 0) {
      navigator.clipboard.writeText(terminalLines.join("\n"));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
            alt="Python"
            className="w-12 h-12 drop-shadow-lg"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Mini Code Editor
          </h1>
        </div>
        <p className="mt-2 text-lg text-blue-200 font-medium tracking-wide">
          <span className="font-semibold text-yellow-300">Python Runner</span> - Write, test, and debug Python code instantly!
        </p>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-700 p-6 md:p-10 flex flex-col gap-6">
        {/* Editor */}
        <div>
          <label className="block text-blue-200 font-semibold mb-2 text-lg">
            Python Code
          </label>
          <div className="rounded-lg overflow-hidden border-2 border-blue-800 shadow-lg">
            <Editor
              height="35vh"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                lineNumbers: "on",
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "Fira Mono, monospace",
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                padding: { top: 12 },
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Input Toggle & Input Area */}
        <div>
          <button
            onClick={() => setShowInput((v) => !v)}
            className={`transition-all px-5 py-2 rounded-lg font-semibold shadow-sm border-2 ${
              showInput
                ? "bg-blue-900 border-blue-400 text-yellow-300"
                : "bg-slate-800 border-slate-600 text-blue-200 hover:bg-blue-900 hover:text-yellow-300"
            }`}
          >
            {showInput ? "Hide Input" : "Show Input"}
          </button>
          {showInput && (
            <textarea
              className="mt-3 w-full bg-slate-900 text-blue-200 rounded-lg p-3 font-mono border-2 border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Standard input (stdin)"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all focus:ring-2 focus:ring-yellow-300 disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-yellow-300"
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
              <>
                <span className="material-icons">play_arrow</span>
                Run Code
              </>
            )}
          </button>
          <button
            onClick={clearTerminal}
            className="px-6 py-2 rounded-lg font-bold bg-slate-800 text-blue-200 hover:bg-blue-900 hover:text-yellow-300 shadow transition"
          >
            Clear Terminal
          </button>
          <button
            onClick={copyTerminal}
            className="px-6 py-2 rounded-lg font-bold bg-yellow-300 text-blue-900 hover:bg-yellow-400 shadow transition"
          >
            Copy Output
          </button>
        </div>

        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="mt-6 bg-black/90 rounded-lg border-2 border-blue-800 p-4 h-56 md:h-64 overflow-y-auto font-mono text-base shadow-inner"
        >
          {terminalLines.length === 0 ? (
            <p className="text-gray-400 italic">
              Terminal is empty. Run code to see output.
            </p>
          ) : (
            terminalLines.map((line, i) => (
              <pre
                key={i}
                className={
                  line.startsWith("Error")
                    ? "text-red-400 bg-red-900/40 rounded px-2 py-1 mb-1"
                    : line.startsWith("> Input")
                    ? "text-yellow-300"
                    : line.startsWith("> Output")
                    ? "text-green-400"
                    : "text-blue-100"
                }
              >
                {line}
              </pre>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-blue-200 text-sm opacity-70">
        Made with <span className="text-yellow-300">Python</span> &amp; <span className="text-blue-400">React</span> | Internship Assignment
      </footer>
    </div>
  );
}

export default App;
