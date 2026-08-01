'use client';
import Link from 'next/link';
import { useState } from 'react';

const BASE = 'https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0';

function CmdRow({ cmd }) {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(cmd).then(() => { setOk(true); setTimeout(() => setOk(false), 2000); }); };
  return (
    <div className="cmd-row">
      <span style={{ flex: 1, overflowX: 'auto' }}>{cmd}</span>
      <button className={`cmd-copy${ok ? ' ok' : ''}`} onClick={copy} title="Copy">{ok ? '✓' : '⎘'}</button>
    </div>
  );
}

function DlBtn({ href, name, size, featured }) {
  return (
    <a href={href} className="dl-btn" download={name} style={featured ? { borderColor: 'var(--brand)', background: 'var(--brand-bg)' } : {}}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: featured ? 'var(--brand)' : 'var(--text)' }}>⬇ {name}</div>
        <div className="size">{size}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: featured ? 'var(--brand)' : 'var(--text-3)', flexShrink: 0 }}>
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
      </svg>
    </a>
  );
}

export default function DownloadPage() {
  return (
    <>
      <div style={{ background: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', padding: '4rem 1.5rem 3rem', marginTop: '64px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <span className="badge badge-brand" style={{ marginBottom: '1rem', display: 'inline-block' }}>v1.0.0 — Latest Release</span>
          <h1 style={{ marginBottom: '1rem' }}>Download Ezra</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Free and open-source. No account required. Pick your platform below.
          </p>
          <a href={`${BASE}/EzraSetup-1.0.0.exe`} className="btn btn-primary btn-lg" download>
            ⬇ Download for Windows — Free
          </a>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header"><h2>All Platforms</h2></div>
          <div className="dl-grid">

            {/* Windows */}
            <div className="dl-card featured">
              <div className="dl-featured-label">Recommended</div>
              <div className="dl-platform-icon">🪟</div>
              <h3>Windows</h3>
              <p className="sub">Windows 10 / 11 · 64-bit</p>
              <DlBtn href={`${BASE}/EzraSetup-1.0.0.exe`} name="EzraSetup-1.0.0.exe" size="48 KB · GUI installer · adds to PATH automatically" featured />
              <DlBtn href={`${BASE}/ezra-windows-x86_64-1.0.0.zip`} name="ezra-windows-x86_64-1.0.0.zip" size="1.5 MB · ZIP archive · manual install" />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>Or via PowerShell:</p>
              <CmdRow cmd="powershell -ExecutionPolicy Bypass -File install\install.ps1" />
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: '#92400e' }}>
                ⚠ Windows may show "Protected your PC" — click <strong>More info → Run anyway</strong>. Normal for open-source software.
              </div>
            </div>

            {/* Linux */}
            <div className="dl-card">
              <div className="dl-platform-icon">🐧</div>
              <h3>Linux</h3>
              <p className="sub">Most modern distributions</p>
              <DlBtn href={`${BASE}/ezra-linux-x86_64-1.0.0.tar.gz`} name="ezra-linux-x86_64-1.0.0.tar.gz" size="x86_64 · tar.gz" />
              <DlBtn href={`${BASE}/ezra-linux-aarch64-1.0.0.tar.gz`} name="ezra-linux-aarch64-1.0.0.tar.gz" size="ARM64 (Raspberry Pi, Graviton)" />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.75rem 0 0.4rem' }}>One-line install:</p>
              <CmdRow cmd="sh install/install.sh" />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.5rem 0 0.4rem' }}>Or from the source repo:</p>
              <CmdRow cmd="curl -sSf https://raw.githubusercontent.com/ranaji114/Ezra-programming-lang/main/install/install.sh | sh" />
            </div>

            {/* macOS */}
            <div className="dl-card">
              <div className="dl-platform-icon">🍎</div>
              <h3>macOS</h3>
              <p className="sub">macOS 10.15+ · Intel &amp; Apple Silicon</p>
              <DlBtn href={`${BASE}/ezra-macos-aarch64-1.0.0.tar.gz`} name="ezra-macos-aarch64-1.0.0.tar.gz" size="Apple Silicon (M1/M2/M3)" />
              <DlBtn href={`${BASE}/ezra-macos-x86_64-1.0.0.tar.gz`} name="ezra-macos-x86_64-1.0.0.tar.gz" size="Intel Mac" />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.75rem 0 0.4rem' }}>One-line install:</p>
              <CmdRow cmd="sh install/install.sh" />
            </div>
          </div>
        </div>
      </section>

      {/* VS Code */}
      <section className="section section-alt" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-header">
            <h2>VS Code Extension</h2>
            <p>Syntax highlighting, Ezra Neon theme, 30+ snippets, LSP support.</p>
          </div>
          <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⬛</div>
            <h3 style={{ marginBottom: '0.4rem' }}>ezra-lang-1.0.0.vsix</h3>
            <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>
              Download then: <strong>VS Code → Extensions (Ctrl+Shift+X) → ··· → Install from VSIX</strong>
            </p>
            <a href={`${BASE}/ezra-lang-1.0.0.vsix`} className="btn btn-primary" download>
              ⬇ Download VSIX (30 KB)
            </a>
          </div>
        </div>
      </section>

      {/* After install */}
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="section-header"><h2>Verify Installation</h2></div>
          <p style={{ color: 'var(--text-3)', textAlign: 'center', marginBottom: '1.5rem' }}>Open a new terminal and run:</p>
          <CmdRow cmd="ezra --version" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>Expected output: <code>ezra 1.0.0</code></p>
          <CmdRow cmd="ezra new my_app" />
          <CmdRow cmd="cd my_app" />
          <CmdRow cmd="ezra run" />
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/docs" className="btn btn-primary">Read the Docs →</Link>
            &nbsp;&nbsp;
            <Link href="/playground" className="btn btn-ghost">Try in Browser →</Link>
          </div>
        </div>
      </section>

      {/* Build from source */}
      <section className="section section-alt" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="section-header"><h2>Build from Source</h2></div>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', marginBottom: '1.25rem' }}>Requires <a href="https://rustup.rs" target="_blank" rel="noopener noreferrer">Rust stable</a>:</p>
          <CmdRow cmd="git clone https://github.com/ranaji114/Ezra-programming-lang" />
          <CmdRow cmd="cd Ezra-programming-lang" />
          <CmdRow cmd="cargo build --release" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.75rem', textAlign: 'center' }}>Binary: <code>target/release/ezra</code></p>
        </div>
      </section>
    </>
  );
}
