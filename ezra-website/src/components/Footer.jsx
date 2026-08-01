'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Image src="/ezra-logo.png" alt="Ezra" width={28} height={28} style={{ borderRadius: 7 }} />
              <span className="footer-brand" style={{ color: '#f9fafb', fontWeight: 700, fontSize: '1.1rem' }}>Ezra</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: 260 }}>
              A readable scripting language built in Rust.<br />
              Created by <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer" style={{ color: '#e8600a' }}>Ankur Rana</a>.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(232,96,10,0.15)', color: '#f97316', border: '1px solid rgba(232,96,10,0.25)', padding: '2px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600 }}>v1.0.0</span>
              <span style={{ background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.2)', padding: '2px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600 }}>MIT</span>
              <span style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600 }}>Rust</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Language</h4>
            <ul>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/getting-started.md" target="_blank" rel="noopener noreferrer">Getting Started</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/tutorial.md" target="_blank" rel="noopener noreferrer">Tutorial</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/language-reference.md" target="_blank" rel="noopener noreferrer">Language Reference</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/index.md" target="_blank" rel="noopener noreferrer">Standard Library</a></li>
              <li><Link href="/examples" style={{ color: '#9ca3af' }}>Examples</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Download</h4>
            <ul>
              <li><Link href="/download" style={{ color: '#9ca3af' }}>Windows</Link></li>
              <li><Link href="/download" style={{ color: '#9ca3af' }}>Linux</Link></li>
              <li><Link href="/download" style={{ color: '#9ca3af' }}>macOS</Link></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-lang-1.0.0.vsix" style={{ color: '#9ca3af' }}>VS Code Extension</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/releases" target="_blank" rel="noopener noreferrer">All Releases</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/issues" target="_blank" rel="noopener noreferrer">Report a Bug</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/contributing.md" target="_blank" rel="noopener noreferrer">Contributing</a></li>
              <li><Link href="/about" style={{ color: '#9ca3af' }}>About Ezra</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ezra Language · Created by <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer">Ankur Rana</a> · MIT License</p>
          <p style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/download" style={{ color: '#9ca3af' }}>Download</Link>
            <Link href="/docs" style={{ color: '#9ca3af' }}>Docs</Link>
            <Link href="/playground" style={{ color: '#9ca3af' }}>Playground</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
