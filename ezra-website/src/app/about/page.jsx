'use client';

import Link from 'next/link';

export default function AboutPage() {
  const timeline = [
    {
      date: '2024',
      title: 'Concept & Design',
      description: 'Started designing Ezra with a focus on readability and simplicity',
    },
    {
      date: 'Early 2025',
      title: 'First Implementation',
      description: 'Built the first working prototype in Rust',
    },
    {
      date: 'Mid 2025',
      title: 'Standard Library',
      description: 'Developed comprehensive standard library with common utilities',
    },
    {
      date: 'Late 2025',
      title: 'IDE Integration',
      description: 'Created VS Code extension and Vim support',
    },
    {
      date: 'July 2026',
      title: 'Public Release v1.0.0',
      description: 'Launched Ezra to the public with full documentation',
    },
  ];

  const designPrinciples = [
    {
      title: 'Readability First',
      description: 'Code should be easy to read and understand at a glance',
      example: 'Natural language-like syntax',
    },
    {
      title: 'Simplicity',
      description: 'Keep the language simple and intuitive',
      example: 'Minimal boilerplate code',
    },
    {
      title: 'Performance',
      description: 'Leverage Rust for speed and safety',
      example: 'Compiled to efficient native code',
    },
    {
      title: 'Practicality',
      description: 'Solve real-world problems efficiently',
      example: 'Built-in JSON, file I/O, and more',
    },
  ];

  const contributors = [
    {
      name: 'Ankur Rana',
      role: 'Creator & Lead Developer',
      github: 'ranaji114',
      description: 'Main architect and primary developer of Ezra',
    },
  ];

  const comparison = [
    {
      feature: 'Syntax Readability',
      ezra: '✅ Natural, English-like',
      python: '✅ Good',
      javascript: '⚠️ Can be verbose',
    },
    {
      feature: 'Performance',
      ezra: '✅ Rust-based, very fast',
      python: '⚠️ Interpreted, slower',
      javascript: '✅ JIT compiled, fast',
    },
    {
      feature: 'Learning Curve',
      ezra: '✅ Designed for beginners',
      python: '✅ Beginner friendly',
      javascript: '⚠️ Steeper curve',
    },
    {
      feature: 'Memory Safety',
      ezra: '✅ Rust guarantees',
      python: '⚠️ GC-based',
      javascript: '⚠️ GC-based',
    },
    {
      feature: 'Concurrency',
      ezra: '🟡 Planned',
      python: '⚠️ GIL limited',
      javascript: '✅ Async/await',
    },
  ];

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>About Ezra</h1>
            <p>
              Ezra is a modern scripting language designed for readability,
              simplicity, and performance.
            </p>
          </div>

          {/* Introduction */}
          <div className="intro-section">
            <div className="intro-content">
              <p className="lead">
                Ezra was created with one simple goal: to make programming more
                accessible and enjoyable. Built on the foundation of Rust, Ezra
                combines the safety and performance of a systems language with the
                ease of use of a scripting language.
              </p>
              <p>
                Whether you\'re a seasoned developer or just starting your coding
                journey, Ezra provides a clean, intuitive syntax that lets you focus
                on solving problems rather than wrestling with language
                complexities.
              </p>
            </div>
            <div className="intro-stats">
              <div className="stat">
                <div className="stat-value">1.0.0</div>
                <div className="stat-label">Current Version</div>
              </div>
              <div className="stat">
                <div className="stat-value">Rust</div>
                <div className="stat-label">Built With</div>
              </div>
              <div className="stat">
                <div className="stat-value">MIT</div>
                <div className="stat-label">License</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Design Philosophy</h2>
            <p>What makes Ezra different</p>
          </div>

          <div className="principles-grid">
            {designPrinciples.map((principle, index) => (
              <div key={index} className="card principle-card">
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
                <div className="principle-example">
                  <code>{principle.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Project Timeline</h2>
            <p>The journey of Ezra from concept to reality</p>
          </div>

          <div className="timeline">
            {timeline.map((event, index) => (
              <div key={index} className="timeline-event">
                <div className="timeline-date">{event.date}</div>
                <div className="timeline-content">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>The Team</h2>
            <p>Meet the people behind Ezra</p>
          </div>

          <div className="contributors-grid">
            {contributors.map((contributor, index) => (
              <div key={index} className="card contributor-card">
                <div className="contributor-avatar">
                  {contributor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3>{contributor.name}</h3>
                <p className="role">{contributor.role}</p>
                <p>{contributor.description}</p>
                <div className="contributor-links">
                  <a
                    href={`https://github.com/${contributor.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>How Ezra Compares</h2>
            <p>
              See how Ezra stacks up against other popular languages
            </p>
          </div>

          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Ezra</th>
                  <th>Python</th>
                  <th>JavaScript</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr key={index}>
                    <td>{row.feature}</td>
                    <td>{row.ezra}</td>
                    <td>{row.python}</td>
                    <td>{row.javascript}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="alert alert-info" style={{ marginTop: '2rem' }}>
            <p>
              <strong>Note:</strong> Ezra is a new language and is still evolving.
              Some features may not be available yet, but we\'re actively working on
              expanding Ezra\'s capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Why Ezra */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Ezra?</h2>
            <p>Reasons to use Ezra for your next project</p>
          </div>

          <div className="why-grid">
            <div className="card why-card">
              <h3>🎯 Perfect for Beginners</h3>
              <p>
                Ezra\'s clean syntax was designed with newcomers in mind. If
                you\'re learning to code, Ezra helps you focus on concepts rather
                than language quirks.
              </p>
            </div>
            <div className="card why-card">
              <h3>⚡ Built for Performance</h3>
              <p>
                Thanks to Rust, Ezra offers excellent performance while maintaining
                memory safety. You get the best of both worlds.
              </p>
            </div>
            <div className="card why-card">
              <h3>📦 Batteries Included</h3>
              <p>
                Ezra comes with a comprehensive standard library that includes
                everything from JSON parsing to file I/O.
              </p>
            </div>
            <div className="card why-card">
              <h3>🔧 Great Tooling</h3>
              <p>
                First-class IDE support with VS Code extension, Vim support, and
                powerful CLI tools for development.
              </p>
            </div>
            <div className="card why-card">
              <h3>🌍 Cross-Platform</h3>
              <p>
                Ezra works on Windows, Linux, and macOS. Write once, run anywhere.
              </p>
            </div>
            <div className="card why-card">
              <h3>📚 Well Documented</h3>
              <p>
                Comprehensive documentation with tutorials, examples, and detailed
                reference guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="section">
        <div className="container">
          <div className="get-involved-card">
            <h2>Get Involved</h2>
            <p>
              Ezra is an open-source project, and we welcome contributions from
              everyone. Whether you want to report bugs, suggest features, or
              contribute code, your help is valuable.
            </p>
            <div className="involved-actions">
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
              <Link href="/community" className="btn btn-outline">
                Join the Community
              </Link>
              <Link href="/docs" className="btn btn-secondary">
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .lead {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .intro-section {
          display: grid;
          gap: 2rem;
          align-items: center;
        }

        .intro-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          text-align: center;
        }

        .stat {
          padding: 1.5rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-label {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .principle-card {
          text-align: center;
        }

        .principle-card h3 {
          margin-bottom: 0.5rem;
        }

        .principle-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .principle-example {
          padding: 0.75rem;
          background: var(--color-code-bg);
          border-radius: var(--radius-md);
        }

        .principle-example code {
          background: transparent;
          padding: 0;
          border: none;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0.75rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
        }

        .timeline-event {
          position: relative;
          padding-bottom: 2rem;
        }

        .timeline-event::before {
          content: '';
          position: absolute;
          left: -2rem;
          top: 0.25rem;
          width: 16px;
          height: 16px;
          background: var(--color-primary);
          border-radius: 50%;
          border: 2px solid var(--color-bg);
        }

        .timeline-date {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-primary-light);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .timeline-content {
          background: var(--color-bg);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          margin-left: 1rem;
        }

        .timeline-content h3 {
          margin-bottom: 0.5rem;
        }

        .timeline-content p {
          color: var(--color-text-secondary);
          margin: 0;
        }

        .contributors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .contributor-card {
          text-align: center;
        }

        .contributor-avatar {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0 auto 1rem;
        }

        .contributor-card h3 {
          margin-bottom: 0.25rem;
        }

        .role {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .contributor-links {
          margin-top: 1rem;
        }

        .comparison-table-container {
          overflow-x: auto;
        }

        .comparison-table {
          width: 100%;
          min-width: 600px;
        }

        .comparison-table th,
        .comparison-table td {
          padding: 1rem;
          text-align: center;
        }

        .comparison-table th {
          background: var(--color-bg-secondary);
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .why-card {
          text-align: center;
        }

        .why-card h3 {
          margin-bottom: 0.5rem;
        }

        .why-card p {
          color: var(--color-text-secondary);
        }

        .get-involved-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .get-involved-card h2 {
          margin-bottom: 1rem;
        }

        .get-involved-card p {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        .involved-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .intro-section {
            grid-template-columns: 1fr;
          }

          .intro-stats {
            grid-template-columns: 1fr;
          }

          .timeline::before {
            left: 0.25rem;
          }

          .timeline-event::before {
            left: -1.25rem;
          }

          .timeline-content {
            margin-left: 0.5rem;
          }

          .contributors-grid,
          .principles-grid,
          .why-grid {
            grid-template-columns: 1fr;
          }

          .involved-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
