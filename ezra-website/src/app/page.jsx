'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('features');

  const features = [
    {
      icon: '🚀',
      title: 'Fast & Efficient',
      description: 'Built on Rust, Ezra delivers blazing-fast performance with minimal overhead.',
    },
    {
      icon: '📖',
      title: 'Readable Syntax',
      description: 'Clean, intuitive syntax that makes your code easy to read and maintain.',
    },
    {
      icon: '🌍',
      title: 'Cross-Platform',
      description: 'Works on Windows, Linux, and macOS. Install with a single command.',
    },
    {
      icon: '🔧',
      title: 'Modern Tooling',
      description: ' Comes with VS Code extension, Vim support, and powerful CLI tools.',
    },
    {
      icon: '🛡️',
      title: 'Safe & Reliable',
      description: 'Rust\'s memory safety guarantees make Ezra robust and secure.',
    },
    {
      icon: '💡',
      title: 'Easy to Learn',
      description: 'Designed with beginners in mind, but powerful enough for experts.',
    },
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: 'Install Ezra',
      description: 'Download and install Ezra on your system.',
      command: 'sh install/install.sh',
    },
    {
      step: 2,
      title: 'Create a Project',
      description: 'Start a new Ezra project.',
      command: 'ezra new my_app',
    },
    {
      step: 3,
      title: 'Run Your Code',
      description: 'Execute your first Ezra program.',
      command: 'ezra run',
    },
  ];

  const codeExamples = [
    {
      title: 'Hello World',
      code: `name is input "Your name: "\nsay "Hello {name}!"`,
    },
    {
      title: 'Functions',
      code: `give add(a, b)\n  -> a + b\n\nsay add(3, 4)  // 7`,
    },
    {
      title: 'Conditionals',
      code: `age is 25\ncheck if age >= 18\n  say "Adult"\notherwise\n  say "Minor"`,
    },
    {
      title: 'Lists & Filtering',
      code: `nums is [1, 2, 3, 4, 5]\nevens is nums.filter(n -> n % 2 is 0)\nsay evens  // [2, 4]`,
    },
  ];

  const cliCommands = [
    { command: 'ezra run [file.ez]', description: 'Run a program' },
    { command: 'ezra new <name>', description: 'Create a new project' },
    { command: 'ezra check [file.ez]', description: 'Parse without running' },
    { command: 'ezra test [path]', description: 'Run test files' },
    { command: 'ezra fmt [path]', description: 'Format source files' },
    { command: 'ezra lint [path]', description: 'Lint source files' },
    { command: 'ezra repl', description: 'Interactive shell' },
    { command: 'ezra --version', description: 'Print version' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Ezra</h1>
          <p className="hero-subtitle">
            A Readable Scripting Language Built in Rust
          </p>
          <div className="hero-actions">
            <Link href="/download" className="btn btn-primary">
              Download v1.0.0
            </Link>
            <Link href="/playground" className="btn btn-outline">
              Try Online
            </Link>
            <Link href="/docs" className="btn btn-secondary">
              View Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Quick Start</h2>
            <p>Get up and running with Ezra in just 3 steps</p>
          </div>

          <div className="quick-start-grid">
            {quickStartSteps.map((step, index) => (
              <div key={index} className="card quick-start-card">
                <div className="step-number">Step {step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="code-block">
                  <code>{step.command}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Features</h2>
            <p>Why Choose Ezra for Your Next Project</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Language at a Glance</h2>
            <p>Simple, Clean, and Powerful Syntax</p>
          </div>

          <div className="code-examples-grid">
            {codeExamples.map((example, index) => (
              <div key={index} className="card code-example-card">
                <h4>{example.title}</h4>
                <pre>
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link href="/examples" className="btn btn-outline">
              View More Examples
            </Link>
          </div>
        </div>
      </section>

      {/* CLI Reference */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Command Line Interface</h2>
            <p>Powerful CLI Tools for Development</p>
          </div>

          <div className="cli-table-container">
            <table className="cli-table">
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {cliCommands.map((cmd, index) => (
                  <tr key={index}>
                    <td>
                      <code>{cmd.command}</code>
                    </td>
                    <td>{cmd.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link href="/docs/cli-reference" className="btn btn-outline">
              Full CLI Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* IDE Support */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>IDE Support</h2>
            <p>First-Class Editor Integration</p>
          </div>

          <div className="ide-grid">
            <div className="card ide-card">
              <div className="ide-icon vscode">VS</div>
              <h3>VS Code Extension</h3>
              <p>
                Full-featured extension with syntax highlighting, Ezra Neon theme,
                30+ snippets, and LSP support (diagnostics, hover, completions).
              </p>
              <div className="ide-actions">
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=ezra-language"
                  className="btn btn-primary"
                >
                  Install Extension
                </a>
              </div>
            </div>

            <div className="card ide-card">
              <div className="ide-icon vim">VIM</div>
              <h3>Vim/Neovim Support</h3>
              <p>
                Complete Vim integration with syntax files, indent rules, and
                file detection for .ez files.
              </p>
              <div className="ide-actions">
                <Link href="/docs/editor-setup" className="btn btn-outline">
                  Setup Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of developers using Ezra for their projects.
              Download now and experience the future of scripting.
            </p>
            <div className="cta-actions">
              <Link href="/download" className="btn btn-primary">
                Download Ezra
              </Link>
              <Link href="/docs" className="btn btn-outline">
                Read Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          text-align: center;
          padding: 4rem 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        }

        .hero h1 {
          font-size: clamp(2.5rem, 8vw, 4rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          color: var(--color-text-secondary);
          max-width: 700px;
          margin: 0 auto 2rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .quick-start-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .quick-start-card {
          text-align: center;
        }

        .step-number {
          display: inline-block;
          width: 40px;
          height: 40px;
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .code-block {
          background: var(--color-code-bg);
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-top: 1rem;
          border: 1px solid var(--color-code-border);
        }

        .code-block code {
          background: transparent;
          padding: 0;
          border: none;
          color: var(--color-text);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .code-examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .code-example-card h4 {
          margin-bottom: 1rem;
          color: var(--color-primary);
        }

        .cli-table-container {
          overflow-x: auto;
        }

        .cli-table {
          width: 100%;
          min-width: 500px;
        }

        .ide-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .ide-card {
          text-align: center;
        }

        .ide-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.25rem;
        }

        .ide-icon.vscode {
          background: #007acc;
          color: white;
        }

        .ide-icon.vim {
          background: #019733;
          color: white;
        }

        .ide-actions {
          margin-top: 1.5rem;
        }

        .cta-section {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          text-align: center;
        }

        .cta-card {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-card h2 {
          color: white;
          margin-bottom: 1rem;
        }

        .cta-card p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-actions .btn-primary {
          background: white;
          color: var(--color-primary);
        }

        .cta-actions .btn-primary:hover {
          background: #f8fafc;
        }

        .cta-actions .btn-outline {
          border-color: white;
          color: white;
        }

        .cta-actions .btn-outline:hover {
          background: white;
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .quick-start-grid,
          .features-grid,
          .code-examples-grid,
          .ide-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
