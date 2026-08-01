'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-logo">
              <div className="footer-logo-box">E</div>
              <span className="footer-name">Ezra</span>
            </div>
            <p className="footer-desc">
              A readable scripting language built in Rust. Simple syntax, fast execution,
              and a great developer experience — for everyone.
            </p>
            <a
              href="https://github.com/ranaji114/Ezra-programming-lang"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Language */}
          <div>
            <p className="footer-col-title">Language</p>
            <ul className="footer-links">
              <li><Link href="/docs">Documentation</Link></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/getting-started.md" target="_blank" rel="noopener noreferrer">Getting Started</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/language-reference.md" target="_blank" rel="noopener noreferrer">Language Reference</a></li>
              <li><a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/index.md" target="_blank" rel="noopener noreferrer">Standard Library</a></li>
              <li><Link href="/examples">Examples</Link></li>
              <li><Link href="/playground">Playground</Link></li>
            </ul>
          </div>

          {/* Download */}
          <div>
            <p className="footer-col-title">Download</p>
            <ul className="footer-links">
              <li><Link href="/download">All Downloads</Link></li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/EzraSetup-1.0.0.exe">
                  Windows (.exe)
                </a>
              </li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-linux-x86_64-1.0.0.tar.gz">
                  Linux (x64)
                </a>
              </li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-macos-aarch64-1.0.0.tar.gz">
                  macOS (ARM64)
                </a>
              </li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0/ezra-lang-1.0.0.vsix">
                  VS Code Extension
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <p className="footer-col-title">Community</p>
            <ul className="footer-links">
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/issues" target="_blank" rel="noopener noreferrer">
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/discussions" target="_blank" rel="noopener noreferrer">
                  Discussions
                </a>
              </li>
              <li>
                <a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/contributing.md" target="_blank" rel="noopener noreferrer">
                  Contributing
                </a>
              </li>
              <li><Link href="/about">About Ezra</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Ezra Language · Created by Ankur Rana · MIT License</span>
          <a
            href="https://github.com/ranaji114/Ezra-programming-lang"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            github.com/ranaji114/Ezra-programming-lang
          </a>
        </div>
      </div>
    </footer>
  );
}
