'use client';
import { useState } from 'react';
import Link from 'next/link';

const DOC_SECTIONS = [
  {
    title: 'Getting Started',
    desc: 'Install Ezra, write your first program, and understand the basic project layout.',
    icon: '🚀',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/getting-started.md',
    badge: 'Start here',
  },
  {
    title: 'Language Reference',
    desc: 'Complete reference for variables, types, operators, control flow, functions, and more.',
    icon: '📗',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/language-reference.md',
  },
  {
    title: 'Standard Library',
    desc: 'Full API docs for the Ezra standard library — math, I/O, collections, strings, JSON.',
    icon: '📦',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/index.md',
  },
  {
    title: 'CLI Reference',
    desc: 'All CLI commands: run, repl, format, lint, test, and their flags.',
    icon: '🖥️',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/cli-reference.md',
  },
  {
    title: 'Syntax Guide',
    desc: 'Detailed walkthrough of Ezra syntax: basics, control flow, functions, and advanced patterns.',
    icon: '📖',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/syntax/basics.md',
  },
  {
    title: 'Tutorials',
    desc: 'Step-by-step tutorials building real programs with Ezra.',
    icon: '🎓',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/tutorial.md',
  },
  {
    title: 'Tooling & Editor Support',
    desc: 'VS Code extension, Vim plugin, formatter, linter, and REPL usage.',
    icon: '🔧',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/tooling.md',
  },
  {
    title: 'Examples',
    desc: 'Practical code examples covering common patterns and use cases.',
    icon: '💡',
    href: '/examples',
    internal: true,
  },
  {
    title: 'Contributing',
    desc: 'How to contribute to the Ezra language, tooling, docs, or the website.',
    icon: '🤝',
    href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/contributing.md',
  },
];

const QUICK_LINKS = [
  { label: 'Variables', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/syntax/basics.md' },
  { label: 'Functions', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/syntax/functions.md' },
  { label: 'Control Flow', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/syntax/control-flow.md' },
  { label: 'Collections', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/collections.md' },
  { label: 'Math', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/math.md' },
  { label: 'I/O', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/io.md' },
  { label: 'Advanced', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/syntax/advanced.md' },
  { label: 'Release Notes', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/release.md' },
];

export default function DocsPage() {
  const [query, setQuery] = useState('');

  const filtered = DOC_SECTIONS.filter(
    s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <p className="page-hero-tag">Documentation</p>
          <h1>Ezra Documentation</h1>
          <p>Everything you need to write, run, and understand Ezra programs.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <input
              type="search"
              className="docs-search"
              placeholder="Search docs..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search documentation"
            />
          </div>
        </div>
      </section>

      {/* Quick links */}
      <div style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '0.875rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>Quick:</span>
            {QUICK_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--brand)',
                  background: 'var(--brand-light)',
                  padding: '0.2em 0.625em',
                  borderRadius: '99px',
                  border: '1px solid var(--brand-border)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Doc cards */}
      <section className="section">
        <div className="container">
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No results for &quot;{query}&quot;. Try a different search term.
            </p>
          ) : (
            <div className="docs-grid">
              {filtered.map(s => (
                <a
                  key={s.title}
                  href={s.href}
                  target={s.internal ? undefined : '_blank'}
                  rel={s.internal ? undefined : 'noopener noreferrer'}
                  className="card"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <span className="card-icon">{s.icon}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className="card-title" style={{ margin: 0 }}>{s.title}</span>
                    {s.badge && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: 'var(--green-light)',
                        color: 'var(--green)',
                        padding: '0.1em 0.5em',
                        borderRadius: '99px',
                        border: '1px solid #bbf7d0',
                      }}>
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="card-desc">{s.desc}</p>
                  <span style={{ display: 'inline-block', marginTop: '0.875rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand)' }}>
                    Read →
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Can&apos;t find something?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Open an issue on GitHub and we&apos;ll help out.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/ranaji114/Ezra-programming-lang/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open an Issue
            </a>
            <Link href="/playground" className="btn btn-secondary">Try the Playground</Link>
          </div>
        </div>
      </section>
    </>
  );
}
