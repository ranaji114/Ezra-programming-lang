'use client';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>{children}</main>
      <Footer />
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--brand)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(232,96,10,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 0.2s', zIndex: 50,
          }}
          aria-label="Back to top"
        >↑</button>
      )}
    </>
  );
}
