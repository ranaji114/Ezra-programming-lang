'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [stars, setStars] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.github.com/repos/ranaji114/Ezra-programming-lang', {
      headers: { 'User-Agent': 'ezra-site' },
    })
      .then(r => r.json())
      .then(d => setStars(d.stargazers_count))
      .catch(() => {});
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/download', label: 'Download' },
    { href: '/docs', label: 'Docs' },
    { href: '/playground', label: 'Playground' },
    { href: '/examples', label: 'Examples' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <Image src="/ezra-logo.png" alt="Ezra" width={32} height={32} style={{ borderRadius: 8 }} />
          <span>Ezra</span>
          <span className="nav-version">v1.0.0</span>
        </Link>

        {/* Nav links */}
        <ul className="nav-links">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={pathname === l.href ? 'active' : ''}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="nav-right">
          <a
            href="https://github.com/ranaji114/Ezra-programming-lang"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-stars"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            {stars !== null ? stars.toLocaleString() : '—'}
          </a>
          <Link href="/download" className="btn btn-primary btn-sm">
            Download
          </Link>
          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text)' }}
            className="mobile-toggle"
            aria-label="Menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', background: '#fff', padding: '1rem 1.5rem' }}>
          {links.map(l => (
            <Link
              key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '0.65rem 0', color: 'var(--text-2)', borderBottom: '1px solid var(--border)', fontWeight: 500 }}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/download" className="btn btn-primary w-full mt-2" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Download Ezra
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.nav-links) { display: none !important; }
          :global(.mobile-toggle) { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
