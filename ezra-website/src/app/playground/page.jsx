'use client';
import { useState, useRef } from 'react';

const EXAMPLES = {
  'Hello World': 'say "Hello, World!"',
  'Variables': 'name is "Ankur"\nage is 25\nsay "Hello {name}, you are {age} years old"',
  'Conditions': 'age is 20\ncheck if age >= 18\n  say "Adult"\notherwise\n  say "Minor"',
  'Functions': 'give add(a, b)\n  -> a + b\n\ngive square(n)\n  -> n * n\n\nsay add(3, 4)\nsay square(7)',
  'Lists': 'nums is [1, 2, 3, 4, 5]\nsay nums[0]\nsay nums.length\nevens is nums.filter(n -> n % 2 is 0)\nsay evens\ntotal is nums.sum()\nsay total',
  'FizzBuzz': 'i is 1\nwhile i <= 20\n  check if i % 15 is 0\n    say "FizzBuzz"\n  otherwise if i % 3 is 0\n    say "Fizz"\n  otherwise if i % 5 is 0\n    say "Buzz"\n  otherwise\n    say i\n  i += 1',
  'Error Handling': 'try\n  x is 10 / 0\ncatch err\n  say "Caught: {err}"\nfinally\n  say "Done"',
};

/* ── Browser Ezra interpreter ─────────────────────────────────────── */
function runEzra(source) {
  const lines = source.split('\n');
  const output = [];
  const env = Object.create(null);
  let i = 0;

  function err(msg) { throw new Error(msg); }

  function evalVal(raw) {
    raw = raw.trim();
    if (!raw) return '';
    // string with interpolation
    if (raw.startsWith('"') && raw.endsWith('"')) {
      return raw.slice(1, -1).replace(/\{([^}]+)\}/g, (_, k) => {
        const v = env[k.trim()];
        return v !== undefined ? String(v) : k;
      });
    }
    if (raw === 'yes' || raw === 'true') return true;
    if (raw === 'no' || raw === 'false') return false;
    if (raw === 'nothing') return null;
    // list literal
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map(e => evalVal(e.trim()));
    }
    // simple arithmetic / comparison (basic)
    const num = Number(raw);
    if (!isNaN(num)) return num;
    // variable
    if (/^[a-zA-Z_]\w*$/.test(raw)) {
      if (raw in env) return env[raw];
      return raw;
    }
    // property access: val.method()
    const dotCall = raw.match(/^(\w+)\.(length|sum|is_empty)\(\)$/);
    if (dotCall) {
      const v = env[dotCall[1]];
      if (dotCall[2] === 'length') return Array.isArray(v) ? v.length : (String(v).length);
      if (dotCall[2] === 'sum') return Array.isArray(v) ? v.reduce((a, b) => a + b, 0) : 0;
      if (dotCall[2] === 'is_empty') return Array.isArray(v) ? v.length === 0 : !v;
    }
    // index: name[N]
    const idx = raw.match(/^(\w+)\[(\d+)\]$/);
    if (idx) { const v = env[idx[1]]; if (Array.isArray(v)) return v[Number(idx[2])]; }
    // filter/map with arrow fn
    const filterMatch = raw.match(/^(\w+)\.filter\((\w+)\s*->\s*(.+)\)$/);
    if (filterMatch) {
      const arr = env[filterMatch[1]];
      if (Array.isArray(arr)) {
        const param = filterMatch[2], body = filterMatch[3];
        return arr.filter(item => { env[param] = item; return !!evalExpr(body); });
      }
    }
    const mapMatch = raw.match(/^(\w+)\.map\((\w+)\s*->\s*(.+)\)$/);
    if (mapMatch) {
      const arr = env[mapMatch[1]];
      if (Array.isArray(arr)) {
        const param = mapMatch[2], body = mapMatch[3];
        return arr.map(item => { env[param] = item; return evalExpr(body); });
      }
    }
    // try expression eval
    try { return evalExpr(raw); } catch { return raw; }
  }

  function evalExpr(expr) {
    expr = expr.trim();
    if (/^(\w+)\s*%\s*(\w+|\d+)\s*is\s*(\d+)$/.test(expr)) {
      const m = expr.match(/^(\w+)\s*%\s*(\w+|\d+)\s*is\s*(\d+)$/);
      return (evalVal(m[1]) % evalVal(m[2])) === Number(m[3]);
    }
    if (/\s+(>=|<=|==|!=|is|>|<)\s+/.test(expr)) {
      const ops = ['>=', '<=', '==', '!=', 'is', '>', '<'];
      for (const op of ops) {
        const parts = expr.split(new RegExp(`\\s+${op === 'is' ? 'is' : op.replace(/[><=!]/g, '\\$&')}\\s+`));
        if (parts.length === 2) {
          const a = evalVal(parts[0]), b = evalVal(parts[1]);
          if (op === '>=' || op === 'is' && typeof a === 'number') return a >= (typeof b === 'number' ? b : evalVal(parts[1]));
          if (op === '>=') return Number(a) >= Number(b);
          if (op === '<=') return Number(a) <= Number(b);
          if (op === '>') return Number(a) > Number(b);
          if (op === '<') return Number(a) < Number(b);
          if (op === '==' || op === 'is') return a == b;
          if (op === '!=') return a != b;
        }
      }
    }
    if (/\s*\+\s*/.test(expr) && !expr.startsWith('"')) {
      const parts = expr.split(/\s*\+\s*/);
      return parts.reduce((acc, p) => { const v = evalVal(p.trim()); return typeof acc === 'number' && typeof v === 'number' ? acc + v : String(acc) + String(v); }, evalVal(parts[0].trim()));
    }
    if (/\s*-\s*/.test(expr)) {
      const parts = expr.split(/\s*-\s*/);
      if (parts.length === 2) return Number(evalVal(parts[0])) - Number(evalVal(parts[1]));
    }
    if (/\s*\*\s*/.test(expr)) {
      const parts = expr.split(/\s*\*\s*/);
      if (parts.length === 2) return Number(evalVal(parts[0])) * Number(evalVal(parts[1]));
    }
    if (/\s*\/\s*/.test(expr)) {
      const parts = expr.split(/\s*\/\s*/);
      if (parts.length === 2) {
        const b = Number(evalVal(parts[1]));
        if (b === 0) err('divide by zero');
        return Number(evalVal(parts[0])) / b;
      }
    }
    if (/\s*%\s*/.test(expr)) {
      const parts = expr.split(/\s*%\s*/);
      if (parts.length === 2) return Number(evalVal(parts[0])) % Number(evalVal(parts[1]));
    }
    return evalVal(expr);
  }

  function fmt(v) {
    if (v === null) return 'nothing';
    if (v === true) return 'yes';
    if (v === false) return 'no';
    if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
    return String(v);
  }

  function getIndent(line) { return line.match(/^(\s*)/)[1].length; }

  function execBlock(start, minIndent) {
    let pos = start;
    while (pos < lines.length) {
      const line = lines[pos];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) { pos++; continue; }
      const indent = getIndent(line);
      if (indent < minIndent) break;

      // say
      if (trimmed.startsWith('say ')) {
        output.push(fmt(evalVal(trimmed.slice(4).trim())));
        pos++; continue;
      }
      // assignment: name is expr  OR  name += expr
      const compoundMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
      if (compoundMatch) {
        const [, name, op, rhs] = compoundMatch;
        const cur = Number(env[name] || 0), val = Number(evalVal(rhs));
        env[name] = op === '+=' ? cur + val : op === '-=' ? cur - val : op === '*=' ? cur * val : cur / val;
        pos++; continue;
      }
      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s+is\s+(.+)$/);
      if (assignMatch && !trimmed.startsWith('check') && !trimmed.startsWith('for') && !trimmed.startsWith('while')) {
        env[assignMatch[1]] = evalVal(assignMatch[2]);
        pos++; continue;
      }
      // check if
      if (trimmed.startsWith('check if ')) {
        const cond = trimmed.slice(9).trim();
        const condResult = evalExpr(cond);
        pos++;
        const blockIndent = pos < lines.length ? getIndent(lines[pos]) : minIndent + 2;
        if (blockIndent > indent) {
          const blockEnd = execBlock(pos, blockIndent);
          if (condResult) { pos = blockEnd; } else { pos = blockEnd; }
          // skip otherwise blocks if condition was true
          while (pos < lines.length) {
            const nxt = lines[pos].trim();
            if (nxt.startsWith('otherwise')) {
              pos++;
              const ob = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
              if (ob > indent) {
                if (!condResult) pos = execBlock(pos, ob);
                else { while (pos < lines.length && getIndent(lines[pos]) > indent) pos++; }
              }
            } else break;
          }
        }
        continue;
      }
      // while
      if (trimmed.startsWith('while ')) {
        const cond = trimmed.slice(6).trim();
        pos++;
        const bi = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
        const bodyStart = pos;
        let iters = 0;
        while (evalExpr(cond) && iters++ < 500) {
          pos = execBlock(bodyStart, bi);
        }
        while (pos < lines.length && getIndent(lines[pos]) > indent) pos++;
        continue;
      }
      // for each N in list
      const forMatch = trimmed.match(/^for each\s+(\w+)\s+in\s+(.+)$/);
      if (forMatch) {
        const [, varName, listExpr] = forMatch;
        const list = evalVal(listExpr.trim());
        pos++;
        const bi = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
        const bodyStart = pos;
        if (Array.isArray(list)) {
          for (const item of list.slice(0, 200)) {
            env[varName] = item;
            pos = execBlock(bodyStart, bi);
          }
        }
        while (pos < lines.length && getIndent(lines[pos]) > indent) pos++;
        continue;
      }
      // give (function def — skip body)
      if (trimmed.startsWith('give ')) {
        const fnMatch = trimmed.match(/^give\s+(\w+)\s*\(([^)]*)\)$/);
        if (fnMatch) {
          const fnName = fnMatch[1], params = fnMatch[2].split(',').map(p => p.trim()).filter(Boolean);
          pos++;
          const bi = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
          const bodyLines = [];
          while (pos < lines.length && getIndent(lines[pos]) >= bi) { bodyLines.push(lines[pos]); pos++; }
          env[fnName] = { __fn: true, params, body: bodyLines, baseIndent: bi };
        } else pos++;
        continue;
      }
      // function call
      const callMatch = trimmed.match(/^(\w+)\(([^)]*)\)$/);
      if (callMatch) {
        const fn = env[callMatch[1]];
        if (fn && fn.__fn) {
          const args = callMatch[2].split(',').map(a => evalVal(a.trim()));
          const saved = {};
          fn.params.forEach((p, i) => { saved[p] = env[p]; env[p] = args[i]; });
          execBlock(0, fn.baseIndent);
          fn.params.forEach(p => { env[p] = saved[p]; });
        }
        pos++; continue;
      }
      // try/catch/finally
      if (trimmed === 'try') {
        pos++;
        const bi = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
        let caught = false, catchErr = null;
        try { pos = execBlock(pos, bi); }
        catch (e) { caught = true; catchErr = e.message; while (pos < lines.length && getIndent(lines[pos]) > indent) pos++; }
        if (lines[pos]?.trim().startsWith('catch')) {
          const catchVar = lines[pos].trim().match(/^catch\s+(\w+)/)?.[1];
          pos++;
          const cb = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
          if (caught) { if (catchVar) env[catchVar] = catchErr; pos = execBlock(pos, cb); }
          else { while (pos < lines.length && getIndent(lines[pos]) > indent) pos++; }
        }
        if (lines[pos]?.trim() === 'finally') {
          pos++;
          const fb = pos < lines.length ? getIndent(lines[pos]) : indent + 2;
          pos = execBlock(pos, fb);
        }
        continue;
      }
      pos++;
    }
    return pos;
  }

  try { execBlock(0, 0); }
  catch (e) { output.push(`error: ${e.message}`); }
  return output;
}
/* ─────────────────────────────────────────────────────────────────── */

export default function PlaygroundPage() {
  const [code, setCode] = useState(EXAMPLES['Hello World']);
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  const textareaRef = useRef(null);

  const run = () => {
    setRunning(true);
    try {
      const lines = runEzra(code);
      setOutput(lines);
    } catch (e) {
      setOutput([`error: ${e.message}`]);
    }
    setRunning(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  };

  return (
    <>
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '3rem 1.5rem 2.5rem', marginTop: '64px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Playground</h1>
          <p style={{ color: 'var(--text-3)', marginBottom: 0 }}>
            Write and run Ezra code directly in your browser. Uses a simplified interpreter —{' '}
            <a href="/download">download Ezra</a> for the full language.
          </p>
        </div>
      </div>

      <section style={{ padding: '2.5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          {/* toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600 }}>Examples:</label>
            <select
              className="example-select"
              onChange={e => { setCode(EXAMPLES[e.target.value]); setOutput([]); }}
              style={{ background: 'var(--bg-alt)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.65rem', fontSize: '0.85rem', fontFamily: 'var(--font)' }}
            >
              {Object.keys(EXAMPLES).map(k => <option key={k}>{k}</option>)}
            </select>
            <button className="run-btn" onClick={run} disabled={running} style={{ marginLeft: 'auto' }}>
              {running ? '⏳ Running…' : '▶ Run (Ctrl+Enter)'}
            </button>
            <button onClick={() => setOutput([])} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Clear output
            </button>
          </div>

          {/* editor + output */}
          <div className="playground-grid">
            <div className="playground-editor">
              <div className="playground-toolbar">
                <span style={{ color: '#8b949e', fontSize: '0.78rem', fontFamily: 'var(--mono)' }}>main.ez</span>
              </div>
              <textarea
                ref={textareaRef}
                className="code-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKey}
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Write Ezra code here..."
              />
            </div>
            <div className="playground-output">
              <div className="output-header">Output</div>
              <div className="output-body">
                {output.length === 0
                  ? <span style={{ color: '#8b949e' }}>Press ▶ Run to execute your code</span>
                  : output.map((line, i) => (
                    <div key={i} className={line.startsWith('error') ? 'output-line-err' : 'output-line-ok'}>
                      {line}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-3)' }}>
            ⚠ The browser playground supports a subset of Ezra: say, variables, conditions, loops, functions, lists, try/catch.{' '}
            <a href="/download">Download Ezra</a> for the complete language including file I/O, JSON, modules, and more.
          </p>
        </div>
      </section>
    </>
  );
}
