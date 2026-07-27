'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    ezra: [
      { path: '/about', label: 'About Ezra' },
      { path: '/download', label: 'Download' },
      { path: '/docs', label: 'Documentation' },
      { path: '/examples', label: 'Examples' },
      { path: '/playground', label: 'Online Playground' },
    ],
    resources: [
      { path: '/community', label: 'Community' },
      { path: '/support', label: 'Support' },
      { path: '/blog', label: 'Blog' },
      { path: 'https://github.com/ranaji114/Ezra-programming-lang', label: 'GitHub' },
      { path: 'https://github.com/ranaji114/Ezra-programming-lang/releases', label: 'Releases' },
    ],
    help: [
      { path: '/support', label: 'Contact Us' },
      { path: '/docs', label: 'Documentation' },
      { path: '/community', label: 'Community Forum' },
      { path: 'https://github.com/ranaji114/Ezra-programming-lang/issues', label: 'Report an Issue' },
    ],
    legal: [
      { path: '/license', label: 'License (MIT)' },
      { path: '/privacy', label: 'Privacy Policy' },
      { path: '/terms', label: 'Terms of Service' },
    ],
  };

  const socialLinks = [
    { href: 'https://github.com/ranaji114/Ezra-programming-lang', label: 'GitHub', icon: 'github' },
    { href: 'https://discord.gg/example', label: 'Discord', icon: 'discord' },
    { href: 'https://twitter.com/example', label: 'Twitter', icon: 'twitter' },
  ];

  const icons = {
    github: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    discord: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    twitter: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-column">
          <div className="footer-logo">
            <div className="logo-icon">E</div>
            <span className="logo-text">Ezra</span>
          </div>
          <p className="footer-tagline">A readable scripting language built in Rust</p>
          <div className="social-links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label={link.label}
              >
                {icons[link.icon]}
              </a>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category} className="footer-column">
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <ul>
              {links.map((link) => (
                <li key={link.path}>
                  {link.path.startsWith('http') ? (
                    <a href={link.path} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.path}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Ezra Language. All rights reserved.</p>
        <p>
          Created by <a href="https://github.com/ranaji114">Ankur Rana</a>
        </p>
      </div>

      <style jsx>{`
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .footer-tagline {
          color: var(--color-text-muted);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          color: var(--color-text-secondary);
          transition: color var(--transition-fast);
        }

        .social-link:hover {
          color: var(--color-primary);
        }

        .footer-column h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .footer-column ul {
          list-style: none;
        }

        .footer-column li {
          margin-bottom: 0.5rem;
        }

        .footer-column a {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 2rem;
          margin-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .footer-bottom p {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
