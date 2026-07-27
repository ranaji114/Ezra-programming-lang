'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DownloadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('linux');

  const platforms = [
    {
      id: 'windows',
      name: 'Windows',
      icon: '🪟',
      description: 'Windows 10/11 (64-bit)',
      installCommand: 'powershell -ExecutionPolicy Bypass -File install\\install.ps1',
      directDownload: 'https://github.com/ranaji114/Ezra-programming-lang/releases/latest/download/ezra-windows.zip',
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: '🐧',
      description: 'Most Linux distributions',
      installCommand: 'sh install/install.sh',
      directDownload: 'https://github.com/ranaji114/Ezra-programming-lang/releases/latest/download/ezra-linux.tar.gz',
    },
    {
      id: 'macos',
      name: 'macOS',
      icon: '🍎',
      description: 'macOS 10.15+ (Intel & Apple Silicon)',
      installCommand: 'sh install/install.sh',
      directDownload: 'https://github.com/ranaji114/Ezra-programming-lang/releases/latest/download/ezra-macos.tar.gz',
    },
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  const releaseNotes = [
    {
      version: 'v1.0.0',
      date: 'July 2026',
      changes: [
        'Initial public release',
        'Added support for all basic language features',
        'VS Code extension support',
        'Vim syntax highlighting',
        'Complete standard library',
      ],
    },
  ];

  const verifyCommands = [
    {
      command: 'ezra --version',
      expected: 'ezra 1.0.0',
      description: 'Verify installation and check version',
    },
    {
      command: 'ezra run --help',
      expected: 'Displays help message',
      description: 'Check if CLI is working properly',
    },
    {
      command: 'ezra new test_project',
      expected: 'Creates new directory',
      description: 'Test project creation',
    },
  ];

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Download Ezra</h1>
            <p>Get the latest version of Ezra for your platform</p>
          </div>

          {/* Platform Selector */}
          <div className="platform-selector">
            <div className="platform-tabs">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  className={`platform-tab ${selectedPlatform === platform.id ? 'active' : ''}`}
                  onClick={() => setSelectedPlatform(platform.id)}
                >
                  <span>{platform.icon}</span>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>

            {currentPlatform && (
              <div className="platform-content">
                <h3>
                  {currentPlatform.icon} {currentPlatform.name}
                </h3>
                <p>{currentPlatform.description}</p>

                <div className="download-options">
                  <div className="option-card">
                    <h4>Recommended: Automatic Install</h4>
                    <p>
                      Run this command in your terminal to automatically download
                      and install Ezra.
                    </p>
                    <div className="command-block">
                      <code>{currentPlatform.installCommand}</code>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(currentPlatform.installCommand);
                          alert('Copied to clipboard!');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="option-card">
                    <h4>Manual Download</h4>
                    <p>
                      Download the binary directly and add it to your PATH
                      manually.
                    </p>
                    <a
                      href={currentPlatform.directDownload}
                      className="btn btn-primary"
                      download
                    >
                      Download for {currentPlatform.name}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* All Platforms Table */}
      <section className="section section-alt">
        <div className="container">
          <h2>All Platforms</h2>
          <p>
            Don\'t see your platform? Ezra also works on FreeBSD and other
            Unix-like systems. Check the{' '}
            <Link href="/docs/installation">installation guide</Link> for more
            options.
          </p>

          <table className="download-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Architecture</th>
                <th>Install Command</th>
                <th>Direct Download</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((platform) => (
                <tr key={platform.id}>
                  <td>
                    <span>{platform.icon}</span> {platform.name}
                  </td>
                  <td>x86_64 / ARM64</td>
                  <td>
                    <code>{platform.installCommand}</code>
                  </td>
                  <td>
                    <a href={platform.directDownload} className="btn btn-secondary">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verify Installation */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Verify Installation</h2>
            <p>Make sure Ezra is installed correctly</p>
          </div>

          <div className="verify-grid">
            {verifyCommands.map((item, index) => (
              <div key={index} className="card verify-card">
                <div className="verify-step">Step {index + 1}</div>
                <h3>{item.description}</h3>
                <div className="command-block">
                  <code>{item.command}</code>
                </div>
                <div className="expected-output">
                  <span>Expected:</span>
                  <code>{item.expected}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Release Notes */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Release Notes</h2>
            <p>What\'s new in Ezra</p>
          </div>

          <div className="releases">
            {releaseNotes.map((release, index) => (
              <div key={index} className="card release-card">
                <div className="release-header">
                  <h3>Version {release.version}</h3>
                  <span className="badge">{release.date}</span>
                </div>
                <ul className="release-changes">
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex}>{change}</li>
                  ))}
                </ul>
                <div className="release-actions">
                  <a
                    href="https://github.com/ranaji114/Ezra-programming-lang/releases"
                    className="btn btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View All Releases on GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="section">
        <div className="container">
          <h2>System Requirements</h2>
          <div className="requirements-grid">
            <div className="card">
              <h3>Windows</h3>
              <ul>
                <li>Windows 10 or 11 (64-bit)</li>
                <li>PowerShell 5.1+</li>
                <li>~50MB disk space</li>
              </ul>
            </div>
            <div className="card">
              <h3>Linux</h3>
              <ul>
                <li>Most modern distributions</li>
                <li>glibc 2.28+</li>
                <li>~50MB disk space</li>
              </ul>
            </div>
            <div className="card">
              <h3>macOS</h3>
              <ul>
                <li>macOS 10.15 (Catalina) or later</li>
                <li>Intel or Apple Silicon</li>
                <li>~50MB disk space</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Build from Source */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Build from Source</h2>
            <p>Want to build Ezra yourself? Here\'s how.</p>
          </div>

          <div className="build-instructions">
            <div className="card">
              <h3>Prerequisites</h3>
              <ul>
                <li>
                  <a href="https://rustup.rs/">Rust</a> (stable toolchain)
                </li>
                <li>Git</li>
                <li>C Make (for some systems)</li>
              </ul>
            </div>

            <div className="card">
              <h3>Build Steps</h3>
              <ol>
                <li>
                  Clone the repository:
                  <div className="command-block">
                    <code>git clone https://github.com/ranaji114/Ezra-programming-lang</code>
                  </div>
                </li>
                <li>
                  Navigate to the project:
                  <div className="command-block">
                    <code>cd Flux-programming-lang</code>
                  </div>
                </li>
                <li>
                  Build in release mode:
                  <div className="command-block">
                    <code>cargo build --release</code>
                  </div>
                </li>
                <li>
                  Binary will be at: <code>target/release/ezra</code>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .platform-selector {
          margin: 2rem 0;
        }

        .platform-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
          flex-wrap: wrap;
        }

        .platform-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-bg-secondary);
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }

        .platform-tab:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text);
        }

        .platform-tab.active {
          background: var(--color-bg);
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .platform-content {
          padding: 1rem 0;
        }

        .download-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .option-card {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .option-card h4 {
          margin-bottom: 0.5rem;
        }

        .option-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .command-block {
          position: relative;
          background: var(--color-code-bg);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-code-border);
          overflow: auto;
        }

        .command-block code {
          background: transparent;
          padding: 0;
          border: none;
          display: block;
          word-break: break-all;
        }

        .copy-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .copy-btn:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .download-table {
          width: 100%;
          overflow-x: auto;
        }

        .download-table th,
        .download-table td {
          padding: 1rem;
        }

        .download-table td {
          vertical-align: middle;
        }

        .verify-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .verify-card {
          text-align: center;
        }

        .verify-step {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-primary-light);
          color: white;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .expected-output {
          margin-top: 1rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }

        .expected-output span {
          display: block;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .releases {
          display: grid;
          gap: 1rem;
        }

        .release-card {
          border-left: 4px solid var(--color-primary);
        }

        .release-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .release-changes {
          padding-left: 1rem;
          margin-bottom: 1rem;
        }

        .release-changes li {
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }

        .requirements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .build-instructions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .build-instructions li {
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .platform-tabs {
            gap: 0.25rem;
          }

          .platform-tab {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }

          .download-options {
            grid-template-columns: 1fr;
          }

          .verify-grid,
          .requirements-grid,
          .build-instructions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
