'use client';

import Link from 'next/link';

export default function BlogPage() {
  const blogPosts = [
    {
      title: 'Introducing Ezra: A New Scripting Language',
      slug: 'introducing-ezra',
      date: 'July 20, 2026',
      author: 'Ankur Rana',
      excerpt: 'Announcing the public release of Ezra v1.0.0 - a readable, modern scripting language built in Rust.',
      category: 'Announcements',
      readTime: '5 min read',
      featured: true,
    },
    {
      title: 'The Design Philosophy Behind Ezra',
      slug: 'design-philosophy',
      date: 'July 15, 2026',
      author: 'Ankur Rana',
      excerpt: 'Why we created Ezra and what makes it different from other languages.',
      category: 'Design',
      readTime: '7 min read',
      featured: true,
    },
    {
      title: 'Getting Started with Ezra: A Tutorial',
      slug: 'getting-started',
      date: 'July 10, 2026',
      author: 'Ankur Rana',
      excerpt: 'A step-by-step guide to writing your first Ezra program.',
      category: 'Tutorial',
      readTime: '10 min read',
      featured: false,
    },
    {
      title: 'Ezra v0.9.0 Released',
      slug: 'v0-9-0-release',
      date: 'June 1, 2026',
      author: 'Ankur Rana',
      excerpt: 'The final beta release before v1.0.0, featuring many improvements and bug fixes.',
      category: 'Releases',
      readTime: '3 min read',
      featured: false,
    },
    {
      title: 'Building a VS Code Extension for Ezra',
      slug: 'vscode-extension',
      date: 'May 15, 2026',
      author: 'Ankur Rana',
      excerpt: 'How we created the official Ezra extension for VS Code with syntax highlighting, snippets, and LSP support.',
      category: 'Development',
      readTime: '8 min read',
      featured: false,
    },
    {
      title: 'Why Rust for a Scripting Language?',
      slug: 'why-rust',
      date: 'April 1, 2026',
      author: 'Ankur Rana',
      excerpt: 'Exploring why we chose Rust as the foundation for Ezra.',
      category: 'Technology',
      readTime: '6 min read',
      featured: false,
    },
  ];

  const categories = ['All', 'Announcements', 'Releases', 'Tutorial', 'Design', 'Development', 'Technology'];

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra Blog</h1>
            <p>
              Stay updated with the latest news, tutorials, and insights about Ezra
            </p>
          </div>

          <div className="blog-intro">
            <p className="lead">
              The Ezra blog is where we share updates about the language, tutorials
              for getting started, and insights into our development process.
            </p>
            <p>
              Subscribe to stay in the loop with new releases and features.
            </p>
          </div>

          {/* Categories */}
          <div className="blog-categories">
            <div className="category-tabs">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`category-tab ${category === 'All' ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Featured Posts</h2>
            <p>Hand-picked articles you should not miss</p>
          </div>

          <div className="featured-posts-grid">
            {featuredPosts.map((post, index) => (
              <article key={index} className="card featured-post-card">
                <div className="post-category">
                  <span className="badge badge-primary">{post.category}</span>
                </div>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <div className="post-meta">
                  <span className="post-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v12h16V6H4zm2 2h2v2H6V8zm4 0h2v2H8V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8z"/>
                    </svg>
                    {post.date}
                  </span>
                  <span className="post-author">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    {post.author}
                  </span>
                  <span className="post-readtime">{post.readTime}</span>
                </div>
                <p>{post.excerpt}</p>
                <div className="post-actions">
                  <Link href={`/blog/${post.slug}`} className="btn btn-outline">
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>All Blog Posts</h2>
            <p>Browse through all our articles</p>
          </div>

          <div className="posts-list">
            {regularPosts.map((post, index) => (
              <article key={index} className="card post-card">
                <div className="post-header">
                  <h3>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <div className="post-meta">
                    <span className="post-date">{post.date}</span>
                    <span className="post-author">By {post.author}</span>
                    <span className="post-readtime">{post.readTime}</span>
                  </div>
                </div>
                <p>{post.excerpt}</p>
                <div className="post-footer">
                  <span className="badge">{post.category}</span>
                  <Link href={`/blog/${post.slug}`} className="btn btn-secondary">
                    Read Article
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              <span>Showing 1-{blogPosts.length} of {blogPosts.length} posts</span>
            </div>
            <div className="pagination-actions">
              <button className="btn btn-outline" disabled>
                Previous
              </button>
              <button className="btn btn-outline" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section section-alt">
        <div className="container">
          <div className="newsletter-card">
            <h2>Subscribe to Updates</h2>
            <p>
              Get the latest Ezra news delivered directly to your inbox. No spam,
              ever.
            </p>
            <form className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </div>
              <p className="newsletter-privacy">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Contribute */}
      <section className="section">
        <div className="container">
          <div className="contribute-blog-card">
            <h2>Want to Write for the Ezra Blog?</h2>
            <p>
              We\'re always looking for guest contributors. If you\'ve written
              something interesting about Ezra or have a tutorial to share, we\'d
              love to feature it on our blog.
            </p>
            <div className="contribute-blog-actions">
              <Link href="/support" className="btn btn-primary">
                Contact Us
              </Link>
              <a
                href="https://github.com/ranaji114/Ezra-programming-lang"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
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

        .blog-intro {
          max-width: 800px;
          margin: 0 auto;
        }

        .blog-categories {
          margin: 2rem 0;
        }

        .category-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .category-tab {
          padding: 0.5rem 1rem;
          background: var(--color-bg-secondary);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }

        .category-tab:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text);
        }

        .category-tab.active {
          background: var(--color-primary);
          color: white;
        }

        .featured-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .featured-post-card {
          transition: transform var(--transition-normal);
        }

        .featured-post-card:hover {
          transform: translateY(-4px);
        }

        .post-category {
          margin-bottom: 1rem;
        }

        .post-meta {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .post-meta svg {
          margin-right: 0.25rem;
        }

        .posts-list {
          display: grid;
          gap: 1rem;
        }

        .post-card {
          padding: 1.5rem;
        }

        .post-header {
          margin-bottom: 0.75rem;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .pagination-info {
          color: var(--color-text-muted);
        }

        .pagination-actions {
          display: flex;
          gap: 0.5rem;
        }

        .newsletter-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          max-width: 600px;
          margin: 0 auto;
        }

        .newsletter-card h2 {
          margin-bottom: 1rem;
        }

        .newsletter-card p {
          color: var(--color-text-secondary);
          margin: 0 auto 1.5rem;
        }

        .newsletter-form {
          max-width: 400px;
          margin: 0 auto;
        }

        .newsletter-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .newsletter-privacy {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 0.5rem;
        }

        .contribute-blog-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .contribute-blog-card h2 {
          margin-bottom: 1rem;
        }

        .contribute-blog-card p {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        .contribute-blog-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .featured-posts-grid {
            grid-template-columns: 1fr;
          }

          .newsletter-input-group {
            flex-direction: column;
          }

          .pagination {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .contribute-blog-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
