'use client';

import Link from 'next/link';

export default function DocsPage() {
  const docSections = [
    {
      title: 'Getting Started',
      description: 'New to Ezra? Start here to learn the basics.',
      links: [
        { path: '/docs/tutorial', label: 'Tutorial' },
        { path: '/docs/installation', label: 'Installation Guide' },
        { path: '/docs/first-program', label: 'Your First Program' },
      ],
    },
    {
      title: 'Language Reference',
      description: 'Complete documentation of Ezra\'s syntax and features.',
      links: [
        { path: '/docs/language-reference', label: 'Syntax Overview' },
        { path: '/docs/variables', label: 'Variables & Types' },
        { path: '/docs/functions', label: 'Functions' },
        { path: '/docs/control-flow', label: 'Control Flow' },
        { path: '/docs/error-handling', label: 'Error Handling' },
        { path: '/docs/modules', label: 'Modules' },
      ],
    },
    {
      title: 'Standard Library',
      description: 'Built-in functions and modules.',
      links: [
        { path: '/docs/stdlib', label: 'Standard Library Overview' },
        { path: '/docs/stdlib/io', label: 'I/O Operations' },
        { path: '/docs/stdlib/math', label: 'Math Functions' },
        { path: '/docs/stdlib/collections', label: 'Collections' },
        { path: '/docs/stdlib/json', label: 'JSON Support' },
        { path: '/docs/stdlib/fs', label: 'File System' },
      ],
    },
    {
      title: 'Tools & CLI',
      description: 'Command line tools and development utilities.',
      links: [
        { path: '/docs/cli-reference', label: 'CLI Reference' },
        { path: '/docs/editor-setup', label: 'Editor Setup' },
        { path: '/docs/formatter', label: 'Code Formatter' },
        { path: '/docs/linter', label: 'Linter' },
        { path: '/docs/testing', label: 'Testing' },
      ],
    },
    {
      title: 'Advanced Topics',
      description: 'For experienced users.',
      links: [
        { path: '/docs/metaprogramming', label: 'Metaprogramming' },
        { path: '/docs/performance', label: 'Performance Tips' },
        { path: '/docs/ffi', label: 'Foreign Function Interface' },
        { path: '/docs/embed', label: 'Embedding Ezra' },
      ],
    },
  ];

  const popularGuides = [
    {
      title: 'Ezra for Python Developers',
      path: '/docs/python-to-ezra',
      description: 'Learn Ezra if you know Python',
    },
    {
      title: 'Ezra for JavaScript Developers',
      path: '/docs/javascript-to-ezra',
      description: 'Learn Ezra if you know JavaScript',
    },
    {
      title: 'Best Practices',
      path: '/docs/best-practices',
      description: 'Write idiomatic Ezra code',
    },
    {
      title: 'Debugging',
      path: '/docs/debugging',
      description: 'Debug your Ezra applications',
    },
  ];

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra Documentation</h1>
            <p>
              Comprehensive guides and references to help you learn and master
              Ezra
            </p>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search documentation..."
                className="search-input"
              />
              <button className="btn btn-primary">Search</button>
            </div>
            <p className="search-tip">
              Tip: Use the search bar above or browse categories below
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="section section-alt">
        <div className="container">
          <h2>Documentation by Category</h2>

          <div className="docs-grid">
            {docSections.map((section, index) => (
              <div key={index} className="card docs-card">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <ul className="docs-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href={link.path}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Guides</h2>
            <p>Hand-picked guides to help you get the most out of Ezra</p>
          </div>

          <div className="guides-grid">
            {popularGuides.map((guide, index) => (
              <div key={index} className="card guide-card">
                <h3>
                  <Link href={guide.path}>{guide.title}</Link>
                </h3>
                <p>{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Quick Reference</h2>
            <p>Commonly used syntax and patterns</p>
          </div>

          <div className="quick-ref-grid">
            <div className="card">
              <h3>Variables</h3>
              <pre>
                <code>
{`name is "John"`}
{`age is 25`}
{`is_active is true`}
                </code>
              </pre>
            </div>
            <div className="card">
              <h3>Functions</h3>
              <pre>
                <code>
{`give greet(name)`}
{`  say "Hello {name}!"`}
{`greet("World")`}
                </code>
              </pre>
            </div>
            <div className="card">
              <h3>Conditionals</h3>
              <pre>
                <code>
{`check if age >= 18`}
{`  say "Adult"`}
{`otherwise if age >= 13`}
{`  say "Teen"`}
{`otherwise`}
{`  say "Child"`}
                </code>
              </pre>
            </div>
            <div className="card">
              <h3>Loops</h3>
              <pre>
                <code>
{`for i in 1..10`}
{`  say i`}
{`for item in [1, 2, 3]`}
{`  say item * 2`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute */}
      <section className="section">
        <div className="container">
          <div className="contribute-card">
            <h2>Help Improve the Documentation</h2>
            <p>
              Found a mistake? Want to add something? The Ezra documentation is
              open source on GitHub.
            </p>
            <div className="contribute-actions">
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/tree/main/docs"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit on GitHub
              </a>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang/issues"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an Issue
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .search-section {
          margin: 2rem 0;
        }

        .search-container {
          display: flex;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .search-tip {
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .docs-card h3 {
          margin-bottom: 0.5rem;
        }

        .docs-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .docs-links {
          list-style: none;
        }

        .docs-links li {
          margin-bottom: 0.5rem;
        }

        .docs-links a {
          color: var(--color-primary);
        }

        .guides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .guide-card h3 {
          margin-bottom: 0.5rem;
        }

        .guide-card h3 a {
          color: var(--color-text);
        }

        .guide-card p {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }

        .quick-ref-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .quick-ref-grid h3 {
          margin-bottom: 1rem;
        }

        .contribute-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .contribute-card h2 {
          margin-bottom: 1rem;
        }

        .contribute-card p {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        .contribute-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .search-container {
            flex-direction: column;
          }

          .docs-grid,
          .guides-grid,
          .quick-ref-grid {
            grid-template-columns: 1fr;
          }

          .contribute-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
