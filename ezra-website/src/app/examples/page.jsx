'use client';
import { useState } from 'react';

const EXAMPLES = {
  Basics: [
    { title: 'Hello World', code: 'say "Hello, World!"' },
    { title: 'Variables', code: 'name is "Rana"\nage  is 25\nsay "Hello {name}, age {age}"' },
    { title: 'Text Interpolation', code: 'x is 42\nsay "The answer is {x}"\nsay "Double: {x * 2}"' },
    { title: 'Conditions', code: 'score is 85\ncheck if score >= 90\n  say "A"\notherwise if score >= 75\n  say "B"\notherwise\n  say "Try again"' },
  ],
  Functions: [
    { title: 'Define and call', code: 'give add(a, b)\n  -> a + b\n\nsay add(3, 4)   # 7' },
    { title: 'Factorial', code: 'give factorial(n)\n  check if n <= 1\n    -> 1\n  -> n * factorial(n - 1)\n\nsay factorial(10)   # 3628800' },
    { title: 'Arrow function', code: 'double is n -> n * 2\nsay double(5)   # 10' },
    { title: 'Higher-order', code: 'nums is [1, 2, 3, 4, 5]\nevens is nums.filter(n -> n % 2 is 0)\nsay evens   # [2, 4]' },
  ],
  Collections: [
    { title: 'List operations', code: 'nums is [3, 1, 4, 1, 5]\nsay nums.sort()     # [1, 1, 3, 4, 5]\nsay nums.sum()      # 14\nsay nums.avg()      # 2.8' },
    { title: 'Map & filter', code: 'nums is [1, 2, 3, 4, 5]\ndoubled is nums.map(n -> n * 2)\nevens   is nums.filter(n -> n % 2 is 0)\nsay doubled   # [2, 4, 6, 8, 10]\nsay evens     # [2, 4]' },
    { title: 'Objects', code: 'user is { name: "Rana", age: 25, city: "Delhi" }\nsay user.name          # Rana\nsay user["age"]        # 25\nsay user.keys()        # [age, city, name]' },
    { title: 'Reduce', code: 'nums is [1, 2, 3, 4, 5]\ntotal is nums.reduce((acc, n) -> acc + n, 0)\nsay total   # 15' },
  ],
  'Error Handling': [
    { title: 'try/catch/finally', code: 'try\n  result is 10 / 0\ncatch err\n  say "Caught: {err}"\nfinally\n  say "Always runs"' },
    { title: 'throw', code: 'give check_age(age)\n  check if age < 0\n    throw "Age cannot be negative"\n  -> age\n\ntry\n  check_age(-1)\ncatch err\n  say "Error: {err}"' },
    { title: 'assert', code: 'x is 42\nassert x > 0, "x must be positive"\nsay "Assertion passed"' },
  ],
  JSON: [
    { title: 'Parse & stringify', code: 'data is { name: "Ezra", version: 1 }\njson is stringify_json(data)\nsay json\n\nparsed is parse_json(json)\nsay parsed.name   # Ezra' },
    { title: 'Nested objects', code: 'data is parse_json("{\"user\":{\"name\":\"Rana\",\"age\":25}}")\nsay data.user.name   # Rana\nsay data.user.age    # 25' },
  ],
  'Pattern Matching': [
    { title: 'pick/when', code: 'day is "monday"\npick day\n  when "monday"\n    say "Start of the week"\n  when "friday"\n    say "Almost weekend!"\n  otherwise\n    say "Regular day"' },
    { title: 'FizzBuzz', code: 'i is 1\nwhile i <= 15\n  check if i % 15 is 0\n    say "FizzBuzz"\n  otherwise if i % 3 is 0\n    say "Fizz"\n  otherwise if i % 5 is 0\n    say "Buzz"\n  otherwise\n    say i\n  i += 1' },
  ],
};

function HLCode({ code }) {
  const h = code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\b(give|check if|otherwise if|otherwise|repeat|for each|while|until|try|catch|finally|throw|pick|when|return|break|next|assert)\b/g,'<span style="color:#ff7b72">$1</span>')
    .replace(/"([^"]*)"/g,'<span style="color:#a5d6ff">"$1"</span>')
    .replace(/\b(say|write|input|len|range|type_of|parse_json|stringify_json|read_file|write_file)\b/g,'<span style="color:#d2a8ff">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g,'<span style="color:#79c0ff">$1</span>')
    .replace(/(#[^\n]*)/g,'<span style="color:#8b949e">$1</span>')
    .replace(/\b(is|->)\b/g,'<span style="color:#ffa657">$1</span>');
  return <code dangerouslySetInnerHTML={{ __html: h }} />;
}

export default function ExamplesPage() {
  const [cat, setCat] = useState('Basics');
  const [copied, setCopied] = useState('');
  const copy = (code, key) => { navigator.clipboard.writeText(code).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); }); };

  return (
    <>
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '4rem 1.5rem 3rem', marginTop: '64px' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <h1 style={{ marginBottom: '0.75rem' }}>Examples</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.05rem' }}>Annotated Ezra code samples covering the most common patterns.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '2.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
            {Object.keys(EXAMPLES).map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '0.6rem 1.1rem', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s',
                  color: cat === c ? 'var(--brand)' : 'var(--text-3)',
                  borderBottom: `2px solid ${cat === c ? 'var(--brand)' : 'transparent'}`,
                  marginBottom: '-2px' }}
              >{c}</button>
            ))}
          </div>

          {/* Example cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: '1.25rem' }}>
            {EXAMPLES[cat].map((ex, i) => {
              const key = `${cat}-${i}`;
              return (
                <div key={key} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-alt)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.title}</span>
                    <button onClick={() => copy(ex.code, key)}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', color: copied === key ? 'var(--green)' : 'var(--text-3)', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>
                      {copied === key ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '1.25rem', borderRadius: 0, border: 'none', fontSize: '0.85rem', overflowX: 'auto' }}>
                    <HLCode code={ex.code} />
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
