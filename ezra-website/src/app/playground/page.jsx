'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function PlaygroundPage() {
  const [code, setCode] = useState(`// Ezra Playground
// Write your code here

name is input "What is your name? "
say "Hello, {name}!"

// Try some examples:
// - say "Hello, World!"
// - for i in 1..5 { say i }
// - nums is [1, 2, 3]
//   say nums.filter(n -> n % 2 is 0)`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [consoleMessages, setConsoleMessages] = useState([]);

  const exampleCodes = {
    hello: `say "Hello, World!"`,
    variables: `name is "Ezra"
age is 1
version is "1.0.0"
say "{name} v{version} is {age} year old"`,
    function: `give add(a, b)
  -> a + b

say "3 + 4 = " + add(3, 4)`,
    loop: `for i in 1..5
  say "Number: {i}"`,
    condition: `age is 25
check if age >= 18
  say "Adult"
otherwise
  say "Minor"`,
    fizzbuzz: `for i in 1..20
  check if i % 15 is 0
    say "FizzBuzz"
  otherwise if i % 3 is 0
    say "Fizz"
  otherwise if i % 5 is 0
    say "Buzz"
  otherwise
    say i`,
  };

  const runCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput('');
    setConsoleMessages([]);

    try {
      addToConsole('Running...', 'info');

      await new Promise(resolve => setTimeout(resolve, 500));

      addToConsole('Note: Online execution coming soon!', 'warning');
      addToConsole('For now, please download Ezra to run code locally.', 'info');

    } catch (err) {
      setError(err.message);
      addToConsole(`Error: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const addToConsole = (message, type = 'log') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleMessages(prev => [...prev, { timestamp, message, type }]);
  };

  const clearConsole = () => {
    setConsoleMessages([]);
    setOutput('');
    setError(null);
  };

  const loadExample = (exampleKey) => {
    setCode(exampleCodes[exampleKey]);
    clearConsole();
  };

  const handleEditorChange = (newValue) => {
    setCode(newValue);
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra Online Playground</h1>
            <p>
              Write, run, and experiment with Ezra code directly in your browser.
              No installation required!
            </p>
          </div>

          <div className="playground-layout">
            <div className="editor-container">
              <div className="editor-header">
                <div className="editor-tabs">
                  <button className="editor-tab active">
                    <span>code.ez</span>
                  </button>
                </div>
                <div className="editor-actions">
                  <div className="example-dropdown">
                    <button className="btn btn-secondary">
                      Examples ▼
                    </button>
                    <div className="example-menu">
                      {Object.entries(exampleCodes).map(([key, value]) => (
                        <button
                          key={key}
                          className="example-item"
                          onClick={() => loadExample(key)}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={clearConsole}
                    disabled={consoleMessages.length === 0}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="editor-wrapper">
                <Editor
                  height="400px"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={handleEditorChange}
                  theme="light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                  }}
                  beforeMount={(monaco) => {
                    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                      allowNonTsExtensions: true,
                    });
                  }}
                />
              </div>

              <div className="run-button-container">
                <button
                  className="btn btn-primary btn-run"
                  onClick={runCode}
                  disabled={isRunning}
                >
                  {isRunning ? 'Running...' : 'Run Code (Ctrl+Enter)'}
                </button>
              </div>
            </div>

            <div className="output-container">
              <div className="output-header">
                <span>Console</span>
                <button
                  className="clear-btn"
                  onClick={clearConsole}
                >
                  Clear
                </button>
              </div>
              <div className="output-content">
                {consoleMessages.length === 0 ? (
                  <div className="empty-state">
                    <p>Run your code to see output here</p>
                    <p className="muted">
                      Or try one of the examples from the menu above
                    </p>
                  </div>
                ) : (
                  consoleMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`console-line console-${msg.type}`}
                    >
                      <span className="timestamp">{msg.timestamp}</span>
                      <span className="message">{msg.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Features Info */}
      <section className="section section-alt">
        <div className="container">
          <div className="features-info">
            <div className="feature-item">
              <h3>✅ Syntax Highlighting</h3>
              <p>Full Ezra syntax highlighting in the editor</p>
            </div>
            <div className="feature-item">
              <h3>📝 Code Templates</h3>
              <p>Start with pre-loaded examples</p>
            </div>
            <div className="feature-item">
              <h3>🎯 Instant Feedback</h3>
              <p>See results immediately (coming soon)</p>
            </div>
            <div className="feature-item">
              <h3>💾 Save & Share</h3>
              <p>Save your code snippets and share with others</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Note */}
      <section className="section">
        <div className="container">
          <div className="alert alert-info">
            <strong>Note:</strong> The online playground currently provides syntax
            highlighting and code editing. For full execution, please{' '}
            <a href="/download">download Ezra</a> and run it locally. Online
            execution support is coming soon!
          </div>
        </div>
      </section>

      <style jsx>{`
        .playground-layout {
          display: grid;
          gap: 1.5rem;
        }

        .editor-container {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .editor-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .editor-tab {
          padding: 0.25rem 0.75rem;
          background: transparent;
          border: none;
          font-size: 0.875rem;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .editor-tab.active {
          color: var(--color-text);
        }

        .editor-actions {
          display: flex;
          gap: 0.5rem;
        }

        .example-dropdown {
          position: relative;
        }

        .example-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          min-width: 150px;
          z-index: 100;
          box-shadow: var(--shadow-lg);
        }

        .example-dropdown:hover .example-menu {
          display: block;
        }

        .example-item {
          display: block;
          width: 100%;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--color-text);
          transition: background var(--transition-fast);
        }

        .example-item:hover {
          background: var(--color-bg-secondary);
        }

        .editor-wrapper {
          height: 400px;
        }

        .editor-wrapper :global(.monaco-editor) {
          border-radius: 0 !important;
        }

        .run-button-container {
          padding: 1rem;
          text-align: center;
          border-top: 1px solid var(--color-border);
        }

        .btn-run {
          font-size: 1.1rem;
          padding: 0.75rem 2rem;
        }

        .output-container {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .clear-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .clear-btn:hover {
          color: var(--color-primary);
        }

        .output-content {
          height: 200px;
          overflow-y: auto;
          padding: 1rem;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          background: var(--color-code-bg);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-muted);
        }

        .empty-state .muted {
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .console-line {
          padding: 0.25rem 0;
          border-bottom: 1px solid transparent;
          border-bottom-color: rgba(0, 0, 0, 0.05);
          white-space: pre-wrap;
          word-break: break-all;
        }

        .console-line.console-info {
          color: var(--color-info);
        }

        .console-line.console-warning {
          color: var(--color-warning);
        }

        .console-line.console-error {
          color: var(--color-error);
        }

        .timestamp {
          color: var(--color-text-muted);
          margin-right: 0.75rem;
          font-size: 0.75rem;
        }

        .message {
          font-size: 0.875rem;
        }

        .features-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          text-align: center;
        }

        .feature-item h3 {
          margin-bottom: 0.5rem;
        }

        .feature-item p {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .editor-header {
            flex-direction: column;
            align-items: stretch;
          }

          .editor-actions {
            justify-content: flex-end;
          }

          .output-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
