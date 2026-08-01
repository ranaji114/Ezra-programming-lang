'use client';
import { useState, useRef } from 'react';

const EXAMPLES = {
  'Hello World': 'say "Hello, World!"',
  'Variables': 'name is "Ankur"\nage is 25\nsay "Hello {name}, age {age}"',
  'Conditions': 'age is 20\ncheck if age >= 18\n  say "Adult"\notherwise\n  say "Minor"',
  'Functions': 'give add(a, b)\n  -> a + b\nsay add(3, 4)',
  'Lists': 'nums is [1, 2, 3, 4, 5]\nevens is nums.filter(n -> n % 2 is 0)\nsay evens',
  'FizzBuzz': 'for each i in range(1, 21)\n  check if i % 15 is 0\n    say "FizzBuzz"\n  otherwise if i % 3 is 0\n    say "Fizz"\n  otherwise if i % 5 is 0\n    say "Buzz"\n  otherwise\n    say i',
};

/* ── Simple Ezra interpreter ── */
function evalExpr(expr, env) {
  expr = expr.trim();
  if (!expr) return '';

  // String literal with interpolation
  if ((expr.startsWith('"') && expr.endsWith('"')) ||
      (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1).replace(/\{(\w+)\}/g, (_, k) => (k in env ? env[k] : k));
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);

  // Boolean / null literals
  if (expr === 'yes') return true;
  if (expr === 'no') return false;
  if (expr === 'nothing') return null;

  // Array literal
  if (expr.startsWith('[') && expr.endsWith(']')) {
    const inner = expr.slice(1, -1).trim();
    if (!inner) return [];
    // simple split on commas not inside brackets
    const items = [];
    let depth = 0, cur = '';
    for (const ch of inner) {
      if (ch === '[' || ch === '(') depth++;
      else if (ch === ']' || ch === ')') depth--;
      if (ch === ',' && depth === 0) { items.push(evalExpr(cur.trim(), env)); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) items.push(evalExpr(cur.trim(), env));
    return items;
  }

  // Method call: expr.method(args)
  const methodMatch = expr.match(/^(.+?)\.(filter|map|len|push|pop|join|slice|reverse)\((.*)?\)$/);
  if (methodMatch) {
    const obj = evalExpr(methodMatch[1], env);
    const method = methodMatch[2];
    const rawArg = (methodMatch[3] || '').trim();
    if (method === 'len') return Array.isArray(obj) ? obj.length : String(obj).length;
    if (Array.isArray(obj)) {
      if (method === 'reverse') return [...obj].reverse();
      if (method === 'join') {
        const sep = rawArg ? evalExpr(rawArg, env) : ',';
        return obj.join(sep);
      }
      if (method === 'filter' && rawArg.includes('->')) {
        const [param, body] = rawArg.split('->').map(s => s.trim());
        return obj.filter(v => {
          const tmpEnv = { ...env, [param]: v };
          return !!evalExpr(body, tmpEnv);
        });
      }
      if (method === 'map' && rawArg.includes('->')) {
        const [param, body] = rawArg.split('->').map(s => s.trim());
        return obj.map(v => {
          const tmpEnv = { ...env, [param]: v };
          return evalExpr(body, tmpEnv);
        });
      }
    }
  }

  // range(start, end)
  const rangeMatch = expr.match(/^range\((\d+),\s*(\d+)\)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  // Variable lookup
  if (/^[a-zA-Z_]\w*$/.test(expr) && expr in env) return env[expr];

  // Simple arithmetic: handle + - * / % with left-to-right precedence
  // We try addition/subtraction first (lowest), then mul/div/mod
  // Scan right-to-left for + or - outside parens
  let depth2 = 0;
  for (let i = expr.length - 1; i >= 0; i--) {
    const ch = expr[i];
    if (ch === ')' || ch === ']') depth2++;
    else if (ch === '(' || ch === '[') depth2--;
    if (depth2 === 0 && (ch === '+' || ch === '-') && i > 0) {
      const left = evalExpr(expr.slice(0, i), env);
      const right = evalExpr(expr.slice(i + 1), env);
      if (typeof left === 'number' && typeof right === 'number') {
        return ch === '+' ? left + right : left - right;
      }
      if (ch === '+') return String(left) + String(right);
      return left;
    }
  }

  // * / %
  depth2 = 0;
  for (let i = expr.length - 1; i >= 0; i--) {
    const ch = expr[i];
    if (ch === ')' || ch === ']') depth2++;
    else if (ch === '(' || ch === '[') depth2--;
    if (depth2 === 0 && (ch === '*' || ch === '/' || ch === '%')) {
      const left = evalExpr(expr.slice(0, i), env);
      const right = evalExpr(expr.slice(i + 1), env);
      if (typeof left === 'number' && typeof right === 'number') {
        if (ch === '*') return left * right;
        if (ch === '/') return right !== 0 ? left / right : 'error: division by zero';
        if (ch === '%') return ((left % right) + right) % right;
      }
    }
  }

  // Comparison operators
  const cmpMatch = expr.match(/^(.+?)\s*(>=|<=|!=|is not|is|>|<)\s*(.+)$/);
  if (cmpMatch) {
    const left = evalExpr(cmpMatch[1], env);
    const right = evalExpr(cmpMatch[3], env);
    switch (cmpMatch[2].trim()) {
      case 'is': return left == right;  // eslint-disable-line eqeqeq
      case 'is not': return left != right;  // eslint-disable-line eqeqeq
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '!=': return left !== right;
    }
  }

  // Variable still in env (catch-all)
  if (expr in env) return env[expr];
  return expr;
}

function runEzra(code) {
  const lines = code.split('\n');
  const output = [];
  const env = {};
  const functions = {};

  function displayVal(v) {
    if (v === null) return 'nothing';
    if (v === true) return 'yes';
    if (v === false) return 'no';
    if (Array.isArray(v)) return '[' + v.map(displayVal).join(', ') + ']';
    return String(v);
  }

  let i = 0;
  const MAX_ITER = 200;
  let iterCount = 0;

  function execBlock(lines, startIdx, baseEnv) {
    // Execute an indented block starting at startIdx, returns [lastIdx, result]
    const blockEnv = { ...baseEnv };
    let idx = startIdx;
    while (idx < lines.length) {
      const raw = lines[idx];
      if (raw.trim() === '' || raw.trim().startsWith('#')) { idx++; continue; }
      // Stop if dedented
      const indent = raw.match(/^(\s*)/)[1].length;
      if (indent === 0 && startIdx > 0) break;
      idx = execLine(lines, idx, blockEnv);
    }
    return idx;
  }

  function execLine(lines, idx, localEnv) {
    iterCount++;
    if (iterCount > MAX_ITER) throw new Error('Max iterations reached (infinite loop guard)');
    const raw = lines[idx];
    if (!raw || raw.trim() === '' || raw.trim().startsWith('#')) return idx + 1;
    const line = raw.trim();

    // say
    if (line.startsWith('say ')) {
      const expr = line.slice(4).trim();
      output.push(displayVal(evalExpr(expr, localEnv)));
      return idx + 1;
    }

    // give (function definition) — single line body only for simplicity
    if (line.startsWith('give ')) {
      const header = line.slice(5).trim();
      const fnMatch = header.match(/^(\w+)\(([^)]*)\)$/);
      if (fnMatch) {
        const fnName = fnMatch[1];
        const params = fnMatch[2].split(',').map(p => p.trim()).filter(Boolean);
        // Collect body lines (indented)
        const bodyLines = [];
        let bi = idx + 1;
        while (bi < lines.length && lines[bi].match(/^\s+/)) {
          bodyLines.push(lines[bi].trim());
          bi++;
        }
        functions[fnName] = { params, body: bodyLines };
        localEnv[fnName] = (...args) => {
          const fnEnv = { ...localEnv, ...functions };
          params.forEach((p, pi) => { fnEnv[p] = args[pi]; });
          let ret = undefined;
          for (const bl of bodyLines) {
            if (bl.startsWith('-> ')) { ret = evalExpr(bl.slice(3), fnEnv); break; }
            else if (bl.startsWith('say ')) {
              output.push(displayVal(evalExpr(bl.slice(4), fnEnv)));
            } else if (/^[a-zA-Z_]\w*\s+is\s+/.test(bl)) {
              const m = bl.match(/^([a-zA-Z_]\w*)\s+is\s+(.+)$/);
              if (m) fnEnv[m[1]] = evalExpr(m[2], fnEnv);
            }
          }
          return ret;
        };
        return bi;
      }
    }

    // Assignment: name is value
    const assignMatch = line.match(/^([a-zA-Z_]\w*)\s+is\s+(.+)$/);
    if (assignMatch && !line.startsWith('check') && !line.startsWith('for') && !line.startsWith('otherwise')) {
      const val = evalExpr(assignMatch[2], localEnv);
      localEnv[assignMatch[1]] = val;
      env[assignMatch[1]] = val;
      return idx + 1;
    }

    // check if / otherwise
    if (line.startsWith('check if ')) {
      const cond = line.slice(9).trim();
      const result = evalExpr(cond, localEnv);
      // collect then-block
      let bi = idx + 1;
      const thenLines = [];
      while (bi < lines.length && lines[bi].match(/^\s+/)) {
        thenLines.push(lines[bi]);
        bi++;
      }
      // look for otherwise
      const elseLines = [];
      if (bi < lines.length && lines[bi].trim().startsWith('otherwise')) {
        bi++;
        while (bi < lines.length && lines[bi].match(/^\s+/)) {
          elseLines.push(lines[bi]);
          bi++;
        }
      }
      if (result) {
        execBlock(thenLines, 0, localEnv);
      } else if (elseLines.length) {
        execBlock(elseLines, 0, localEnv);
      }
      return bi;
    }

    // for each i in range / list
    const forMatch = line.match(/^for each (\w+) in (.+)$/);
    if (forMatch) {
      const varName = forMatch[1];
      const iterableExpr = forMatch[2].trim();
      const iterable = evalExpr(iterableExpr, localEnv);
      // collect body
      let bi = idx + 1;
      const bodyRawLines = [];
      const baseIndent = raw.match(/^(\s*)/)[1].length;
      while (bi < lines.length) {
        const bl = lines[bi];
        if (!bl.trim()) { bi++; continue; }
        const blIndent = bl.match(/^(\s*)/)[1].length;
        if (blIndent <= baseIndent) break;
        bodyRawLines.push(bl);
        bi++;
      }
      if (Array.isArray(iterable)) {
        for (const item of iterable) {
          if (iterCount > MAX_ITER) break;
          const loopEnv = { ...localEnv, [varName]: item };
          execBlock(bodyRawLines, 0, loopEnv);
          // propagate mutations
          Object.assign(localEnv, loopEnv);
        }
      }
      return bi;
    }

    // Function call: name(args)
    const callMatch = line.match(/^([a-zA-Z_]\w*)\(([^)]*)\)$/);
    if (callMatch && callMatch[1] in localEnv && typeof localEnv[callMatch[1]] === 'function') {
      const args = callMatch[2].split(',').map(a => evalExpr(a.trim(), localEnv));
      localEnv[callMatch[1]](...args);
    }

    return idx + 1;
  }

  try {
    while (i < lines.length) {
      i = execLine(lines, i, env);
    }
  } catch (e) {
    output.push('error: ' + e.message);
  }

  return output.join('\n') || '(no output)';
}

export default function PlaygroundPage() {
  const [code, setCode] = useState(EXAMPLES['Hello World']);
  const [output, setOutput] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [selectedExample, setSelectedExample] = useState('Hello World');
  const textareaRef = useRef(null);

  const handleRun = () => {
    try {
      const result = runEzra(code);
      setOutput(result);
    } catch (e) {
      setOutput('error: ' + e.message);
    }
    setHasRun(true);
  };

  const handleExampleChange = (e) => {
    const name = e.target.value;
    setSelectedExample(name);
    setCode(EXAMPLES[name]);
    setOutput('');
    setHasRun(false);
  };

  const handleKeyDown = (e) => {
    // Tab key inserts spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.slice(0, start) + '  ' + code.slice(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    // Ctrl+Enter runs
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <p className="page-hero-tag">Playground</p>
          <h1>Ezra Playground</h1>
          <p>Write and run Ezra code directly in your browser. No installation needed.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <label htmlFor="example-select" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              Example:
            </label>
            <select
              id="example-select"
              className="playground-select"
              value={selectedExample}
              onChange={handleExampleChange}
            >
              {Object.keys(EXAMPLES).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button className="run-btn" onClick={handleRun}>
              ▶ Run
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              Ctrl+Enter to run
            </span>
          </div>

          {/* Editor + Output */}
          <div className="playground-layout">
            {/* Editor */}
            <div className="playground-editor">
              <div className="playground-header">
                <span className="playground-header-title">editor.ez</span>
                <span style={{ fontSize: '0.7rem', color: '#6e7681' }}>Ezra</span>
              </div>
              <textarea
                ref={textareaRef}
                className="playground-textarea"
                value={code}
                onChange={e => { setCode(e.target.value); setHasRun(false); }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="Ezra code editor"
              />
            </div>

            {/* Output */}
            <div className="playground-output">
              <div className="playground-header">
                <span className="playground-header-title">output</span>
                {hasRun && (
                  <span style={{ fontSize: '0.7rem', color: '#56d364' }}>● ran</span>
                )}
              </div>
              <div className="playground-output-body">
                {hasRun ? (
                  <span style={{ color: output.startsWith('error:') ? '#f85149' : '#e6edf3' }}>
                    {output}
                  </span>
                ) : (
                  <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
                    Press ▶ Run to see output
                  </span>
                )}
              </div>
              <div className="playground-note">
                ⚠ Browser playground runs a simplified Ezra subset. Download Ezra for full language support.
              </div>
            </div>
          </div>

          {/* Help */}
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Supported in playground</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                <code>say</code>, variables (<code>is</code>), arithmetic (+, -, *, /, %),
                comparisons, <code>check if</code> / <code>otherwise</code>,
                <code>for each</code> loops, functions (<code>give</code>), lists,
                <code>filter</code>, <code>map</code>, <code>range</code>
              </p>
            </div>
            <div style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--brand)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Want full Ezra?</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-body)', margin: '0 0 0.75rem' }}>
                The playground runs a browser simulation. Download the real Ezra runtime for file I/O, error handling, JSON, and more.
              </p>
              <a href="/download" className="btn btn-primary btn-sm">Download Ezra</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
