'use client';

import Link from 'next/link';

export default function CodeOfConductPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Code of Conduct</h1>
            <p>Building a Welcoming and Inclusive Community</p>
          </div>

          <div className="coc-content">
            <div className="card">
              <p className="lead">
                The Ezra community is committed to providing a welcoming, inclusive,
                and respectful environment for all participants, regardless of
                experience level, gender, gender identity and expression, sexual
                orientation, disability, personal appearance, body size, race,
                ethnicity, age, religion, or nationality.
              </p>

              <section>
                <h2>Our Pledge</h2>
                <p>
                  We pledge to make participation in our community a harassment-free
                  experience for everyone. We will not tolerate harassment of
                  participants in any form.
                </p>
                <p>
                  All communication within the Ezra community should be appropriate
                  for a professional audience, including people of many different
                  backgrounds.
                </p>
              </section>

              <section>
                <h2>Our Standards</h2>
                <p>Examples of behavior that contributes to a positive environment:</p>
                <ul>
                  <li>Showing empathy and kindness toward other community members</li>
                  <li>
                    Being respectful of differing opinions, viewpoints, and
                    experiences
                  </li>
                  <li>Giving and gracefully accepting constructive feedback</li>
                  <li>
                    Accepting responsibility and apologizing to those affected by
                    our mistakes
                  </li>
                  <li>Focusing on what is best for the community</li>
                </ul>
                <p>Examples of unacceptable behavior:</p>
                <ul>
                  <li>
                    The use of sexualized language or imagery and unwelcome sexual
                    attention or advances
                  </li>
                  <li>
                    Trolling, insulting, or derogatory comments, and personal or
                    political attacks
                  </li>
                  <li>Public or private harassment</li>
                  <li>
                    Publishing others' private information, such as a physical or
                    email address, without explicit permission
                  </li>
                  <li>
                    Other conduct which could reasonably be considered inappropriate
                    in a professional setting
                  </li>
                </ul>
              </section>

              <section>
                <h2>Our Responsibilities</h2>
                <p>
                  Community leaders are responsible for clarifying and enforcing
                  our standards of acceptable behavior and will take appropriate and
                  fair corrective action in response to any behavior that they
                  deem inappropriate, threatening, offensive, or harmful.
                </p>
                <p>
                  Community leaders have the right and responsibility to remove,
                  edit, or reject comments, commits, code, wiki edits, issues, and
                  other contributions that are not aligned with this Code of Conduct,
                  and will communicate reasons for moderation decisions when
                  appropriate.
                </p>
              </section>

              <section>
                <h2>Scope</h2>
                <p>
                  This Code of Conduct applies within all community spaces and also
                  applies when an individual is officially representing the community
                  in public spaces. Examples of representing our community include
                  using an official e-mail address, posting via an official social
                  media account, or acting as an appointed representative at an
                  online or offline event.
                </p>
              </section>

              <section>
                <h2>Enforcement</h2>
                <p>
                  Violations of the Code of Conduct may be reported by contacting the
                  community leaders via{' '}
                  <Link href="/support">our support page</Link>.
                  All complaints will be reviewed and investigated promptly and
                  fairly.
                </p>
                <p>
                  All community leaders are obligated to respect the privacy and
                  security of the reporter of any incident.
                </p>
              </section>

              <section>
                <h2>Acknowledgment</h2>
                <p>
                  This Code of Conduct is adapted from the{' '}
                  <a
                    href="https://www.contributor-covenant.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contributor Covenant
                  </a>
                  , version 2.0, available at{' '}
                  <a
                    href="https://www.contributor-covenant.org/version/2/0/code_of_conduct.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.contributor-covenant.org/version/2/0/code_of_conduct.html
                  </a>
                </p>
              </section>

              <section>
                <h2>Contact Us</h2>
                <p>
                  If you have any questions about this Code of Conduct, or need
                  to report a violation, please{' '}
                  <Link href="/support">contact us</Link>.
                </p>
              </section>

              <div className="coc-actions">
                <Link href="/community" className="btn btn-primary">
                  Join Community
                </Link>
                <Link href="/" className="btn btn-outline">
                  Back to Home
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

        .coc-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .coc-content section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .coc-content section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .coc-content h2 {
          color: var(--color-text);
          margin-bottom: 0.75rem;
        }

        .coc-content p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .coc-content ul {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .coc-content li {
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }

        .coc-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .coc-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
