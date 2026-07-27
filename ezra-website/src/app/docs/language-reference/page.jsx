'use client';

import Link from 'next/link';

export default function LanguageReferencePage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra Language Reference</h1>
            <p>
              Complete documentation of Ezra\'s syntax and features
            </p>
          </div>

          <div className="toc">
            <h2>Table of Contents</h2>
            <ul>
              <li><a href="#variables">Variables and Assignment</a></li>
              <li><a href="#types">Data Types</a></li>
              <li><a href="#functions">Functions</a></li>
              <li><a href="#control-flow">Control Flow</a></li>
              <li><a href="#error-handling">Error Handling</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div id="variables" className="reference-section">
            <h2>Variables and Assignment</h2>
            <p>
              In Ezra, you declare variables using the <code>is</code> keyword.
            </p>
            <pre>
              <code>
name is "Ezra"\nage is 25\nis_active is true\nscore is 95.5
              </code>
            </pre>
            <p>
              Variables can be reassigned:
            </p>
            <pre>
              <code>
count is 0\ncount is count + 1
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div id="types" className="reference-section">
            <h2>Data Types</h2>
            <p>Ezra supports the following primitive types:</p>
            <ul>
              <li><strong>String:</strong> Text data - <code>"Hello"</code></li>
              <li><strong>Number:</strong> Integer or floating-point - <code>42</code>, <code>3.14</code></li>
              <li><strong>Boolean:</strong> True or false - <code>true</code>, <code>false</code></li>
              <li><strong>List:</strong> Ordered collection - <code>[1, 2, 3]</code></li>
              <li><strong>Map:</strong> Key-value pairs - <code>name: "Ezra"</code></li>
              <li><strong>Null:</strong> No value - <code>null</code></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div id="functions" className="reference-section">
            <h2>Functions</h2>
            <p>
              Functions are defined with the <code>give</code> keyword and use -&gt; to return values.
            </p>
            <pre>
              <code>
give add(a, b)
  -&gt; a + b

result is add(3, 4)  // 7
              </code>
            </pre>
            <p>Functions with no explicit return return <code>null</code>.</p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div id="control-flow" className="reference-section">
            <h2>Control Flow</h2>
            <h4>If-Else Statements</h4>
            <pre>
              <code>
age is 25

check if age &gt;= 18
  say "Adult"
otherwise if age &gt;= 13
  say "Teen"
otherwise
  say "Child"
              </code>
            </pre>
            <h4>While Loops</h4>
            <pre>
              <code>
count is 0
while count &lt; 5
  say count
  count is count + 1
              </code>
            </pre>
            <h4>For Loops</h4>
            <pre>
              <code>
for i in 1..10
  say i

for item in [1, 2, 3]
  say item * 2
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div id="error-handling" className="reference-section">
            <h2>Error Handling</h2>
            <p>
              Use <code>try-catch</code> blocks to handle errors:
            </p>
            <pre>
              <code>
try
  result is 10 / 0
catch err
  say "Error: " + err
              </code>
            </pre>
            <p>
              You can throw custom errors:
            </p>
            <pre>
              <code>
give divide(a, b)
  check if b is 0
    throw Error("Division by zero")
  -&gt; a / b
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="next-steps">
            <h2>Next Steps</h2>
            <p>
              Continue learning Ezra:
            </p>
            <div className="next-steps-links">
              <Link href="/docs" className="btn btn-outline">
                Back to Docs
              </Link>
              <Link href="/examples" className="btn btn-primary">
                View Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .toc {
          max-width: 800px;
          margin: 0 auto 2rem;
        }
        .toc h2 {
          margin-bottom: 1rem;
        }
        .toc ul {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          list-style: none;
          padding: 0;
        }
        .toc li {
          margin-bottom: 0.5rem;
        }
        .toc a {
          color: var(--color-primary);
          text-decoration: none;
        }
        .toc a:hover {
          text-decoration: underline;
        }
        .reference-section {
          max-width: 800px;
          margin: 0 auto;
        }
        .reference-section h2 {
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--color-primary);
        }
        .reference-section p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }
        .reference-section pre {
          background: var(--color-code-bg);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-code-border);
          overflow-x: auto;
          margin: 1rem 0;
        }
        .reference-section ul {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .reference-section li {
          margin-bottom: 0.5rem;
          color: var(--color-text-secondary);
        }
        .next-steps {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }
        .next-steps p {
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
        }
        .next-steps-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .toc ul {
            grid-template-columns: 1fr;
          }
          .next-steps-links {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
