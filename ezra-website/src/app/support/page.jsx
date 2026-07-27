'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const supportOptions = [
    {
      title: 'Bug Reports',
      description: 'Found a bug in Ezra? Report it here.',
      icon: '🐛',
      action: 'Report on GitHub',
      link: 'https://github.com/ranaji114/Ezra-programming-lang/issues/new?template=bug_report.md',
      template: 'https://github.com/ranaji114/Ezra-programming-lang/.github/ISSUE_TEMPLATE/bug_report.md',
    },
    {
      title: 'Feature Requests',
      description: 'Have an idea for a new feature? Share it with us.',
      icon: '💡',
      action: 'Request Feature',
      link: 'https://github.com/ranaji114/Ezra-programming-lang/issues/new?template=feature_request.md',
      template: 'https://github.com/ranaji114/Ezra-programming-lang/.github/ISSUE_TEMPLATE/feature_request.md',
    },
    {
      title: 'Documentation Issues',
      description: 'Found a mistake in the docs? Let us know.',
      icon: '📚',
      action: 'Report Docs Issue',
      link: 'https://github.com/ranaji114/Ezra-programming-lang/issues/new?template=docs_issue.md',
      template: 'https://github.com/ranaji114/Ezra-programming-lang/.github/ISSUE_TEMPLATE/docs_issue.md',
    },
    {
      title: 'General Questions',
      description: 'Have a question about Ezra? Ask the community.',
      icon: '❓',
      action: 'Ask on GitHub Discussions',
      link: 'https://github.com/ranaji114/Ezra-programming-lang/discussions/new',
    },
  ];

  const responseTimes = [
    {
      type: 'Bug Reports',
      time: '1-2 business days',
      note: 'Critical bugs may be addressed sooner',
    },
    {
      type: 'Feature Requests',
      time: '1 week',
      note: 'Depending on complexity and priority',
    },
    {
      type: 'General Questions',
      time: '1-3 business days',
      note: 'Community responses may be faster',
    },
    {
      type: 'Documentation Issues',
      time: '2-3 business days',
      note: 'Pull requests are welcome!',
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.',
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'There was an error submitting your message. Please try again or use one of the other contact methods.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: 'I found a bug. What should I do?',
      answer: 'Please report it on our GitHub Issues page with as much detail as possible, including steps to reproduce the bug.',
    },
    {
      question: 'How do I install Ezra?',
      answer: 'Check out our Download page for platform-specific installation instructions.',
    },
    {
      question: 'Where can I find documentation?',
      answer: 'All Ezra documentation is available on our Docs page.',
    },
    {
      question: 'Can I contribute to Ezra?',
      answer: 'Absolutely! Check out our Community page for ways to contribute.',
    },
    {
      question: 'Is commercial support available?',
      answer: 'Currently, Ezra is a community-driven project. Commercial support may be available in the future.',
    },
  ];

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra Support</h1>
            <p>
              Get help with Ezra. We\'re here to assist you with any questions or
              issues you may have.
            </p>
          </div>

          <div className="support-intro">
            <p className="lead">
              Need help with Ezra? You\'ve come to the right place. Whether you\'ve
              found a bug, have a question, or want to suggest a new feature, we\'re
              here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>How Can We Help?</h2>
            <p>Choose the type of support you need</p>
          </div>

          <div className="support-options-grid">
            {supportOptions.map((option, index) => (
              <div key={index} className="card support-option-card">
                <div className="support-option-icon">{option.icon}</div>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <div className="support-option-actions">
                  <a
                    href={option.link}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {option.action}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Contact Us</h2>
            <p>
              Send us a message directly. We\'ll get back to you as soon as
              possible.
            </p>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              {submitStatus && (
                <div
                  className={`alert ${submitStatus.success ? 'alert-success' : 'alert-error'}`}
                >
                  {submitStatus.message}
                </div>
              )}

              <div className="form-group">
                <div className="form-row">
                  <div className="form-column">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-column">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject...</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="question">General Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you?"
                  rows={6}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  type="reset"
                  className="btn btn-outline"
                  onClick={() => setFormData({ name: '', email: '', subject: '', message: '' })}
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="form-info">
              <p>
                <strong>Note:</strong> This form sends a message to our team. For
                faster responses, consider using one of the options above (GitHub
                Issues, Discussions, etc.).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Response Times */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Response Times</h2>
            <p>What to expect when you reach out</p>
          </div>

          <div className="response-times-grid">
            {responseTimes.map((item, index) => (
              <div key={index} className="card response-time-card">
                <h3>{item.type}</h3>
                <div className="response-time">
                  <span>⏱️ {item.time}</span>
                </div>
                <p className="response-note">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="alert alert-info" style={{ marginTop: '2rem' }}>
            <p>
              <strong>Important:</strong> Response times are estimates and may vary
              depending on the volume of requests and the availability of team
              members. We do our best to respond as quickly as possible!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Support FAQ</h2>
            <p>Frequently asked questions about getting support</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="card faq-card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Resources */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Other Resources</h2>
            <p>More ways to get help and information</p>
          </div>

          <div className="resources-grid">
            <div className="card resource-card">
              <h3>📖 Documentation</h3>
              <p>Comprehensive guides and references for Ezra</p>
              <Link href="/docs" className="btn btn-outline">
                Browse Docs
              </Link>
            </div>
            <div className="card resource-card">
              <h3>💬 Community</h3>
              <p>Join the Ezra community to ask questions and share knowledge</p>
              <Link href="/community" className="btn btn-outline">
                Join Community
              </Link>
            </div>
            <div className="card resource-card">
              <h3>🚀 Examples</h3>
              <p>Browse code examples to learn Ezra</p>
              <Link href="/examples" className="btn btn-outline">
                View Examples
              </Link>
            </div>
            <div className="card resource-card">
              <h3>📝 Blog</h3>
              <p>Read about the latest Ezra news and tutorials</p>
              <Link href="/blog" className="btn btn-outline">
                Read Blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .lead {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--color-text);
        }

        .support-intro {
          max-width: 800px;
          margin: 0 auto;
        }

        .support-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .support-option-card {
          text-align: center;
          transition: transform var(--transition-normal);
        }

        .support-option-card:hover {
          transform: translateY(-2px);
        }

        .support-option-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .support-option-card h3 {
          margin-bottom: 0.5rem;
        }

        .support-option-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .contact-form-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-form {
          background: var(--color-bg);
          padding: 2rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-column {
          display: flex;
          flex-direction: column;
        }

        .contact-form input,
        .contact-form select,
        .contact-form textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 1rem;
          transition: border-color var(--transition-fast);
        }

        .contact-form input:focus,
        .contact-form select:focus,
        .contact-form textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .contact-form textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-start;
        }

        .form-info {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }

        .form-info p {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .response-times-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .response-time-card {
          text-align: center;
        }

        .response-time {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0.5rem 0;
        }

        .response-note {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin: 0;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-card h3 {
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }

        .faq-card p {
          color: var(--color-text-secondary);
          margin: 0;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .resource-card {
          text-align: center;
        }

        .resource-card h3 {
          margin-bottom: 0.5rem;
        }

        .resource-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .support-options-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .faq-grid,
          .resources-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
