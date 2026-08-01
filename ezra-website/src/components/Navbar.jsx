'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [stars, setStars] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('https://api.github.com/repos/ranaji114/Ezra-programming-lang', { headers: { 'User-Agent': 'ezra-site' } })
      .then(r => r.json()).then(d => setStars(d.stargazers_count)).catch(() => {});
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/download', label: 'Download' },
    { href: '/docs', label: 'Docs' },
    { href: '/examples', label: 'Examples' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="nav-logo">
          <div className="logo-mark">E</div>
          <span>Ezra</span>
        </Link>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {stars !== null && (
            <a href="https://github.com/ranaji114/Ezra-programming-lang" target="_blank" rel="noopener noreferrer" className="nav-stars" style={{textDecoration:'none'}}>
              <span>★</span> {stars.toLocaleString()}
            </a>
          )}
          <Link href="/download" className="btn btn-primary btn-sm">Download</Link>
          <button
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{background:'none',border:'none',color:'var(--text)',cursor:'pointer',padding:'0.4rem',display:'none'}}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{background:'rgba(10,10,15,0.97)',borderTop:'1px solid var(--border)',padding:'1rem 1.5rem'}}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{display:'block',padding:'0.75rem 0',color:'var(--text-2)',borderBottom:'1px solid var(--border)'}}>
              {l.label}
            </Link>
          ))}
          <Link href="/download" className="btn btn-primary" style={{width:'100%',marginTop:'1rem',justifyContent:'center'}} onClick={() => setMenuOpen(false)}>
            Download Ezra
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
