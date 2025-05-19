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
    <div className="min-h-screen bg-gray-100 py-6">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Python Code Runner
          </h1>
          <p className="text-gray-500 text-sm">
            Write and run Python code in your browser.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor */}
        <section className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Code Editor
          </h2>
          <Editor
            height="40vh"
            defaultLanguage="python"
            theme="light"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              lineNumbers: "on",
              minimap: { enabled: false },
              fontSize: 14,
            }}
            className="border rounded"
          />
        </section>

        {/* Input and Terminal */}
        <section className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Input and Output
          </h2>

          {/* Input Toggle */}
          <div className="mb-3">
            <button
              onClick={() => setShowInput(!showInput)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded"
            >
              {showInput ? "Hide Input" : "Show Input"}
            </button>
            {showInput && (
              <textarea
                className="w-full h-24 p-2 border rounded mt-2 text-sm"
                placeholder="Standard input (stdin)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            )}
          </div>

          {/* Terminal */}
          <div
            ref={terminalRef}
            className="bg-gray-50 p-3 rounded overflow-y-auto h-48 border text-sm"
          >
            {terminalLines.length === 0 ? (
              <p className="text-gray-400 italic">
                Terminal is empty. Run code to see output.
              </p>
            ) : (
              terminalLines.map((line, i) => (
                <pre key={i} className="whitespace-pre-wrap">
                  {line}
                </pre>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Buttons */}
      <footer className="container mx-auto mt-4 px-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={runCode}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? (
              <>
                Running...
              </>
            ) : (
              "Run Code"
            )}
          </button>
          <button
            onClick={clearTerminal}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
          >
            Clear Terminal
          </button>
          <button
            onClick={copyTerminal}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Copy Output
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
