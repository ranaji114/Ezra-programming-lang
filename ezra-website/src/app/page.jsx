'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const RELEASE = 'https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0';

const EXAMPLES = {
  'Hello World': `name is input "Your name: "
say "Hello {name}!"`,
  'Functions': `give add(a, b)
  -> a + b

give factorial(n)
  check if n <= 1
    -> 1
  -> n * factorial(n - 1)

say add(3, 4)        # 7
say factorial(10)    # 3628800`,
  'Lists': `nums is [1, 2, 3, 4, 5]
evens  is nums.filter(n -> n % 2 is 0)
doubled is nums.map(n -> n * 2)
total  is nums.reduce((a, n) -> a + n, 0)

say evens    # [2, 4]
say doubled  # [2, 4, 6, 8, 10]
say total    # 15`,
  'Error Handling': `try
  result is 10 / 0
catch err
  say "Caught: {err}"
finally
  say "Always runs"`,
};

const FEATURES = [
  { icon: '📖', title: 'Readable Syntax', desc: 'Natural English-like keywords. `check if`, `give`, `for each` — code reads like plain text.' },
  { icon: '⚡', title: 'Rust-Powered', desc: 'Built on Rust for memory safety and fast execution. No GC pauses, no crashes.' },
  { icon: '🌍', title: 'Cross-Platform', desc: 'One binary for Windows, Linux, and macOS. Install in a single command.' },
  { icon: '🔧', title: 'All-in-One CLI', desc: 'Formatter, linter, test runner, REPL — all built into `ezra`. No extra installs.' },
  { icon: '🔌', title: 'VS Code Extension', desc: 'Syntax highlighting, Ezra theme, 30+ snippets, LSP (hover, completions, diagnostics).' },
  { icon: '📦', title: 'Rich Stdlib', desc: 'JSON, file I/O, math, collections — batteries included from day one.' },
];

function CodeBlock({ code }) {
  const highlighted = code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\b(give|check if|otherwise if|otherwise|repeat|for each|while|until|loop|try|catch|finally|throw|pick|when|return|break|next|and|or|not|in|times)\b/g, '<span style="color:#ff7b72">$1</span>')
    .replace(/"([^"]*)"/g, '<span style="color:#a5d6ff">"$1"</span>')
    .replace(/\b(say|write|input|input_number|len|range|type_of|parse_json|stringify_json|read_file|write_file|warn|fail|debug)\b/g, '<span style="color:#d2a8ff">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#79c0ff">$1</span>')
    .replace(/(#[^\n]*)/g, '<span style="color:#8b949e">$1</span>')
    .replace(/(-&gt;|is\b)/g, '<span style="color:#ffa657">$1</span>');
  return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

export default function HomePage() {
  const [tab, setTab] = useState('Hello World');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(EXAMPLES[tab]).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="hero-tag">🎉 Ezra v1.0.0 — Now Available</div>
            <h1>A Readable Scripting<br />Language Built in Rust</h1>
            <p className="hero-sub">
              Ezra combines natural syntax with the performance of Rust.
              Write scripts that are easy to read, easy to run, and hard to break.
            </p>
            <div className="hero-actions">
              <a href={`${RELEASE}/EzraSetup-1.0.0.exe`} className="btn btn-primary btn-lg" download>
                ⬇ Download for Windows
              </a>
              <Link href="/download" className="btn btn-secondary btn-lg">All Platforms</Link>
              <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                GitHub →
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-window">
              <div className="code-window-bar">
                <span className="dot dot-r"/><span className="dot dot-y"/><span className="dot dot-g"/>
                <span className="code-filename">main.ez</span>
              </div>
              <div className="code-body">
                <div><span style={{color:'#8b949e'}}># Ezra — readable scripting in Rust</span></div>
                <div>&nbsp;</div>
                <div><span style={{color:'#ffa657'}}>give</span> <span style={{color:'#d2a8ff'}}>greet</span><span style={{color:'#e6edf3'}}>(name)</span></div>
                <div>&nbsp;&nbsp;<span style={{color:'#ffa657'}}>-&gt;</span> <span style={{color:'#a5d6ff'}}>"Hello {'{'}name{'}'}!"</span></div>
                <div>&nbsp;</div>
                <div><span style={{color:'#e6edf3'}}>nums </span><span style={{color:'#ffa657'}}>is</span><span style={{color:'#e6edf3'}}> [1, 2, 3, 4, 5]</span></div>
                <div><span style={{color:'#e6edf3'}}>evens </span><span style={{color:'#ffa657'}}>is</span><span style={{color:'#e6edf3'}}> nums.</span><span style={{color:'#d2a8ff'}}>filter</span><span style={{color:'#e6edf3'}}>(n </span><span style={{color:'#ffa657'}}>-&gt;</span><span style={{color:'#e6edf3'}}> n % 2 </span><span style={{color:'#ffa657'}}>is</span><span style={{color:'#79c0ff'}}> 0</span><span style={{color:'#e6edf3'}}>)</span></div>
                <div><span style={{color:'#d2a8ff'}}>say</span><span style={{color:'#e6edf3'}}> evens&nbsp;&nbsp;</span><span style={{color:'#8b949e'}}># [2, 4]</span></div>
                <div>&nbsp;</div>
                <div><span style={{color:'#ffa657'}}>try</span></div>
                <div>&nbsp;&nbsp;<span style={{color:'#e6edf3'}}>x </span><span style={{color:'#ffa657'}}>is</span><span style={{color:'#79c0ff'}}> 10</span><span style={{color:'#e6edf3'}}> / </span><span style={{color:'#79c0ff'}}>0</span></div>
                <div><span style={{color:'#ffa657'}}>catch</span><span style={{color:'#e6edf3'}}> err</span></div>
                <div>&nbsp;&nbsp;<span style={{color:'#d2a8ff'}}>say</span> <span style={{color:'#a5d6ff'}}>"Caught: {'{'}err{'}'}"</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTALL STRIP */}
      <div className="install-banner">
        <p>Install Ezra in seconds:</p>
        <div className="install-banner-actions">
          <a href={`${RELEASE}/EzraSetup-1.0.0.exe`} className="btn btn-secondary btn-sm" download>🪟 Windows .exe</a>
          <a href={`${RELEASE}/ezra-linux-x86_64-1.0.0.tar.gz`} className="btn btn-secondary btn-sm" download>🐧 Linux .tar.gz</a>
          <a href={`${RELEASE}/ezra-macos-aarch64-1.0.0.tar.gz`} className="btn btn-secondary btn-sm" download>🍎 macOS .tar.gz</a>
          <Link href="/download" className="btn btn-secondary btn-sm">All options →</Link>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Why Ezra?</h2>
            <p>Everything you need for modern scripting — in a single, self-contained binary.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="card feat-card">
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE EXAMPLES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Language at a Glance</h2>
            <p>Clean, readable syntax that gets out of your way.</p>
          </div>
          <div className="tabs">
            {Object.keys(EXAMPLES).map(t => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="tab-panel" style={{ position: 'relative' }}>
            <button
              onClick={copy}
              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid #30363d', color: copied ? '#85e89d' : '#8b949e', padding: '0.3rem 0.7rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font)', transition: 'all 0.15s' }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <pre><CodeBlock code={EXAMPLES[tab]} /></pre>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/examples" className="btn btn-ghost">View all examples →</Link>
            &nbsp;&nbsp;
            <Link href="/playground" className="btn btn-primary">Try in browser →</Link>
          </div>
        </div>
      </section>

      {/* QUICK START */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Get Started in 3 Steps</h2>
          </div>
          <div className="steps">
            {[
              { n: '1', title: 'Install', desc: 'Download EzraSetup-1.0.0.exe and run it. Ezra is added to your PATH automatically.', cmd: 'ezra --version' },
              { n: '2', title: 'Create a project', desc: 'Scaffold a new project with one command. Gets you a src/ folder and ezra.toml.', cmd: 'ezra new my_app' },
              { n: '3', title: 'Run your code', desc: 'Edit src/main.ez and run it. The REPL is also available for quick experiments.', cmd: 'ezra run' },
            ].map(s => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="code-window" style={{ borderRadius: 8 }}>
                  <div className="code-body" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#8b949e' }}>$ </span>
                    <span style={{ color: '#e6edf3' }}>{s.cmd}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHOR STRIP */}
      <section className="section" style={{ background: 'var(--brand-bg)', borderTop: '1px solid var(--brand-border)', borderBottom: '1px solid var(--brand-border)', padding: '3rem 1.5rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Open source — created and maintained by</p>
          <h3 style={{ color: 'var(--brand)', marginBottom: '0.75rem' }}>Ankur Rana</h3>
          <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            View on GitHub →
          </a>
        </div>
      </section>
    </>
  );
}
