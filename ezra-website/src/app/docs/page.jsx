'use client';
import Link from 'next/link';
import { useState } from 'react';

const SECTIONS = [
  { title: 'Getting Started', desc: 'Install Ezra and write your first program in 5 minutes.', icon: '🚀', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/getting-started.md' },
  { title: 'Tutorial', desc: 'Step-by-step introduction to variables, loops, functions, and more.', icon: '📖', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/tutorial.md' },
  { title: 'Language Reference', desc: 'Complete syntax reference: every statement, operator, and expression.', icon: '📐', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/language-reference.md' },
  { title: 'Standard Library', desc: 'All built-in functions, methods, and modules with examples.', icon: '📦', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/stdlib/index.md' },
  { title: 'CLI Reference', desc: 'Every ezra command: run, check, test, fmt, lint, build, repl.', icon: '⌨️', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/cli-reference.md' },
  { title: 'Examples', desc: 'Annotated code examples from hello world to JSON and file I/O.', icon: '💡', href: '/examples' },
  { title: 'VS Code Extension', desc: 'Install and configure the Ezra extension for VS Code.', icon: '🔌', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/vscode-extension/flux/README.md' },
  { title: 'Vim / Neovim', desc: 'Set up syntax highlighting and LSP in Vim and Neovim.', icon: '🟩', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/editor-support/vim/README.md' },
  { title: 'Contributing', desc: 'How to contribute: dev setup, running tests, submitting PRs.', icon: '🤝', href: 'https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/contributing.md' },
];

export default function DocsPage() {
  const [q, setQ] = useState('');
  const filtered = SECTIONS.filter(s => !q || s.title.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '4rem 1.5rem 3rem', marginTop: '64px' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Documentation</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.05rem', marginBottom: '1.75rem' }}>
            Everything you need to learn, use, and extend Ezra.
          </p>
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search documentation…"
            style={{ width: '100%', maxWidth: 440, padding: '0.7rem 1rem', border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font)', background: 'var(--bg)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-dark)')}
          />
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {filtered.map(s => (
              <a key={s.title} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ textDecoration: 'none' }}
                onClick={s.href.startsWith('/') ? undefined : undefined}
              >
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                  <h3 style={{ marginBottom: '0.4rem', color: 'var(--brand)', fontSize: '1rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </a>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: 'var(--text-3)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem 0' }}>No results for "{q}"</p>
            )}
          </div>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Documentation lives on GitHub</p>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', margin: 0 }}>All docs are Markdown files in the repository. Click any card to open on GitHub.</p>
            </div>
            <a href="https://github.com/ranaji114/Ezra-programming-lang/tree/main/docs" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              Browse on GitHub →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
