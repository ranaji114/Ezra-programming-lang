'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const BASE = 'https://github.com/ranaji114/Ezra-programming-lang/releases/download/v1.0.0';

const TABS = ['Hello World', 'Functions', 'Lists', 'Error Handling'];

const CODE = {
  'Hello World': [
    ['cm','# Your first Ezra program'],
    ['var','name'], ['op',' is '], ['bi','input'], ['str','"Your name: "'],
    ['bi','say'], ['str','"Hello {name}!"'],
  ],
  'Functions': [
    ['kw','give '], ['fn','add'], ['punc','('], ['var','a'], ['punc',', '], ['var','b'], ['punc',')'],
    ['op','  -> '], ['var','a'], ['op',' + '], ['var','b'],
    ['var','result'], ['op',' is '], ['fn','add'], ['punc','('], ['num','3'], ['punc',', '], ['num','4'], ['punc',')'],
    ['bi','say'], ['var',' result'], ['cm','   # 7'],
  ],
  'Lists': [
    ['var','nums'], ['op',' is '], ['punc','['], ['num','1,2,3,4,5'], ['punc',']'],
    ['var','evens'], ['op',' is '], ['var','nums'], ['punc','.'], ['fn','filter'], ['punc','('], ['var','n'], ['op',' -> '], ['var','n'], ['op',' % '], ['num','2'], ['op',' is '], ['num','0'], ['punc',')'],
    ['bi','say'], ['var',' evens'], ['cm','   # [2, 4]'],
    ['var','total'], ['op',' is '], ['var','nums'], ['punc','.'], ['fn','sum'], ['punc','()'],
    ['bi','say'], ['var',' total'], ['cm','   # 15'],
  ],
  'Error Handling': [
    ['kw','try'],
    ['op','  result '], ['op','is '], ['num','10'], ['op',' / '], ['num','0'],
    ['kw','catch '], ['var','err'],
    ['bi','  say'], ['str','"Caught: {err}"'],
    ['kw','finally'],
    ['bi','  say'], ['str','"Always runs"'],
  ],
};

const RAW_CODE = {
  'Hello World': `name is input "Your name: "\nsay "Hello {name}!"`,
  'Functions': `give add(a, b)\n  -> a + b\nsay add(3, 4)   # 7`,
  'Lists': `nums is [1,2,3,4,5]\nevens is nums.filter(n -> n % 2 is 0)\nsay evens   # [2, 4]`,
  'Error Handling': `try\n  result is 10 / 0\ncatch err\n  say "Caught: {err}"\nfinally\n  say "Always runs"`,
};

const FEATURES = [
  { icon: '📖', title: 'Readable Syntax', desc: 'Natural English-like keywords. Write code the way you think, not the way a compiler wants.' },
  { icon: '⚡', title: 'Rust Performance', desc: 'Built on Rust for blazing speed, memory safety, and zero-overhead execution.' },
  { icon: '🌍', title: 'Cross-Platform', desc: 'Single binary for Windows, Linux, and macOS. Install in one command.' },
  { icon: '🔧', title: 'Full Tooling', desc: 'Formatter, linter, test runner, and REPL — all built into one CLI.' },
  { icon: '🔌', title: 'VS Code + Vim', desc: 'Syntax highlighting, LSP support, 30+ snippets, and the Ezra Neon theme.' },
  { icon: '📦', title: 'Rich Stdlib', desc: 'JSON, file I/O, math, collections — batteries included from day one.' },
];

export default function HomePage() {
  const [tab, setTab] = useState('Hello World');
  const [copied, setCopied] = useState(false);
  const [stars, setStars] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/ranaji114/Ezra-programming-lang', { headers: { 'User-Agent': 'ezra-site' } })
      .then(r => r.json()).then(d => setStars(d.stargazers_count)).catch(() => {});
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(RAW_CODE[tab]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">🚀 Ezra v1.0.0 — by Ankur Rana</div>
            <h1>Write code<br /><span className="text-gradient">the way you think</span></h1>
            <p>A readable, indentation-based scripting language built in Rust. Clean syntax, powerful standard library, first-class IDE support.</p>
            <div className="hero-actions">
              <a href={`${BASE}/EzraSetup-1.0.0.exe`} className="btn btn-accent btn-lg" download>
                ⬇ Download for Windows
              </a>
              <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                {stars !== null ? `★ ${stars}` : '★'} GitHub
              </a>
            </div>
            <div className="hero-code">
              <div><span className="kw">give</span> <span className="fn">greet</span><span className="punc">(</span><span className="var">name</span><span className="punc">)</span></div>
              <div>&nbsp;&nbsp;<span className="op">-&gt;</span> <span className="str">"Hello {'{'}name{'}'} from Ezra!"</span></div>
              <div>&nbsp;</div>
              <div><span className="bi">say</span> <span className="fn">greet</span><span className="punc">(</span><span className="str">"Ankur"</span><span className="punc">)</span>&nbsp;<span className="cm"># Hello Ankur from Ezra!</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-window" style={{ animationName: 'float', animationDuration: '4s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}>
              <div className="hero-window-bar">
                <div className="win-dot win-dot-r" /><div className="win-dot win-dot-y" /><div className="win-dot win-dot-g" />
                <span className="win-filename">main.ez</span>
              </div>
              <div className="hero-window-body">
                <div><span className="cm"># Ezra — github.com/ranaji114/Ezra-programming-lang</span></div>
                <div>&nbsp;</div>
                <div><span className="var">nums</span> <span className="op">is</span> <span className="punc">[</span><span className="num">1</span><span className="punc">,</span> <span className="num">2</span><span className="punc">,</span> <span className="num">3</span><span className="punc">,</span> <span className="num">4</span><span className="punc">,</span> <span className="num">5</span><span className="punc">]</span></div>
                <div><span className="var">evens</span> <span className="op">is</span> <span className="var">nums</span><span className="punc">.</span><span className="fn">filter</span><span className="punc">(</span><span className="var">n</span> <span className="op">-&gt;</span> <span className="var">n</span> <span className="op">%</span> <span className="num">2</span> <span className="op">is</span> <span className="num">0</span><span className="punc">)</span></div>
                <div><span className="bi">say</span> <span className="var">evens</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="cm"># [2, 4]</span></div>
                <div>&nbsp;</div>
                <div><span className="kw">try</span></div>
                <div>&nbsp;&nbsp;<span className="var">x</span> <span className="op">is</span> <span className="num">10</span> <span className="op">/</span> <span className="num">0</span></div>
                <div><span className="kw">catch</span> <span className="var">err</span></div>
                <div>&nbsp;&nbsp;<span className="bi">say</span> <span className="str">"Caught: {'{'}err{'}'}"</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          {[['⚙️','Built with','Rust'],['✅','Tests','55 / 55'],['📦','Version','v1.0.0'],['📄','License','MIT'],['🖥','Platforms','Win · Linux · macOS']].map(([icon,label,val],i) => (
            <span key={i} className="stat-item">
              {i > 0 && <span className="stat-sep" />}
              {icon} <span>{label}:</span> <strong>{val}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Why <span className="text-gradient">Ezra?</span></h2>
            <p>Everything you need for modern scripting — in one binary.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="card feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE EXAMPLES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Language at a <span className="text-gradient">Glance</span></h2>
            <p>Clean, readable syntax that gets out of your way.</p>
          </div>
          <div className="code-tabs">
            {TABS.map(t => (
              <button key={t} className={`code-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="code-panel">
            <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
            <pre style={{ margin: 0 }}><code dangerouslySetInnerHTML={{ __html: RAW_CODE[tab]
              .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              .replace(/\b(give|check if|otherwise|repeat|for each|while|until|loop|try|catch|finally|throw|pick|when|return|break|next)\b/g,'<span class="kw">$1</span>')
              .replace(/"([^"]*?)"/g,'<span class="str">"$1"</span>')
              .replace(/\b(say|write|input|input_number|warn|fail|debug|len|range|type_of|parse_json|stringify_json|read_file|write_file)\b/g,'<span class="bi">$1</span>')
              .replace(/\b([0-9]+(?:\.[0-9]+)?)\b/g,'<span class="num">$1</span>')
              .replace(/(#[^\n]*)/g,'<span class="cm">$1</span>')
              .replace(/(->|is|not|and|or|\+|-|\*|\/|%|>=|<=|==|!=|>|<)/g,'<span class="op">$1</span>')
            }} /></pre>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/examples" className="btn btn-outline">View all examples →</Link>
          </div>
        </div>
      </section>

      {/* IDE SUPPORT */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="section-header">
            <h2>First-Class <span className="text-gradient">IDE Support</span></h2>
            <p>Write Ezra with full editor integration out of the box.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⬛</div>
              <h3>VS Code Extension</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Syntax highlighting, Ezra Neon theme, 30+ snippets, LSP diagnostics, hover docs, and Ctrl+R to run.
              </p>
              <a href={`${BASE}/ezra-lang-1.0.0.vsix`} className="btn btn-primary" download>
                ⬇ Download VSIX
              </a>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🟩</div>
              <h3>Vim / Neovim</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Syntax highlighting, file-type detection, auto-indentation, and LSP setup via nvim-lspconfig.
              </p>
              <a href="https://github.com/ranaji114/Ezra-programming-lang/tree/main/editor-support/vim" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Setup Guide →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <h2>Ready to try <span className="text-gradient">Ezra?</span></h2>
            <p>Download the installer and write your first program in minutes. Free and open-source.</p>
            <div className="cta-actions">
              <a href={`${BASE}/EzraSetup-1.0.0.exe`} className="btn btn-accent btn-lg" download>⬇ Download for Windows</a>
              <Link href="/download" className="btn btn-primary btn-lg">All Platforms</Link>
              <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">View on GitHub</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
