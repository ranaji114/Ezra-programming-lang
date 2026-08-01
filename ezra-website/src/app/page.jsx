'use client';
import { useState } from 'react';
import Link from 'next/link';

const HERO_CODE = `<span class="tok-keyword">give</span> <span class="tok-func">greet</span>(name)
  <span class="tok-op">-></span> <span class="tok-string">"Hello {name}!"</span>

<span class="tok-var">nums</span> <span class="tok-keyword">is</span> <span class="tok-punct">[</span><span class="tok-number">1</span>, <span class="tok-number">2</span>, <span class="tok-number">3</span>, <span class="tok-number">4</span>, <span class="tok-number">5</span><span class="tok-punct">]</span>
<span class="tok-var">evens</span> <span class="tok-keyword">is</span> nums<span class="tok-punct">.</span><span class="tok-builtin">filter</span>(n <span class="tok-op">-></span> n <span class="tok-op">%</span> <span class="tok-number">2</span> <span class="tok-keyword">is</span> <span class="tok-number">0</span>)
<span class="tok-builtin">say</span> evens   <span class="tok-comment"># [2, 4]</span>`;

const CODE_EXAMPLES = {
  'Hello World': `<span class="tok-builtin">say</span> <span class="tok-string">"Hello, World!"</span>`,
  'Functions': `<span class="tok-keyword">give</span> <span class="tok-func">add</span>(a, b)
  <span class="tok-op">-></span> a <span class="tok-op">+</span> b

<span class="tok-keyword">give</span> <span class="tok-func">greet</span>(name)
  <span class="tok-op">-></span> <span class="tok-string">"Hello, {name}!"</span>

<span class="tok-builtin">say</span> <span class="tok-func">add</span>(<span class="tok-number">3</span>, <span class="tok-number">4</span>)       <span class="tok-comment"># 7</span>
<span class="tok-builtin">say</span> <span class="tok-func">greet</span>(<span class="tok-string">"Ankur"</span>)  <span class="tok-comment"># Hello, Ankur!</span>`,
  'Lists': `<span class="tok-var">nums</span> <span class="tok-keyword">is</span> [<span class="tok-number">1</span>, <span class="tok-number">2</span>, <span class="tok-number">3</span>, <span class="tok-number">4</span>, <span class="tok-number">5</span>]
<span class="tok-var">evens</span> <span class="tok-keyword">is</span> nums.<span class="tok-builtin">filter</span>(n <span class="tok-op">-></span> n <span class="tok-op">%</span> <span class="tok-number">2</span> <span class="tok-keyword">is</span> <span class="tok-number">0</span>)
<span class="tok-var">doubled</span> <span class="tok-keyword">is</span> nums.<span class="tok-builtin">map</span>(n <span class="tok-op">-></span> n <span class="tok-op">*</span> <span class="tok-number">2</span>)
<span class="tok-builtin">say</span> evens    <span class="tok-comment"># [2, 4]</span>
<span class="tok-builtin">say</span> doubled  <span class="tok-comment"># [2, 4, 6, 8, 10]</span>`,
  'Error Handling': `<span class="tok-keyword">attempt</span>
  <span class="tok-var">result</span> <span class="tok-keyword">is</span> <span class="tok-builtin">int</span>(<span class="tok-string">"abc"</span>)
  <span class="tok-builtin">say</span> result
<span class="tok-keyword">rescue</span> err
  <span class="tok-builtin">say</span> <span class="tok-string">"Caught: {err}"</span>`,
};

const FEATURES = [
  { icon: '📖', title: 'Readable Syntax', desc: 'Write code that reads like plain English. No braces, no semicolons — just clean, minimal syntax.' },
  { icon: '⚡', title: 'Rust Performance', desc: 'Built on a Rust runtime. Fast startup, low memory, deterministic execution.' },
  { icon: '🌐', title: 'Cross-Platform', desc: 'One codebase runs on Windows, Linux, and macOS with native binaries for each.' },
  { icon: '🔧', title: 'Built-in Tooling', desc: 'Comes with a formatter, linter, test runner, and REPL out of the box.' },
  { icon: '💻', title: 'VS Code Support', desc: 'First-class VS Code extension with syntax highlighting, snippets, and diagnostics.' },
  { icon: '📦', title: 'Standard Library', desc: 'Rich standard library covering I/O, math, collections, strings, JSON, and more.' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Hello World');

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <span>●</span> v1.0.0 Released
              </div>
              <h1 className="hero-title">
                Ezra — A Readable<br />Scripting Language
              </h1>
              <p className="hero-subtitle">
                Write code that reads like plain English. Ezra is a clean, expressive scripting
                language built on a fast Rust runtime — great for automation, learning, and everyday scripting.
              </p>
              <div className="hero-actions">
                <a
                  href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/EzraSetup-1.0.0.exe"
                  className="btn btn-primary btn-lg"
                >
                  ⬇ Download for Windows
                </a>
                <Link href="/docs" className="btn btn-secondary btn-lg">
                  View Docs →
                </Link>
              </div>
            </div>
            <div>
              <div className="code-block">
                <div className="code-block-header">
                  <div className="code-dots">
                    <span className="code-dot code-dot-red" />
                    <span className="code-dot code-dot-yellow" />
                    <span className="code-dot code-dot-green" />
                  </div>
                  <span className="code-block-title">example.ez</span>
                  <span />
                </div>
                <div className="code-block-body">
                  <pre dangerouslySetInnerHTML={{ __html: HERO_CODE }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Install Banner ── */}
      <div className="install-banner">
        <div className="container">
          <div className="install-banner-inner">
            <span className="install-banner-label">Install Ezra:</span>
            <div className="install-banner-links">
              <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/EzraSetup-1.0.0.exe" className="install-banner-link">
                ⬇ Windows
              </a>
              <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-linux-x86_64-1.0.0.tar.gz" className="install-banner-link">
                ⬇ Linux
              </a>
              <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-macos-aarch64-1.0.0.tar.gz" className="install-banner-link">
                ⬇ macOS
              </a>
            </div>
            <Link href="/download" style={{ color: 'white', fontSize: '0.875rem', marginLeft: 'auto', opacity: 0.85 }}>
              All platforms →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Why Ezra</span>
            <h2>Everything you need to be productive</h2>
            <p>Designed to be simple enough to pick up in an afternoon, powerful enough for real-world use.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="card">
                <span className="card-icon">{f.icon}</span>
                <div className="card-title">{f.title}</div>
                <p className="card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code Showcase ── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Code Examples</span>
            <h2>Clean syntax, familiar ideas</h2>
            <p>See how Ezra handles common programming patterns.</p>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-light)', padding: '0 1rem' }}>
              <div className="tab-bar">
                {Object.keys(CODE_EXAMPLES).map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="code-block" style={{ borderRadius: 0, border: 'none' }}>
              <div className="code-block-header">
                <div className="code-dots">
                  <span className="code-dot code-dot-red" />
                  <span className="code-dot code-dot-yellow" />
                  <span className="code-dot code-dot-green" />
                </div>
                <span className="code-block-title">{activeTab.toLowerCase().replace(/ /g, '_')}.ez</span>
                <CopyButton text={CODE_EXAMPLES[activeTab].replace(/<[^>]+>/g, '')} />
              </div>
              <div className="code-block-body">
                <pre dangerouslySetInnerHTML={{ __html: CODE_EXAMPLES[activeTab] }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Start ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Get Started</span>
            <h2>Up and running in minutes</h2>
            <p>Three simple steps to write your first Ezra program.</p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-title">Install Ezra</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Download for your platform and run the installer.
              </p>
              <div className="step-cmd"># Windows: run EzraSetup-1.0.0.exe<br /># Linux/macOS: sh install/install.sh</div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-title">Create a file</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Create a <code>.ez</code> file and write your first program.
              </p>
              <div className="step-cmd">{'say "Hello, World!"'}</div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-title">Run it</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Execute with the <code>ezra</code> command.
              </p>
              <div className="step-cmd">ezra hello.ez</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/docs" className="btn btn-primary">Read the Documentation →</Link>
          </div>
        </div>
      </section>

      {/* ── Author strip ── */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-tag">Open Source</span>
          <h2 style={{ marginBottom: '0.75rem' }}>Created by Ankur Rana</h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.75rem' }}>
            Ezra is a solo passion project — one developer building an entire language, runtime,
            tooling, and documentation from scratch.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/ranaji114/Ezra-programming-lang"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View on GitHub
            </a>
            <Link href="/about" className="btn btn-ghost">Learn More About Ezra →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
