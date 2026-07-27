'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Terms of Service</h1>
            <p>Last Updated: July 26, 2026</p>
          </div>

          <div className="terms-content">
            <div className="card">
              <p className="lead">
                These Terms of Service govern your use of the Ezra Language website
                and services. By accessing or using our website, you agree to be
                bound by these terms.
              </p>

              <section>
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Ezra website and services, you agree to
                  these Terms of Service. If you do not agree to these terms, you may
                  not use our services.
                </p>
              </section>

              <section>
                <h2>2. Description of Service</h2>
                <p>
                  Ezra provides a programming language, documentation, tools, and
                  resources for software development. Our services include:
                </p>
                <ul>
                  <li>Access to the Ezra programming language</li>
                  <li>Documentation and tutorials</li>
                  <li>Code examples and playground</li>
                  <li>Community forums and support</li>
                </ul>
              </section>

              <section>
                <h2>3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul>
                  <li>
                    Use our services in compliance with all applicable laws and
                    regulations
                  </li>
                  <li>
                    Not use our services for any illegal or unauthorized purpose
                  </li>
                  <li>
                    Not violate any third-party rights through your use of our
                    services
                  </li>
                  <li>
                    Not transmit any harmful code, viruses, or other malicious
                    software
                  </li>
                </ul>
              </section>

              <section>
                <h2>4. Intellectual Property</h2>
                <p>
                  The Ezra Language and all related content, including
                  documentation, code, and logos, are the intellectual property of
                  Ankur Rana. The Ezra Language is licensed under the MIT License.
                </p>
                <p>
                  You may use, copy, modify, and distribute the Ezra Language in
                  accordance with the MIT License. All other content on this website is
                  protected by copyright and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2>5. Disclaimer of Warranties</h2>
                <p>
                  OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
                  WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED,
                  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p>
                  WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED,
                  TIMELY, SECURE, OR ERROR-FREE.
                </p>
              </section>

              <section>
                <h2>6. Limitation of Liability</h2>
                <p>
                  IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED
                  TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
                  ARISING FROM YOUR USE OR INABILITY TO USE OUR SERVICES.
                </p>
                <p>
                  OUR AGGREGATE LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM THESE
                  TERMS OR YOUR USE OF OUR SERVICES SHALL NOT EXCEED THE GREATER OF ONE
                  HUNDRED DOLLARS ($100) OR THE AMOUNTS YOU HAVE PAID US IN THE PAST
                  TWELVE MONTHS FOR THE SERVICE GIVING RISE TO THE CLAIM.
                </p>
              </section>

              <section>
                <h2>7. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold us harmless from and
                  against any claims, liabilities, damages, losses, and expenses,
                  including without limitation reasonable attorney's fees, arising
                  from your use of our services or your violation of these Terms.
                </p>
              </section>

              <section>
                <h2>8. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the
                  laws of India, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any legal action of whatever nature shall be brought in the courts
                  of India.
                </p>
              </section>

              <section>
                <h2>9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will
                  provide notice of any changes by posting the revised Terms on this
                  page. Your continued use of our services after such changes
                  constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2>10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please{' '}
                  <Link href="/support">contact us</Link>.
                </p>
              </section>

              <div className="terms-actions">
                <Link href="/" className="btn btn-primary">
                  Back to Home
                </Link>
                <Link href="/privacy" className="btn btn-outline">
                  Privacy Policy
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

        .terms-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .terms-content section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .terms-content section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .terms-content h2 {
          color: var(--color-text);
          margin-bottom: 0.75rem;
        }

        .terms-content p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .terms-content ul {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .terms-content li {
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }

        .terms-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .terms-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
