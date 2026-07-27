'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Privacy Policy</h1>
            <p>Last Updated: July 26, 2026</p>
          </div>

          <div className="privacy-content">
            <div className="card">
              <p className="lead">
                This Privacy Policy describes how we collect, use, and disclose your
                information when you use our website and services.
              </p>

              <section>
                <h2>1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us. The types of
                  information we may collect include:
                </p>
                <ul>
                  <li>
                    <strong>Contact Information:</strong> Name and email address when
                    you submit a contact form
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use our
                    website
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type, and
                    operating system
                  </li>
                </ul>
              </section>

              <section>
                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our website</li>
                  <li>Respond to your requests and provide support</li>
                  <li>Send you updates and announcements</li>
                  <li>Monitor and analyze usage patterns</li>
                </ul>
              </section>

              <section>
                <h2>3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information
                  to outside parties. We may share information in the following situations:
                </p>
                <ul>
                  <li>
                    With your consent (e.g., when you choose to make your information
                    public)
                  </li>
                  <li>
                    To comply with legal obligations or respond to legal requests
                  </li>
                  <li>
                    To protect our rights, privacy, safety, or property
                  </li>
                </ul>
              </section>

              <section>
                <h2>4. Cookies and Tracking Technologies</h2>
                <p>
                  Our website may use cookies and similar technologies to enhance your
                  experience. You can control cookies through your browser settings.
                </p>
              </section>

              <section>
                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to
                  protect your personal information. However, please remember that no
                  method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2>6. Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party websites. We are not
                  responsible for the privacy practices or content of these websites.
                  We encourage you to review the privacy policies of any third-party
                  sites you visit.
                </p>
              </section>

              <section>
                <h2>7. Children's Privacy</h2>
                <p>
                  Our services are not directed to children under 13. We do not knowingly
                  collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2>8. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify
                  you of any changes by posting the new Privacy Policy on this page.
                  You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2>9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please{' '}
                  <Link href="/support">contact us</Link>.
                </p>
              </section>

              <div className="privacy-actions">
                <Link href="/" className="btn btn-primary">
                  Back to Home
                </Link>
                <Link href="/terms" className="btn btn-outline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .lead {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
        }

        .privacy-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .privacy-content section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .privacy-content section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .privacy-content h2 {
          color: var(--color-text);
          margin-bottom: 0.75rem;
        }

        .privacy-content p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .privacy-content ul {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .privacy-content li {
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }

        .privacy-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .privacy-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
