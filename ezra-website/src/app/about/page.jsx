'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '4rem 1.5rem 3rem', marginTop: '64px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <span className="badge badge-brand" style={{ marginBottom: '1rem', display: 'inline-block' }}>About</span>
          <h1 style={{ marginBottom: '1rem' }}>About Ezra</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-2)' }}>
            Ezra is a readable, indentation-based scripting language built in Rust.
            It was created with one goal: make programming approachable without sacrificing power.
          </p>
        </div>
      </div>

      {/* AUTHOR */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Creator</h2>
          <div className="author-card">
            <div className="author-avatar">AR</div>
            <div>
              <div className="author-name">Ankur Rana</div>
              <div className="author-role">Creator &amp; Lead Developer</div>
              <p className="author-bio">
                Ankur Rana designed and built Ezra entirely from scratch — the lexer, parser,
                bytecode compiler, FastVM, LSP server, VS Code extension, installer, CI pipeline,
                and all documentation. Ezra is a solo project built out of a genuine love for
                language design and developer tooling.
              </p>
              <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                github.com/ranaji114 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section section-alt" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', maxWidth: 760, margin: '0 auto' }}>
            {[
              ['v1.0.0', 'Current version'],
              ['Rust', 'Implementation language'],
              ['55 / 55', 'Tests passing'],
              ['MIT', 'License'],
              ['Win · Linux · macOS', 'Supported platforms'],
            ].map(([val, label]) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.25rem' }}>{val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 style={{ marginBottom: '1.25rem' }}>Why Ezra was created</h2>
          <p>Most scripting languages force you to think about the language before you think about your problem. Ezra tries to fix that.</p>
          <p>The syntax is designed to read like plain English. <code>check if age &gt;= 18</code> instead of <code>if (age &gt;= 18) {'{'} {'}'}</code>. <code>for each item in list</code> instead of <code>for item in list:</code>. Small differences, big readability improvement.</p>
          <p>Built on Rust, Ezra gets memory safety and fast startup for free. The entire toolchain — formatter, linter, test runner, REPL — ships in a single binary so there is nothing to install separately.</p>

          <h2 style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>Design principles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
            {[
              ['Readability first', 'Code should be scannable without knowing the language.'],
              ['One binary', 'No dependency managers, no config, no setup. Just ezra.'],
              ['Honest errors', 'Error messages tell you what went wrong and where.'],
              ['Safe by default', 'Division by zero, bad indices, wrong types — all caught at runtime with clear messages.'],
            ].map(([title, desc]) => (
              <div key={title} className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem', color: 'var(--brand)' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section section-alt" style={{ paddingTop: '3.5rem' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h2 style={{ marginBottom: '2rem' }}>Timeline</h2>
          <div className="timeline">
            {[
              ['2024', 'Concept & Design', 'Started designing Ezra with readability and simplicity as core goals.'],
              ['Early 2025', 'First Working Interpreter', 'Built the lexer, parser, and tree-walking interpreter in Rust.'],
              ['Mid 2025', 'Standard Library', 'Added file I/O, JSON, math, collections, and OS builtins.'],
              ['Late 2025', 'IDE Integration', 'Created VS Code extension with LSP, Vim/Neovim syntax files.'],
              ['Jan 2026', 'FastVM', 'Rewrote the runtime as a bytecode compiler + register-based VM.'],
              ['July 2026', 'v1.0.0 Release', 'Public release with cross-platform installers, full docs, 55/55 tests.'],
            ].map(([date, title, desc]) => (
              <div key={title} className="tl-item">
                <div className="tl-dot" />
                <div className="tl-date">{date}</div>
                <div className="tl-title">{title}</div>
                <p className="tl-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 style={{ marginBottom: '1.5rem' }}>How Ezra compares</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: 8 }}>
              <thead>
                <tr>
                  {['Feature', 'Ezra', 'Python', 'JavaScript'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Syntax readability',     '✅ English-like',       '✅ Clean',           '⚠ Verbose'],
                  ['Performance',            '✅ Rust VM',            '⚠ CPython',         '✅ JIT (V8)'],
                  ['Memory safety',          '✅ Rust guarantees',    '⚠ GC',             '⚠ GC'],
                  ['Learning curve',         '✅ Designed for all',   '✅ Beginner friendly','⚠ Steeper'],
                  ['Single binary',          '✅ Yes',                '❌ No',              '❌ No'],
                  ['Built-in tooling',       '✅ fmt·lint·test·repl', '⚠ Partial',        '⚠ Partial'],
                  ['Concurrency',            '🔜 Planned',           '⚠ GIL limited',    '✅ async/await'],
                ].map(row => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: i === 1 ? 'var(--text)' : 'var(--text-2)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
