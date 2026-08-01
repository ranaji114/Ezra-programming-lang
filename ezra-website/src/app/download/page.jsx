'use client';
import Link from 'next/link';
import { useState } from 'react';

function CmdRow({ cmd }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(cmd).then(() => { setOk(true); setTimeout(() => setOk(false), 2000); }); };
  return (
    <div className="cmd-row">
      <span style={{ flex: 1, overflowX: 'auto' }}>{cmd}</span>
      <button className={ok ? 'cmd-copy ok' : 'cmd-copy'} onClick={copy} title="Copy">{ok ? '✓' : '⎘'}</button>
    </div>
  );
}

function DlBtn({ href, label, size, featured }) {
  return (
    <a href={href} className="dl-btn" download style={featured ? { borderColor: 'var(--brand)', background: 'var(--brand-bg)' } : {}}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: featured ? 'var(--brand)' : 'var(--text)' }}>⬇ {label}</div>
        <div className="size">{size}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: featured ? 'var(--brand)' : 'var(--text-3)', flexShrink: 0 }}>
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </a>
  );
}

export default function DownloadPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', padding: '4rem 1.5rem 3rem', marginTop: '64px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <span className="badge badge-brand" style={{ marginBottom: '1rem', display: 'inline-block' }}>v1.0.0 — Latest Release</span>
          <h1 style={{ marginBottom: '1rem' }}>Download Ezra</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Free and open-source. No account required. One click to install.
          </p>
          {/* Direct download — no GitHub redirect needed */}
          <a href="/downloads/EzraSetup-1.0.0.exe" className="btn btn-primary btn-lg" download>
            ⬇ Download for Windows — Free
          </a>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: '0.75rem' }}>
            48 KB installer · Windows 10/11 · Adds to PATH automatically
          </p>
        </div>
      </div>

      {/* All platforms */}
      <section className="section">
        <div className="container">
          <div className="section-header"><h2>All Platforms</h2></div>
          <div className="dl-grid">

            {/* WINDOWS */}
            <div className="dl-card featured">
              <div className="dl-featured-label">Recommended</div>
              <div className="dl-platform-icon">🪟</div>
              <h3>Windows</h3>
              <p className="sub">Windows 10 / 11 · 64-bit</p>

              {/* These files live in /public/downloads/ — direct download, no GitHub needed */}
              <DlBtn
                href="/downloads/EzraSetup-1.0.0.exe"
                label="EzraSetup-1.0.0.exe"
                size="48 KB · GUI installer · adds to PATH automatically"
                featured
              />
              <DlBtn
                href="/downloads/ezra-windows-x86_64-1.0.0.zip"
                label="ezra-windows-x86_64-1.0.0.zip"
                size="1.5 MB · ZIP archive · manual install"
              />

              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>Or via PowerShell:</p>
              <CmdRow cmd="powershell -ExecutionPolicy Bypass -File install\install.ps1" />

              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: '#92400e' }}>
                ⚠ Windows may show "Protected your PC" — click <strong>More info → Run anyway</strong>. Normal for unsigned open-source software.
              </div>
            </div>

            {/* LINUX */}
            <div className="dl-card">
              <div className="dl-platform-icon">🐧</div>
              <h3>Linux</h3>
              <p className="sub">Most modern distributions</p>

              <div style={{ padding: '1rem', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                Linux binaries will be available in the next release. For now, install from source:
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: '0.4rem' }}>Build from source (Rust required):</p>
              <CmdRow cmd="git clone https://github.com/ranaji114/Ezra-programming-lang" />
              <CmdRow cmd="cd Ezra-programming-lang" />
              <CmdRow cmd="cargo build --release" />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>Binary: <code>target/release/ezra</code></p>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.75rem 0 0.4rem' }}>Or check GitHub for latest releases:</p>
              <CmdRow cmd="https://github.com/ranaji114/Ezra-programming-lang/releases" />
            </div>

            {/* MACOS */}
            <div className="dl-card">
              <div className="dl-platform-icon">🍎</div>
              <h3>macOS</h3>
              <p className="sub">macOS 10.15+ · Intel &amp; Apple Silicon</p>

              <div style={{ padding: '1rem', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                macOS binaries will be available in the next release. For now, install from source:
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: '0.4rem' }}>Build from source (Rust required):</p>
              <CmdRow cmd="git clone https://github.com/ranaji114/Ezra-programming-lang" />
              <CmdRow cmd="cd Ezra-programming-lang" />
              <CmdRow cmd="cargo build --release" />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>Binary: <code>target/release/ezra</code></p>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.75rem 0 0.4rem' }}>Or check GitHub for latest releases:</p>
              <a href="https://github.com/ranaji114/Ezra-programming-lang/releases" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                View Releases on GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* VS Code Extension */}
      <section className="section section-alt" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-header">
            <h2>VS Code Extension</h2>
            <p>Syntax highlighting, Ezra Neon theme, 30+ snippets, LSP diagnostics, hover docs.</p>
          </div>
          <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⬛</div>
            <h3 style={{ marginBottom: '0.4rem' }}>ezra-lang-1.0.0.vsix</h3>
            <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>
              Download the file, then in VS Code: <strong>Extensions (Ctrl+Shift+X) → ··· → Install from VSIX</strong>
            </p>
            {/* Direct download from website */}
            <a href="/downloads/ezra-lang-1.0.0.vsix" className="btn btn-primary" download>
              ⬇ Download VSIX (30 KB)
            </a>
          </div>
        </div>
      </section>

      {/* After install */}
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="section-header"><h2>Verify Installation</h2></div>
          <p style={{ color: 'var(--text-3)', textAlign: 'center', marginBottom: '1.25rem' }}>
            Open a <strong>new terminal</strong> after installing and run:
          </p>
          <CmdRow cmd="ezra --version" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
            Expected: <code>ezra 1.0.0</code>
          </p>
          <CmdRow cmd="ezra new my_app" />
          <CmdRow cmd="cd my_app" />
          <CmdRow cmd="ezra run" />
          <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/docs" className="btn btn-primary">Read the Docs →</Link>
            <Link href="/playground" className="btn btn-ghost">Try in Browser →</Link>
          </div>
        </div>
      </section>

      {/* Build from source */}
      <section className="section section-alt" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="section-header"><h2>Build from Source</h2></div>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
            Requires <a href="https://rustup.rs" target="_blank" rel="noopener noreferrer">Rust stable</a>:
          </p>
          <CmdRow cmd="git clone https://github.com/ranaji114/Ezra-programming-lang" />
          <CmdRow cmd="cd Ezra-programming-lang" />
          <CmdRow cmd="cargo build --release" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.75rem', textAlign: 'center' }}>
            Binary: <code>target/release/ezra</code>
          </p>
        </div>
      </section>
    </>
  );
}
