'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const BASE = 'https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0';

export default function DownloadPage() {
  const [copied, setCopied] = useState('');

  const copy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const CmdBlock = ({ cmd, id }) => (
    <div className="cmd-block">
      <code style={{ flex: 1, wordBreak: 'break-all' }}>{cmd}</code>
      <button className="cmd-copy" onClick={() => copy(cmd, id)} title="Copy">
        {copied === id ? '✓' : '⎘'}
      </button>
    </div>
  );

  return (
    <>
      <div style={{ paddingTop: '72px', background: 'linear-gradient(180deg,var(--bg-2) 0%,var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '1rem', display: 'inline-block' }}>v1.0.0 — Latest Release</span>
          <h1>Download <span className="text-gradient">Ezra</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Free, open-source, no account needed. Pick your platform and start in minutes.
          </p>
          <a href={`${BASE}/EzraSetup-1.0.0.exe`} className="btn btn-accent btn-lg" download>
            ⬇ Download for Windows — Free
          </a>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your <span className="text-gradient">Platform</span></h2>
          </div>

          <div className="platform-cards">
            {/* WINDOWS */}
            <div className="card platform-card recommended">
              <div className="platform-icon">🪟</div>
              <h3>Windows</h3>
              <p className="sub">Windows 10 / 11 (64-bit)</p>

              <a href={`${BASE}/EzraSetup-1.0.0.exe`} className="download-btn" download>
                <div className="dl-info">
                  <span className="dl-name">EzraSetup-1.0.0.exe</span>
                  <span className="dl-size">48 KB · GUI Installer · Adds to PATH automatically</span>
                </div>
                <span className="dl-arrow">⬇</span>
              </a>

              <a href={`${BASE}/ezra-windows-x86_64-1.0.0.zip`} className="download-btn" download>
                <div className="dl-info">
                  <span className="dl-name">ezra-windows-x86_64-1.0.0.zip</span>
                  <span className="dl-size">1.5 MB · ZIP Archive · Manual install</span>
                </div>
                <span className="dl-arrow">⬇</span>
              </a>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '1rem' }}>Or run via PowerShell:</p>
              <CmdBlock cmd="powershell -ExecutionPolicy Bypass -File install\install.ps1" id="win-ps" />

              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#fbbf24' }}>
                ⚠ Windows may show "Protected your PC" — click <strong>More info → Run anyway</strong>. Normal for unsigned open-source software.
              </div>
            </div>

            {/* LINUX */}
            <div className="card platform-card">
              <div className="platform-icon">🐧</div>
              <h3>Linux</h3>
              <p className="sub">Ubuntu, Debian, Fedora, Arch and more</p>

              <a href={`${BASE}/ezra-linux-x86_64-1.0.0.tar.gz`} className="download-btn" download>
                <div className="dl-info">
                  <span className="dl-name">ezra-linux-x86_64-1.0.0.tar.gz</span>
                  <span className="dl-size">x86_64 · tar.gz archive</span>
                </div>
                <span className="dl-arrow">⬇</span>
              </a>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem', marginBottom: '0.75rem' }}>Or one-line install:</p>
              <CmdBlock cmd="sh install/install.sh" id="lin-sh" />

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>ARM64 (Raspberry Pi, AWS Graviton):</p>
              <a href={`${BASE}/ezra-linux-aarch64-1.0.0.tar.gz`} className="download-btn" download>
                <div className="dl-info">
                  <span className="dl-name">ezra-linux-aarch64-1.0.0.tar.gz</span>
                  <span className="dl-size">ARM64 · tar.gz archive</span>
                </div>
                <span className="dl-arrow">⬇</span>
              </a>
            </div>

            {/* MACOS */}
            <div className="card platform-card">
              <div className="platform-icon">🍎</div>
              <h3>macOS</h3>
              <p className="sub">macOS 10.15+ · Intel & Apple Silicon</p>

              <a href={`${BASE}/ezra-macos-aarch64-1.0.0.tar.gz`} className="download-btn" download>
                <div className="dl-info">
                  <span className="dl-name">ezra-macos-aarch64-1.0.0.tar.gz</span>
                  <span className="dl-size">Apple Silicon (M1/M2/M3)</span>
                </div>
                <span className="dl-arrow">⬇</span>
              </a>

              <a href={`${BASE}/ezra-macos-x86_64-1.0.0.tar.gz`} className="download-btn" download>
                <div className="dl-info">
                  <span className="dl-name">ezra-macos-x86_64-1.0.0.tar.gz</span>
                  <span className="dl-size">Intel Mac</span>
                </div>
                <span className="dl-arrow">⬇</span>
              </a>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem', marginBottom: '0.75rem' }}>Or one-line install:</p>
              <CmdBlock cmd="sh install/install.sh" id="mac-sh" />
            </div>
          </div>
        </div>
      </section>

      {/* VS Code Extension */}
      <section className="section" style={{ background: 'var(--bg-2)', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-header">
            <h2>VS Code <span className="text-gradient">Extension</span></h2>
            <p>Syntax highlighting, Ezra Neon theme, 30+ snippets, and LSP support.</p>
          </div>
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⬛</div>
            <h3 style={{ marginBottom: '0.5rem' }}>ezra-lang-1.0.0.vsix</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Download the VSIX, then: VS Code → Extensions (Ctrl+Shift+X) → ··· → Install from VSIX
            </p>
            <a href={`${BASE}/ezra-lang-1.0.0.vsix`} className="btn btn-primary btn-lg" download style={{ display: 'inline-flex' }}>
              ⬇ Download VSIX (30 KB)
            </a>
          </div>
        </div>
      </section>

      {/* After Install */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>After <span className="text-gradient">Install</span></h2>
            <p>Open a new terminal and verify:</p>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <CmdBlock cmd="ezra --version" id="ver" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>Expected: <code>ezra 1.0.0</code></p>
            <CmdBlock cmd="ezra new my_app" id="new" />
            <CmdBlock cmd="cd my_app" id="cd" />
            <CmdBlock cmd="ezra run" id="run" />
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link href="/docs" className="btn btn-primary">Read the Docs →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Build from Source */}
      <section className="section" style={{ background: 'var(--bg-2)', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-header"><h2>Build from <span className="text-gradient">Source</span></h2></div>
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Requires <a href="https://rustup.rs" target="_blank" rel="noopener noreferrer">Rust stable</a>:</p>
            <CmdBlock cmd="git clone https://github.com/ranaji114/Ezra-programming-lang" id="clone" />
            <CmdBlock cmd="cd Ezra-programming-lang" id="cdir" />
            <CmdBlock cmd="cargo build --release" id="build" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>Binary: <code>target/release/ezra</code></p>
          </div>
        </div>
      </section>
    </>
  );
}
