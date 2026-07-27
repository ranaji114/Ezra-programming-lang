'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function CommunityPage() {
  useEffect(() => {
    // Add FAQ toggle functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('h3');
      question.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    });
  }, []);
  const communityChannels = [
    {
      name: 'GitHub Discussions',
      description: 'Ask questions, share ideas, and discuss Ezra development',
      url: 'https://github.com/ranaji114/Ezra-programming-lang/discussions',
      icon: '💬',
      type: 'forum',
    },
    {
      name: 'Discord Server',
      description: 'Join our Discord for real-time chat and support',
      url: 'https://discord.gg/example',
      icon: '🟣',
      type: 'chat',
    },
    {
      name: 'Twitter',
      description: 'Follow us on Twitter for updates and announcements',
      url: 'https://twitter.com/example',
      icon: '🐦',
      type: 'social',
    },
    {
      name: 'GitHub Issues',
      description: 'Report bugs, request features, and track progress',
      url: 'https://github.com/ranaji114/Ezra-programming-lang/issues',
      icon: '🐛',
      type: 'support',
    },
  ];

  const contributeGuides = [
    {
      title: 'Reporting Bugs',
      description: 'Help us improve Ezra by reporting issues',
      steps: [
        'Check if the bug has already been reported',
        'Create a minimal reproduction case',
        'Open a new issue on GitHub',
        'Include details about your environment',
      ],
      link: 'https://github.com/ranaji114/Ezra-programming-lang/issues/new',
    },
    {
      title: 'Suggesting Features',
      description: 'Have an idea for Ezra? Share it with us!',
      steps: [
        'Check the existing feature requests',
        'Describe your feature in detail',
        'Explain the use case',
        'Open a feature request issue',
      ],
      link: 'https://github.com/ranaji114/Ezra-programming-lang/issues/new',
    },
    {
      title: 'Contributing Code',
      description: 'Help develop Ezra by contributing code',
      steps: [
        'Fork the repository on GitHub',
        'Create a new branch for your changes',
        'Write tests for your changes',
        'Submit a pull request',
      ],
      link: '/docs/contributing',
    },
    {
      title: 'Improving Documentation',
      description: 'Help make our docs better',
      steps: [
        'Find a page to improve',
        'Make your changes',
        'Submit a pull request',
      ],
      link: 'https://github.com/ranaji114/Ezra-programming-lang/tree/main/docs',
    },
  ];

  const events = [
    {
      title: 'Weekly Office Hours',
      description: 'Join us every Friday for live Q&A and discussions',
      date: 'Every Friday',
      time: '4:00 PM - 5:00 PM IST',
      location: 'Discord Voice Chat',
      link: 'https://discord.gg/example',
    },
    {
      title: 'Monthly Showcase',
      description: 'Show off your Ezra projects to the community',
      date: 'First Saturday of the month',
      time: '3:00 PM - 4:00 PM IST',
      location: 'Discord',
      link: 'https://discord.gg/example',
    },
  ];

  const faq = [
    {
      question: 'How do I get help with Ezra?',
      answer: 'You can ask questions in our GitHub Discussions, Discord server, or open a GitHub issue for bugs.',
    },
    {
      question: 'Do I need to know Rust to use Ezra?',
      answer: 'No! Ezra is designed to be easy to use without any knowledge of Rust. The Rust implementation is transparent to users.',
    },
    {
      question: 'Is Ezra production ready?',
      answer: 'Ezra is currently at version 1.0.0 and is suitable for most use cases. However, as a new language, you may encounter some rough edges.',
    },
    {
      question: 'How often are new versions released?',
      answer: 'We aim to release new versions regularly, typically every 2-4 weeks for minor updates and every few months for major releases.',
    },
    {
      question: 'Can I use Ezra for commercial projects?',
      answer: 'Yes! Ezra is licensed under the MIT license, which allows free use in commercial projects.',
    },
    {
      question: 'How can I stay updated on Ezra news?',
      answer: 'Follow us on Twitter, join our Discord, or watch the GitHub repository for releases and announcements.',
    },
  ];

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Join the Ezra Community</h1>
            <p>
              Connect with other Ezra users, get help, share your projects, and
              contribute to the future of the language.
            </p>
          </div>

          <div className="community-intro">
            <p className="lead">
              The Ezra community is a welcoming place for developers of all skill
              levels. Whether you\'re just getting started or you\'re an experienced
              programmer, there\'s a place for you here.
            </p>
            <p>
              Join us to ask questions, share your knowledge, collaborate on
              projects, or just chat about programming.
            </p>
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Community Channels</h2>
            <p>Connect with the Ezra community on your preferred platform</p>
          </div>

          <div className="channels-grid">
            {communityChannels.map((channel, index) => (
              <div key={index} className="card channel-card">
                <div className="channel-icon">{channel.icon}</div>
                <h3>{channel.name}</h3>
                <p>{channel.description}</p>
                <div className="channel-type">
                  <span className={`type-badge type-${channel.type}`}>
                    {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                  </span>
                </div>
                <div className="channel-actions">
                  <a
                    href={channel.url}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join {channel.type === 'chat' ? 'Chat' : channel.type === 'forum' ? 'Discussion' : 'Follow'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>How to Contribute</h2>
            <p>Ways you can help grow the Ezra ecosystem</p>
          </div>

          <div className="contribute-grid">
            {contributeGuides.map((guide, index) => (
              <div key={index} className="card contribute-card">
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <ol className="contribute-steps">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
                <div className="contribute-actions">
                  {guide.link.startsWith('http') ? (
                    <a
                      href={guide.link}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Started
                    </a>
                  ) : (
                    <Link href={guide.link} className="btn btn-outline">
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Events */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Community Events</h2>
            <p>Join us for regular events and meetups</p>
          </div>

          {events.length > 0 ? (
            <div className="events-grid">
              {events.map((event, index) => (
                <div key={index} className="card event-card">
                  <div className="event-date">
                    <span className="event-day">{event.date}</span>
                    <span className="event-time">{event.time}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-location">
                    <span>📍 {event.location}</span>
                  </div>
                  <div className="event-actions">
                    <a
                      href={event.link}
                      className="btn btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Event
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              <p>
                No upcoming events. Check back later or{' '}
                <a href="https://discord.gg/example">join our Discord</a> to
                stay updated.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Code of Conduct */}
      <section className="section">
        <div className="container">
          <div className="coc-card">
            <h2>Code of Conduct</h2>
            <p>
              We want the Ezra community to be a welcoming, inclusive, and
              respectful place for everyone. Please read our{' '}
              <Link href="/code-of-conduct">Code of Conduct</Link> to understand
              the standards we expect from all community members.
            </p>
            <p>
              By participating in the Ezra community, you agree to abide by our
              Code of Conduct.
            </p>
            <Link href="/code-of-conduct" className="btn btn-outline">
              Read Code of Conduct
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about Ezra and the community</p>
          </div>

          <div className="faq-container">
            {faq.map((item, index) => (
              <div key={index} className="faq-item">
                <h3>
                  {item.question}
                  <span className="faq-toggle">+</span>
                </h3>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="section">
        <div className="container">
          <div className="get-in-touch-card">
            <h2>Get in Touch</h2>
            <p>
              Have questions or just want to say hello? We\'d love to hear from
              you!
            </p>
            <div className="touch-actions">
              <Link href="/support" className="btn btn-primary">
                Contact Support
              </Link>
              <a
                href="https://discord.gg/example"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </a>
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

        .community-intro {
          max-width: 800px;
          margin: 0 auto;
        }

        .channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .channel-card {
          text-align: center;
          transition: transform var(--transition-normal);
        }

        .channel-card:hover {
          transform: translateY(-2px);
        }

        .channel-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .channel-card h3 {
          margin-bottom: 0.5rem;
        }

        .channel-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .channel-type {
          margin-bottom: 1rem;
        }

        .type-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 9999px;
        }

        .type-forum {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .type-chat {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .type-social {
          background: #fef3c7;
          color: #d97706;
        }

        .type-support {
          background: #fce7f3;
          color: #db2777;
        }

        .contribute-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .contribute-card {
          background: var(--color-bg);
        }

        .contribute-card h3 {
          margin-bottom: 0.5rem;
        }

        .contribute-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .contribute-steps {
          margin-bottom: 1rem;
          color: var(--color-text-secondary);
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .event-card {
          background: var(--color-bg);
        }

        .event-date {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .event-day {
          font-weight: 700;
          color: var(--color-primary);
        }

        .event-time {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .event-card h3 {
          margin-bottom: 0.5rem;
        }

        .event-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .event-location {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .coc-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .coc-card h2 {
          margin-bottom: 1rem;
        }

        .coc-card p {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 1rem;
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          margin-bottom: 1rem;
        }

        .faq-item h3 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 1rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .faq-toggle {
          font-size: 1.25rem;
          color: var(--color-primary);
          transition: transform var(--transition-fast);
        }

        .faq-answer {
          padding: 0 1rem 1rem;
          color: var(--color-text-secondary);
          border-left: 1px solid var(--color-border);
          border-right: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          display: none;
        }

        .faq-item.open .faq-answer {
          display: block;
        }

        .faq-item.open .faq-toggle {
          transform: rotate(45deg);
        }

        .get-in-touch-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .get-in-touch-card h2 {
          margin-bottom: 1rem;
        }

        .get-in-touch-card p {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        .touch-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .channels-grid,
          .contribute-grid,
          .events-grid {
            grid-template-columns: 1fr;
          }

          .touch-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
