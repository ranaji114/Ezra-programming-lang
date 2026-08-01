'use client';
import Link from 'next/link';

const PRINCIPLES = [
  { icon: '📖', title: 'Readability First', desc: 'Code should read like sentences, not puzzles. Every keyword in Ezra was chosen to match how developers naturally think and speak.' },
  { icon: '🎯', title: 'Simplicity Over Complexity', desc: 'If a feature can be expressed simply, it should be. Ezra avoids the accumulation of syntax rules that most languages inherit from decades of backward compatibility.' },
  { icon: '📐', title: 'Consistent Syntax', desc: 'The same patterns appear everywhere. Learn one concept and you understand the pattern for all others. There are no special cases hiding in corners.' },
  { icon: '🌱', title: 'Beginner-Friendly', desc: 'Ezra should be the first language someone can pick up and read without a manual. Experienced developers should find it equally expressive and productive.' },
  { icon: '⚡', title: 'Modern Developer Experience', desc: 'Formatting, linting, testing, and a REPL ship in the same binary. There is no ecosystem of separate tools to install and configure before you can start.' },
  { icon: '✨', title: 'Clean and Expressive Code', desc: 'Ezra programs should look good on paper. Consistent indentation, meaningful keywords, and no noise — code that you can hand to anyone and they will understand the intent.' },
];

const VISION = [
  { icon: '📦', title: 'Package Manager', desc: 'A built-in package manager so developers can share and reuse Ezra libraries without external tooling.' },
  { icon: '🔌', title: 'Full LSP Support', desc: 'A complete Language Server with go-to-definition across files, rename symbol, find all references, and code actions.' },
  { icon: '📚', title: 'Expanded Standard Library', desc: 'HTTP client, regex, CSV, date/time, concurrency primitives — a stdlib that covers the most common real-world scripting tasks.' },
  { icon: '🌍', title: 'Cross-Platform Ecosystem', desc: 'Prebuilt binaries for every major platform and architecture, including WebAssembly for browser execution.' },
  { icon: '🤝', title: 'Community-Driven', desc: 'Language decisions made openly with community input. RFCs, discussions, and a governance model that keeps Ezra focused and honest.' },
  { icon: '🛠', title: 'Better Tooling', desc: 'A language-aware code formatter that understands intent, not just whitespace. Linter rules that catch real mistakes, not style preferences.' },
];

const TIMELINE = [
  { date: '2024', title: 'The Idea', desc: 'Started exploring language design and compiler theory. Began sketching what a readable scripting language could look like.' },
  { date: 'Early 2025', title: 'First Interpreter', desc: 'Built the lexer, parser, and a tree-walking interpreter from scratch in Rust. First time ezra run produced output.' },
  { date: 'Mid 2025', title: 'Standard Library', desc: 'Added file I/O, JSON, math, collections, and OS builtins. The language became actually useful for small scripts.' },
  { date: 'Late 2025', title: 'IDE Integration', desc: 'VS Code extension with syntax highlighting and LSP. Vim and Neovim support. Ezra started to feel like a real development environment.' },
  { date: 'Jan 2026', title: 'FastVM', desc: 'Rewrote the runtime as a bytecode compiler and register-based VM. Performance improved dramatically. The language architecture stabilized.' },
  { date: 'July 2026', title: 'v1.0.0 Released', desc: 'First public release. Cross-platform installers, 55/55 tests passing, complete documentation, and a working browser playground.' },
];

export default function AboutPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', padding: '4rem 1.5rem 3rem', marginTop: '64px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <span className="badge badge-brand" style={{ marginBottom: '1rem', display: 'inline-block' }}>About</span>
          <h1 style={{ marginBottom: '1rem' }}>About Ezra</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
            Ezra is a readable, indentation-based scripting language built in Rust.
            It started as a curiosity about how programming languages work, and grew into
            a long-term project about making code that reads like thought.
          </p>
        </div>
      </div>

      {/* 1. THE STORY */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📜</span>
            <h2 style={{ margin: 0 }}>The Story Behind Ezra</h2>
          </div>
          <p>
            The idea for Ezra came from a simple frustration: most programming languages carry decades of
            design decisions that made sense at the time but create friction for new learners today.
            Syntax borrowed from C, edge cases inherited from earlier versions, and conventions that
            nobody would choose today if starting fresh.
          </p>
          <p>
            The question that started everything was straightforward — what would a scripting language
            look like if it were designed entirely around clarity? Not performance, not
            backward compatibility, not cleverness. Just: can a person read this code and understand it
            immediately?
          </p>
          <p>
            Ezra is the answer to that question. It is a language where <code>check if age &gt;= 18</code> is
            a valid statement, where functions are defined with <code>give</code>, where you iterate a list
            with <code>for each item in items</code>. The syntax matches how developers naturally describe
            their intentions to other people. The goal is not to be different for the sake of it,
            but to remove the translation layer between thinking and writing.
          </p>
          <p>
            Built on Rust, Ezra inherits memory safety and fast startup with no garbage collector.
            The entire toolchain — formatter, linter, test runner, and REPL — ships in a single binary.
            There is nothing to install, configure, or update separately.
          </p>
        </div>
      </section>

      {/* 2. PHILOSOPHY */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <h2 style={{ margin: 0 }}>The Philosophy</h2>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', maxWidth: 520, margin: '0 auto 3rem' }}>
            Six principles guide every decision about Ezra — from syntax design to standard library APIs.
          </p>
          <div className="features-grid">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="card feat-card">
                <div className="feat-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE NAME */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>✏️</span>
            <h2 style={{ margin: 0 }}>Why the Name "Ezra"?</h2>
          </div>
          <p>
            The name Ezra was chosen for what it is not, as much as for what it is.
            It is not an acronym, not a technical term, not a variation of another language name.
            It is simply a name — short, memorable, easy to pronounce in any language, and
            carrying no baggage from the world of computer science.
          </p>
          <p>
            Ezra is an ancient name that means <em>helper</em>. That captures the intent perfectly.
            A programming language is a tool that helps you express ideas. It should stay
            out of the way, assist without complicating, and serve the developer — not the other
            way around.
          </p>
          <p>
            Simple name. Clear purpose. That is the point.
          </p>
        </div>
      </section>

      {/* 4. BEHIND THE PROJECT */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🔧</span>
            <h2 style={{ margin: 0 }}>Behind the Project</h2>
          </div>
          <p>
            Ezra is an independent, open-source programming language project. Every part of it —
            the lexer, the parser, the bytecode compiler, the virtual machine, the standard library,
            the Language Server Protocol implementation, the VS Code extension, the installer, and
            the documentation — was built from scratch and maintained by a single person.
          </p>
          <p>
            The project is not affiliated with any company, university, or organization.
            It exists because someone wanted to understand how programming languages work from
            the inside, and the best way to understand something is to build it.
          </p>
          <p>
            Ezra evolves through continuous experimentation. Features are added when they make the
            language more useful or more readable. Nothing is added to match other languages or
            satisfy trends. The guiding question is always the same: does this make Ezra
            better to use?
          </p>
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1.25rem', textAlign: 'center' }}>
              {[['Rust', 'Implementation'], ['v1.0.0', 'Current version'], ['MIT', 'License'], ['55 / 55', 'Tests passing'], ['Solo', 'Development'], ['Open source', 'Forever']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '1.05rem' }}>{val}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET THE CREATOR */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span>
            <h2 style={{ margin: 0 }}>Meet the Creator</h2>
          </div>

          <div className="author-card">
            <div className="author-avatar">AR</div>
            <div>
              <div className="author-name">Ankur Rana</div>
              <div className="author-role">Creator &amp; Lead Developer · India</div>
              <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', marginBottom: '1rem', display: 'inline-flex' }}>
                github.com/ranaji114 →
              </a>
            </div>
          </div>

          <p style={{ marginTop: '2rem' }}>
            My name is Ankur Rana. I am a student from India, and I created Ezra.
          </p>
          <p>
            I became fascinated by programming languages not just as tools for writing software,
            but as designed systems — each one a set of choices about syntax, semantics, and
            what to make easy versus what to make deliberate. That curiosity led me to compiler
            design, language architecture, parser theory, and runtime internals.
          </p>
          <p>
            Ezra began as a personal exploration. I wanted to know what it actually takes to
            build a language from the ground up. Not a toy with a hundred lines of code, but a
            real interpreter with proper error reporting, a formatter, a linter, a standard library,
            and IDE support. I wanted to understand every layer — from the character stream in the
            lexer to the bytecode instructions in the VM.
          </p>
          <p>
            I built Ezra in Rust because Rust forces precision. You cannot be vague about memory
            ownership. You cannot ignore error handling. Writing a compiler in Rust made me a
            better programmer and a more thoughtful language designer.
          </p>
          <p>
            Ezra is not a side project I plan to abandon. It is a long-term learning project that
            I plan to keep building for as long as there are things worth building. Every version
            is an opportunity to experiment with new ideas, correct past mistakes, and make the
            language better than it was.
          </p>
          <p>
            I am not a researcher or a professor. I am a student who wanted to understand how
            programming languages work, and who found the best way to understand them was to build one.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🗓</span>
            <h2 style={{ margin: 0 }}>How Ezra Got Here</h2>
          </div>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" />
                <div className="tl-date">{t.date}</div>
                <div className="tl-title">{t.title}</div>
                <p className="tl-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VISION */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>🔭</span>
            <h2 style={{ margin: 0 }}>The Vision</h2>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', maxWidth: 540, margin: '0 auto 3rem' }}>
            Ezra v1.0.0 is a foundation, not a destination. These are the areas the project is moving toward.
          </p>
          <div className="features-grid">
            {VISION.map((v, i) => (
              <div key={i} className="card feat-card">
                <div className="feat-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. OPEN SOURCE */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🤝</span>
            <h2 style={{ margin: 0 }}>Open Source</h2>
          </div>
          <p>
            Ezra is open source under the MIT License. Every line of code — the compiler, the
            standard library, the VS Code extension, the documentation, and the installer — is
            publicly available and free to use, modify, and distribute.
          </p>
          <p>
            The project welcomes everyone. You do not need to be a compiler expert to contribute.
            If you found a bug, open an issue. If the documentation confused you, a pull request
            to improve it is valuable. If you have an idea for a language feature, start a
            discussion. If you just want to use Ezra and share feedback, that matters too.
          </p>
          <p>
            Good programming languages are shaped by the people who use them. Ezra is no different.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              View on GitHub →
            </a>
            <a href="https://github.com/ranaji114/Ezra-programming-lang/issues" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Report a Bug
            </a>
            <a href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/docs/contributing.md" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Contributing Guide
            </a>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📊</span>
            <h2 style={{ margin: 0 }}>How Ezra Compares</h2>
          </div>
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
                  ['Syntax readability',  '✅ English-like keywords',   '✅ Clean indentation',    '⚠ C-style with brackets'],
                  ['Single binary',       '✅ All tools included',       '❌ Separate ecosystem',   '❌ Separate ecosystem'],
                  ['Memory safety',       '✅ Rust guarantees',          '⚠ GC-managed',           '⚠ GC-managed'],
                  ['Learning curve',      '✅ Designed for all levels',  '✅ Beginner friendly',    '⚠ Many quirks'],
                  ['Performance',         '✅ Rust-backed VM',           '⚠ CPython overhead',     '✅ JIT compiled'],
                  ['Built-in formatter',  '✅ ezra fmt',                  '⚠ Separate (black)',     '⚠ Separate (prettier)'],
                  ['Built-in test runner','✅ ezra test',                 '✅ unittest built-in',   '⚠ Separate (jest)'],
                ].map(row => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: i === 1 ? 500 : 400, color: i === 1 ? 'var(--text)' : 'var(--text-2)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. CLOSING NOTE */}
      <section className="section" style={{ background: 'var(--brand-bg)', borderTop: '1px solid var(--brand-border)', padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>🚀</div>
          <h2 style={{ marginBottom: '1.25rem' }}>Building Ezra One Step at a Time</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            Ezra is not finished. It may never be finished. That is not a weakness —
            that is what makes it worth working on.
          </p>
          <p style={{ color: 'var(--text-3)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Every compiler pass is a lesson. Every syntax decision is a philosophy.
            Every test that passes is a promise kept. Ezra is built with the belief that
            good tools make people more capable, and that the work of building those tools
            is meaningful in itself.
          </p>
          <p style={{ color: 'var(--text-3)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            If you are using Ezra, contributing to it, or just watching it evolve —
            thank you. You are part of what makes this worth doing.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/download" className="btn btn-primary btn-lg">Download Ezra →</Link>
            <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">View on GitHub</a>
          </div>
          <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: 'var(--text-3)' }}>
            Ezra v1.0.0 · Created by <a href="https://github.com/ranaji114" target="_blank" rel="noopener noreferrer">Ankur Rana</a> · MIT License
          </p>
        </div>
      </section>
    </>
  );
}
