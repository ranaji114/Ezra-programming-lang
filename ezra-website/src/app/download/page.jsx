'use client';
import { useState } from 'react';
import Link from 'next/link';

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handle}>
      {copied ? '✓ Copied' : label}
    </button>
  );
}

function InlineCmd({ cmd }) {
  return (
    <div className="inline-cmd">
      <code>{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  );
}

export default function DownloadPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero blue">
        <div className="container">
          <p className="page-hero-tag">Download</p>
          <h1>Download Ezra v1.0.0</h1>
          <p>Get the Ezra programming language for your platform. Free, open source, MIT licensed.</p>
        </div>
      </section>

      {/* Platform Cards */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Platforms</span>
            <h2>Choose your platform</h2>
            <p>Native binaries for Windows, Linux, and macOS.</p>
          </div>
          <div className="platform-grid">

            {/* Windows */}
            <div className="platform-card">
              <div className="platform-icon">🪟</div>
              <div className="platform-name">Windows</div>
              <div className="platform-arch">x86_64 · Windows 10 / 11</div>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/EzraSetup-1.0.0.exe"
                className="download-btn-main"
              >
                ⬇ EzraSetup-1.0.0.exe <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(48 KB)</span>
              </a>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-windows-x86_64-1.0.0.zip"
                className="download-link-alt"
              >
                ⬇ ezra-windows-x86_64-1.0.0.zip (portable)
              </a>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                Or install via PowerShell:
              </p>
              <InlineCmd cmd={`irm https://raw.githubusercontent.com/ranaji114/Ezra-programming-lang/main/installers/windows/install.ps1 | iex`} />
            </div>

            {/* Linux */}
            <div className="platform-card">
              <div className="platform-icon">🐧</div>
              <div className="platform-name">Linux</div>
              <div className="platform-arch">x86_64 · ARM64</div>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-linux-x86_64-1.0.0.tar.gz"
                className="download-btn-main"
              >
                ⬇ ezra-linux-x86_64-1.0.0.tar.gz
              </a>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-linux-aarch64-1.0.0.tar.gz"
                className="download-link-alt"
              >
                ⬇ ezra-linux-aarch64-1.0.0.tar.gz (ARM64)
              </a>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                Or install via shell script:
              </p>
              <InlineCmd cmd="sh install/install.sh" />
            </div>

            {/* macOS */}
            <div className="platform-card">
              <div className="platform-icon">🍎</div>
              <div className="platform-name">macOS</div>
              <div className="platform-arch">Apple Silicon (ARM64) · Intel (x64)</div>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-macos-aarch64-1.0.0.tar.gz"
                className="download-btn-main"
              >
                ⬇ ezra-macos-aarch64-1.0.0.tar.gz
              </a>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-macos-x86_64-1.0.0.tar.gz"
                className="download-link-alt"
              >
                ⬇ ezra-macos-x86_64-1.0.0.tar.gz (Intel)
              </a>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                Or install via shell script:
              </p>
              <InlineCmd cmd="sh install/install.sh" />
            </div>
          </div>
        </div>
      </section>

      {/* VS Code Extension */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="section-heading" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <span className="section-tag">Editor Support</span>
              <h2>VS Code Extension</h2>
              <p>Get syntax highlighting, code snippets, and diagnostics for Ezra in VS Code.</p>
            </div>
            <a
              href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-lang-1.0.0.vsix"
              className="download-btn-main"
              style={{ width: 'fit-content', marginBottom: '1.5rem' }}
            >
              ⬇ Download ezra-lang-1.0.0.vsix
            </a>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-heading)' }}>
              Install the extension:
            </p>
            <InlineCmd cmd="code --install-extension ezra-lang-1.0.0.vsix" />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Or open VS Code → Extensions → "…" menu → Install from VSIX → select the downloaded file.
            </p>
          </div>
        </div>
      </section>

      {/* After Install */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="section-heading" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <span className="section-tag">Verify Installation</span>
              <h2>After installing</h2>
              <p>Run these commands to verify Ezra is correctly installed.</p>
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
              Check version
            </p>
            <InlineCmd cmd="ezra --version" />
            <p style={{ fontWeight: 600, margin: '1.25rem 0 0.5rem', color: 'var(--text-heading)' }}>
              Run a file
            </p>
            <InlineCmd cmd='ezra hello.ez' />
            <p style={{ fontWeight: 600, margin: '1.25rem 0 0.5rem', color: 'var(--text-heading)' }}>
              Open the REPL
            </p>
            <InlineCmd cmd="ezra" />
            <div style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginTop: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--brand)' }}>
                <strong>New to Ezra?</strong> Read the{' '}
                <Link href="/docs">Getting Started guide</Link> or try the{' '}
                <Link href="/playground">online playground</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Build from source */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="section-heading" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <span className="section-tag">Developers</span>
              <h2>Build from source</h2>
              <p>Requires Rust 1.70+ and Cargo. Clone the repository and build with Cargo.</p>
            </div>
            <InlineCmd cmd="git clone https://github.com/ranaji114/Ezra-programming-lang.git" />
            <div style={{ marginTop: '0.75rem' }}>
              <InlineCmd cmd="cd Ezra-programming-lang && cargo build --release" />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <InlineCmd cmd="cargo test" />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              The built binary will be at <code>target/release/ezra</code> (or <code>ezra.exe</code> on Windows).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
