'use client';

import Link from 'next/link';

export default function LicensePage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra License</h1>
            <p>MIT License - Simple and Permissive</p>
          </div>

          <div className="license-content">
            <div className="card">
              <h2>MIT License</h2>
              <p>
                Copyright (c) 2026 Ankur Rana
              </p>

              <pre>
{`Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
              </pre>

              <div className="license-info">
                <h3>What This Means</h3>
                <ul>
                  <li>
                    <strong>You can use Ezra for any purpose</strong> - commercial,
                    non-commercial, personal, or otherwise
                  </li>
                  <li>
                    <strong>You can modify Ezra</strong> - create your own version or
                    extend it
                  </li>
                  <li>
                    <strong>You can distribute Ezra</strong> - share it with others
                  </li>
                  <li>
                    <strong>No warranty</strong> - Ezra is provided "as is" without
                    any guarantees
                  </li>
                  <li>
                    <strong>Keep the license</strong> - Any copies must include the MIT
                    license text
                  </li>
                </ul>
              </div>

              <div className="license-actions">
                <a
                  href="https://github.com/ranaji114/Ezra-programming-lang/blob/main/LICENSE"
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
                <Link href="/" className="btn btn-outline">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            <div className="card">
              <h3>Can I use Ezra in commercial projects?</h3>
              <p>
                Yes! The MIT license explicitly allows commercial use. You can use
                Ezra in any commercial project without any restrictions.
              </p>
            </div>
            <div className="card">
              <h3>Do I need to pay to use Ezra?</h3>
              <p>
                No. Ezra is completely free to use. There are no licensing fees or
                royalties required.
              </p>
            </div>
            <div className="card">
              <h3>Can I modify Ezra and distribute my version?</h3>
              <p>
                Yes, you can modify Ezra and distribute your version, as long as
                you include the original MIT license text in your distribution.
              </p>
            </div>
            <div className="card">
              <h3>What are my obligations when using Ezra?</h3>
              <p>
                Your main obligation is to include the MIT license text in any
                copies of the software you distribute. Beyond that, there are no
                additional requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .license-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .license-content h2 {
          margin-bottom: 1rem;
        }

        .license-content p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .license-content pre {
          background: var(--color-code-bg);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-code-border);
          overflow-x: auto;
          margin: 2rem 0;
          white-space: pre-wrap;
          font-size: 0.9rem;
        }

        .license-info {
          margin: 2rem 0;
        }

        .license-info h3 {
          margin-bottom: 1rem;
        }

        .license-info ul {
          padding-left: 1.5rem;
        }

        .license-info li {
          margin-bottom: 0.75rem;
          color: var(--color-text-secondary);
        }

        .license-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .faq-grid h3 {
          margin-bottom: 0.5rem;
        }

        .faq-grid p {
          color: var(--color-text-secondary);
          margin: 0;
        }

        @media (max-width: 768px) {
          .license-actions {
            flex-direction: column;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
