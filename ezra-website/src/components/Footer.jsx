'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" style={{display:'flex',alignItems:'center',gap:'0.6rem',textDecoration:'none',marginBottom:'0.75rem'}}>
              <div className="logo-mark">E</div>
              <span style={{fontWeight:800,fontSize:'1.2rem',color:'var(--text)'}}>Ezra</span>
            </Link>
            <p>A readable scripting language built in Rust.<br/>
              Created by <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer" style={{color:'var(--primary-light)'}}>Ankur Rana</a>
            </p>
            <div style={{display:'flex',gap:'0.5rem',marginTop:'1.25rem',flexWrap:'wrap'}}>
              <span className="badge badge-purple">v1.0.0</span>
              <span className="badge badge-cyan">MIT License</span>
              <span className="badge badge-green">55/55 Tests</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Language</h4>
            <ul>
              <li><Link href="/docs">Documentation</Link></li>
              <li><Link href="/docs">Tutorial</Link></li>
              <li><Link href="/docs">Language Reference</Link></li>
              <li><Link href="/docs">Standard Library</Link></li>
              <li><Link href="/examples">Examples</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Download</h4>
            <ul>
              <li><Link href="/download">Windows</Link></li>
              <li><Link href="/download">Linux</Link></li>
              <li><Link href="/download">macOS</Link></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-lang-1.0.0.vsix">VS Code Extension</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/releases" target="_blank" rel="noopener noreferrer">All Releases</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/issues" target="_blank" rel="noopener noreferrer">Report an Issue</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/contributing.md" target="_blank" rel="noopener noreferrer">Contributing</a></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ezra Language. Created by <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer">Ankur Rana</a>. MIT License.</p>
          <p style={{display:'flex',gap:'1rem',flexWrap:'wrap',justifyContent:'center'}}>
            <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/download">Download</Link>
            <Link href="/docs">Docs</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
