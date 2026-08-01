'use client';
import Link from 'next/link';

const STATS = [
  { value: 'v1.0.0', label: 'Current Version' },
  { value: 'Rust', label: 'Built With' },
  { value: 'MIT', label: 'License' },
  { value: '55/55', label: 'Tests Passing' },
];

const TIMELINE = [
  { date: '2024', title: 'Concept & Design', desc: 'Ezra started as an idea — a scripting language that reads like English, powered by Rust.' },
  { date: 'Early 2025', title: 'First Working Build', desc: 'Core parser, interpreter, and basic standard library complete. Variables, functions, and control flow working.' },
  { date: 'Mid 2025', title: 'Standard Library Expansion', desc: 'Math, collections, string manipulation, I/O, and JSON support added. Test suite reaches 55 tests.' },
  { date: 'Late 2025', title: 'IDE Tools', desc: 'VS Code extension published. Vim support added. REPL polished. Formatter and linter included.' },
  { date: 'July 2026', title: 'v1.0.0 Released', desc: 'Public release. Cross-platform binaries for Windows, Linux, macOS. Full documentation.' },
];

const COMPARE = [
  { feature: 'Readable syntax', ezra: '✅', python: '✅', js: '⚠' },
  { feature: 'No braces / semicolons', ezra: '✅', python: '✅', js: '❌' },
  { feature: 'Rust-powered runtime', ezra: '✅', python: '❌', js: '❌' },
  { feature: 'Cross-platform', ezra: '✅', python: '✅', js: '✅' },
  { feature: 'Built-in formatter', ezra: '✅', python: '⚠', js: '❌' },
  { feature: 'VS Code extension', ezra: '✅', python: '✅', js: '✅' },
  { feature: 'Easy to embed', ezra: '✅', python: '⚠', js: '⚠' },
  { feature: 'MIT licensed', ezra: '✅', python: '✅', js: '✅' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <p className="page-hero-tag">About</p>
          <h1>About Ezra</h1>
          <p>The story behind the language, the creator, and the design decisions that shaped it.</p>
        </div>
      </section>

      {/* Author */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Creator</span>
            <h2>Meet the person behind Ezra</h2>
          </div>
          <div className="author-card">
            <div className="author-avatar">AR</div>
            <div className="author-name">Ankur Rana</div>
            <div className="author-role">Creator &amp; Lead Developer</div>
            <p className="author-bio">
              Ankur Rana is the sole creator of Ezra, building the entire language, runtime,
              tooling, and documentation from scratch. Every line of the parser, interpreter,
              standard library, and VS Code extension was written by one person with a vision
              for what a readable scripting language could be.
            </p>
            <a
              href="https://github.com/ranaji114"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              @ranaji114 on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="section-heading" style={{ textAlign: 'left' }}>
            <span className="section-tag">Origin</span>
            <h2>Why Ezra was created</h2>
          </div>
          <p style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
            Ezra was born out of a simple frustration: existing scripting languages either have
            too much syntax noise or too little performance. Python is readable but slow to start
            and deploy. JavaScript is everywhere but the syntax can be confusing for beginners
            and the tooling fragmented.
          </p>
          <p style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
            Ezra sets out to answer the question: <em>what if you could write scripts that look like
            you wrote them in English, but ran on something fast?</em> The Rust runtime means fast
            startup and low memory. The syntax — with keywords like <code>give</code>, <code>is</code>,
            <code>say</code>, <code>check if</code> — means code you can read back to someone who has
            never programmed before and they will mostly understand it.
          </p>
          <p style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: 'var(--text-body)' }}>
            The language is intentionally simple. Ezra does not try to replace large-scale systems
            languages. It is for scripts, automation, learning, and anywhere you want code to be
            approachable and fast to write.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">By the Numbers</span>
            <h2>Ezra at a glance</h2>
          </div>
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">History</span>
            <h2>How Ezra got here</h2>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="timeline">
              {TIMELINE.map(item => (
                <div key={item.date} className="timeline-item">
                  <div className="timeline-date">{item.date}</div>
                  <div className="timeline-title">{item.title}</div>
                  <div className="timeline-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-tag">Comparison</span>
            <h2>Ezra vs other languages</h2>
            <p>How Ezra stacks up on key design criteria.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Feature</th>
                  <th>Ezra</th>
                  <th>Python</th>
                  <th>JavaScript</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(row => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td>{row.ezra}</td>
                    <td>{row.python}</td>
                    <td>{row.js}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
            ✅ Yes &nbsp;⚠ Partial &nbsp;❌ No
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Ready to try Ezra?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '1.0625rem' }}>
            Download for your platform or jump into the browser playground.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/download" className="btn btn-primary btn-lg">Download Ezra</Link>
            <Link href="/playground" className="btn btn-secondary btn-lg">Try in Browser</Link>
          </div>
        </div>
      </section>
    </>
  );
}
