'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />

      {showScrollToTop && (
        <button className="scroll-to-top visible" onClick={scrollToTop}>
          &uarr;
        </button>
      )}

      <style jsx>{`
        main {
          min-height: calc(100vh - 100px);
        }
      `}</style>
    </>
  );
}
