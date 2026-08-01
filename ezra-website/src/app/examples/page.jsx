'use client';
import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = ['All', 'Basics', 'Functions', 'Collections', 'Control Flow', 'Error Handling'];

const EXAMPLES = [
  {
    category: 'Basics',
    title: 'Hello World',
    desc: 'The classic first program.',
    code: `say "Hello, World!"`,
  },
  {
    category: 'Basics',
    title: 'Variables & Types',
    desc: 'Declaring variables using the is keyword.',
    code: `name is "Ankur"
age is 25
pi is 3.14159
active is yes

say name
say age
say pi
say active`,
  },
  {
    category: 'Basics',
    title: 'String Interpolation',
    desc: 'Embed variables directly in strings.',
    code: `name is "Ankur"
lang is "Ezra"
version is "1.0.0"
say "Hello, {name}! Welcome to {lang} {version}."`,
  },
  {
    category: 'Functions',
    title: 'Basic Function',
    desc: 'Define and call a function with give.',
    code: `give add(a, b)
  -> a + b

give greet(name)
  -> "Hello, {name}!"

say add(10, 5)
say greet("World")`,
  },
  {
    category: 'Functions',
    title: 'Arrow Functions (Lambdas)',
    desc: 'Short one-liner arrow functions.',
    code: `double is n -> n * 2
square is n -> n * n

say double(7)
say square(5)`,
  },
  {
    category: 'Collections',
    title: 'List Basics',
    desc: 'Creating and accessing lists.',
    code: `fruits is ["apple", "banana", "cherry"]
say fruits
say fruits.len()`,
  },
  {
    category: 'Collections',
    title: 'Filter & Map',
    desc: 'Functional list operations.',
    code: `nums is [1, 2, 3, 4, 5, 6, 7, 8]

evens is nums.filter(n -> n % 2 is 0)
doubled is nums.map(n -> n * 2)
big is nums.filter(n -> n > 4)

say evens
say doubled
say big`,
  },
  {
    category: 'Collections',
    title: 'Dict / Map',
    desc: 'Key-value collections.',
    code: `person is {name: "Ankur", age: 25, lang: "Ezra"}
say person.name
say person.age`,
  },
  {
    category: 'Control Flow',
    title: 'If / Otherwise',
    desc: 'Conditional logic.',
    code: `age is 20

check if age >= 18
  say "You are an adult."
otherwise
  say "You are a minor."`,
  },
  {
    category: 'Control Flow',
    title: 'FizzBuzz',
    desc: 'Classic FizzBuzz with for each loop.',
    code: `for each i in range(1, 21)
  check if i % 15 is 0
    say "FizzBuzz"
  otherwise if i % 3 is 0
    say "Fizz"
  otherwise if i % 5 is 0
    say "Buzz"
  otherwise
    say i`,
  },
  {
    category: 'Control Flow',
    title: 'While Loop',
    desc: 'Looping with a while condition.',
    code: `count is 0
while count < 5
  say "count: {count}"
  count is count + 1`,
  },
  {
    category: 'Error Handling',
    title: 'Attempt / Rescue',
    desc: 'Catch and handle errors gracefully.',
    code: `attempt
  result is int("not a number")
  say result
rescue err
  say "Error caught: {err}"`,
  },
];

function highlight(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(#[^\n]*)/g, '<span class="tok-comment">$1</span>')
    .replace(/\b(say|give|is|check|if|otherwise|for|each|in|while|attempt|rescue|return|and|or|not|yes|no|nothing)\b/g, '<span class="tok-keyword">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="tok-string">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-number">$1</span>')
    .replace(/(->)/g, '<span class="tok-op">$1</span>');
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: copied ? '#56d364' : '#8b949e',
        fontSize: '0.7rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {copied ? '✓' : 'Copy'}
    </button>
  );
}

export default function ExamplesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = EXAMPLES.filter(
    e => activeCategory === 'All' || e.category === activeCategory
  );

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <p className="page-hero-tag">Examples</p>
          <h1>Ezra Examples</h1>
          <p>Browse real Ezra programs covering common patterns and language features.</p>
        </div>
      </section>

      {/* Category filter */}
      <div style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '0 0' }}>
        <div className="container">
          <div className="tab-bar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`tab-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Examples grid */}
      <section className="section">
        <div className="container">
          <div className="examples-grid">
            {filtered.map(ex => (
              <div key={ex.title} className="example-card">
                <div className="example-card-header">
                  <div>
                    <div className="example-card-title">{ex.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{ex.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--brand)',
                      background: 'var(--brand-light)',
                      padding: '0.15em 0.5em',
                      borderRadius: '99px',
                      border: '1px solid var(--brand-border)',
                    }}>
                      {ex.category}
                    </span>
                    <CopyButton text={ex.code} />
                  </div>
                </div>
                <pre
                  className="example-card-code"
                  dangerouslySetInnerHTML={{ __html: highlight(ex.code) }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Try these examples live</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Paste any example into the playground and run it in your browser.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/playground" className="btn btn-primary">Open Playground</Link>
            <a
              href="https://github.com/ranaji114/Ezra-programming-lang/tree/main/examples"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              More on GitHub →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
