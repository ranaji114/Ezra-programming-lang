'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState('basic');

  const categories = [
    { id: 'basic', name: 'Basic Syntax', icon: '📚' },
    { id: 'functions', name: 'Functions', icon: '⚙️' },
    { id: 'control', name: 'Control Flow', icon: '🔄' },
    { id: 'collections', name: 'Collections', icon: '📦' },
    { id: 'error', name: 'Error Handling', icon: '🛡️' },
    { id: 'json', name: 'JSON', icon: '📄' },
    { id: 'files', name: 'File I/O', icon: '💾' },
    { id: 'advanced', name: 'Advanced', icon: '🚀' },
  ];

  const examples = {
    basic: [
      {
        title: 'Hello World',
        description: 'The classic first program',
        code: `say "Hello, World!"`,
      },
      {
        title: 'Variables',
        description: 'Declaring and using variables',
        code: `name is "Ezra"\nage is 1\nversion is "1.0.0"\n\nsay "{name} {version} is {age} year old"`,
      },
      {
        title: 'User Input',
        description: 'Getting input from the user',
        code: `name is input "What is your name? "\nsay "Hello, {name}!"`,
      },
      {
        title: 'Constants',
        description: 'Defining immutable values',
        code: `PI is 3.14159\nMAX_SIZE is 100\n\nsay "PI is {PI} and max size is {MAX_SIZE}"`,
      },
    ],
    functions: [
      {
        title: 'Basic Function',
        description: 'Defining and calling a function',
        code: `give greet(name)\n  say "Hello, {name}!"\n\ngreet("Alice")\ngreet("Bob")`,
      },
      {
        title: 'Function with Return',
        description: 'Functions that return values',
        code: `give add(a, b)\n  -> a + b\n\nresult is add(3, 4)\nsay "3 + 4 = {result}"  // 7`,
      },
      {
        title: 'Default Parameters',
        description: 'Functions with default parameter values',
        code: `give greet(name, greeting is "Hello")\n  say "{greeting}, {name}!"\n\ngreet("Alice")           // Hello, Alice!\ngreet("Bob", "Hi")       // Hi, Bob!`,
      },
      {
        title: 'Recursion',
        description: 'Factorial using recursion',
        code: `give factorial(n)\n  check if n <= 1\n    -> 1\n  otherwise\n    -> n * factorial(n - 1)\n\nsay factorial(5)  // 120`,
      },
    ],
    control: [
      {
        title: 'If-Else',
        description: 'Conditional execution',
        code: `age is 25\n\ncheck if age >= 18\n  say "Adult"\notherwise\n  say "Minor"`,
      },
      {
        title: 'Else-If',
        description: 'Multiple conditions',
        code: `score is 85\n\ncheck if score >= 90\n  say "Grade A"\notherwise if score >= 80\n  say "Grade B"\notherwise if score >= 70\n  say "Grade C"\notherwise\n  say "Grade F"`,
      },
      {
        title: 'For Loop',
        description: 'Iterating over a range',
        code: `for i in 1..5\n  say "Number: {i}"`,
      },
      {
        title: 'While Loop',
        description: 'Loop while condition is true',
        code: `count is 0\nwhile count < 5\n  say "Count: {count}"\n  count is count + 1`,
      },
      {
        title: 'Loop Control',
        description: 'Using break and continue',
        code: `for i in 1..10\n  check if i is 5\n    break\n  check if i % 2 is 0\n    continue\n  say i`,
      },
    ],
    collections: [
      {
        title: 'Lists',
        description: 'Creating and manipulating lists',
        code: `numbers is [1, 2, 3, 4, 5]\nsay numbers[0]  // 1\nsay numbers.length  // 5`,
      },
      {
        title: 'List Operations',
        description: 'Common list operations',
        code: `nums is [1, 2, 3]\nnums.push(4)\nnums.pop()\n\nsay nums  // [1, 2, 3, 4]`,
      },
      {
        title: 'Filter',
        description: 'Filtering list elements',
        code: `numbers is [1, 2, 3, 4, 5, 6]\nevens is numbers.filter(n -> n % 2 is 0)\nsay evens  // [2, 4, 6]`,
      },
      {
        title: 'Map',
        description: 'Transforming list elements',
        code: `numbers is [1, 2, 3, 4]\ndoubled is numbers.map(n -> n * 2)\nsay doubled  // [2, 4, 6, 8]`,
      },
      {
        title: 'Reduce',
        description: 'Reducing list to a single value',
        code: `numbers is [1, 2, 3, 4, 5]\nsum is numbers.reduce(0, (acc, n) -> acc + n)\nsay sum  // 15`,
      },
    ],
    error: [
      {
        title: 'Try-Catch',
        description: 'Handling errors gracefully',
        code: `try\n  result is 10 / 0\ncatch err\n  say "Error: {err}"`,
      },
      {
        title: 'Custom Error',
        description: 'Throwing custom errors',
        code: `give divide(a, b)\n  check if b is 0\n    throw Error("Cannot divide by zero")\n  -> a / b\n\ntry\n  divide(10, 0)\ncatch err\n  say "Caught: {err}"`,
      },
    ],
    json: [
      {
        title: 'JSON Parse',
        description: 'Parsing JSON strings',
        code: `json_str is '{"name": "Ezra", "version": 1}'\ndata is parse_json(json_str)\nsay data.name  // Ezra\nsay data.version  // 1`,
      },
      {
        title: 'JSON Stringify',
        description: 'Converting to JSON string',
        code: `person is { name: "Alice", age: 30 }\njson_str is stringify_json(person)\nsay json_str  // {"name":"Alice","age":30}`,
      },
    ],
    files: [
      {
        title: 'Read File',
        description: 'Reading a file',
        code: `content is read_file("example.txt")\nsay content`,
      },
      {
        title: 'Write File',
        description: 'Writing to a file',
        code: `write_file("output.txt", "Hello, World!")\nsay "File written!"`,
      },
    ],
    advanced: [
      {
        title: 'Pattern Matching',
        description: 'Match on values and types',
        code: `value is "hello"\n\nmatch value\n  case "hello" -> say "Greeting"\n  case "goodbye" -> say "Farewell"\n  case _ -> say "Unknown"`,
      },
      {
        title: 'Closures',
        description: 'Functions that capture environment',
        code: `give create_multiplier(factor)\n  -> (n) -> n * factor\n\ndouble is create_multiplier(2)\nsay double(5)  // 10`,
      },
    ],
  };

  const categoryExamples = examples[selectedCategory] || [];

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Ezra Code Examples</h1>
            <p>
              Learn by example. Browse through practical Ezra code snippets
              covering all aspects of the language.
            </p>
          </div>

          {/* Category Selector */}
          <div className="category-selector">
            <div className="category-tabs">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Examples Grid */}
          <div className="examples-grid">
            {categoryExamples.map((example, index) => (
              <div key={index} className="card example-card">
                <div className="example-header">
                  <h3>{example.title}</h3>
                  <span className="badge">{categories.find(c => c.id === selectedCategory)?.name}</span>
                </div>
                <p>{example.description}</p>
                <pre className="example-code">
                  <code>{example.code}</code>
                </pre>
                <div className="example-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(example.code);
                      alert('Code copied to clipboard!');
                    }}
                  >
                    Copy Code
                  </button>
                  <Link href="/playground" className="btn btn-outline">
                    Try in Playground
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Examples List */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>All Examples</h2>
            <p>Browse all available examples by category</p>
          </div>

          <div className="all-examples">
            {Object.entries(examples).map(([categoryId, categoryExamples]) => {
              const category = categories.find(c => c.id === categoryId);
              return (
                <div key={categoryId} className="category-section">
                  <h3>
                    {category?.icon} {category?.name}
                  </h3>
                  <div className="category-examples">
                    {categoryExamples.map((example, index) => (
                      <div key={index} className="example-link">
                        <Link href={`#${categoryId}-${index}`}>
                          {example.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Patterns */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Patterns</h2>
            <p>Common coding patterns in Ezra</p>
          </div>

          <div className="patterns-grid">
            <div className="card pattern-card">
              <h3>FizzBuzz</h3>
              <pre>
                <code>
{`for i in 1..100`}\n{`  check if i % 15 is 0`}\n{`    say "FizzBuzz"`}\n{`  otherwise if i % 3 is 0`}\n{`    say "Fizz"`}\n{`  otherwise if i % 5 is 0`}\n{`    say "Buzz"`}\n{`  otherwise`}\n{`    say i`}
                </code>
              </pre>
            </div>
            <div className="card pattern-card">
              <h3>Fibonacci Sequence</h3>
              <pre>
                <code>
{`give fib(n)`}\n{`  check if n <= 1`}\n{`    -> n`}\n{`  -> fib(n - 1) + fib(n - 2)`}\n\n{`say fib(10)`}
                </code>
              </pre>
            </div>
            <div className="card pattern-card">
              <h3>Reading a File</h3>
              <pre>
                <code>
{`contents is read_file("data.txt")`}\n{`lines is contents.split("\\n")`}\n{`for line in lines`}\n{`  say line`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Learn More */}
      <section className="section section-alt">
        <div className="container">
          <div className="learn-more-card">
            <h2>Want to Learn More?</h2>
            <p>
              These examples show just a fraction of what Ezra can do. Dive deeper
              into the language with our comprehensive documentation.
            </p>
            <div className="learn-more-actions">
              <Link href="/docs" className="btn btn-primary">
                Read Documentation
              </Link>
              <Link href="/tutorial" className="btn btn-outline">
                Take the Tutorial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .category-selector {
          margin: 2rem 0;
        }

        .category-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .example-card {
          background: var(--color-bg);
        }

        .example-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .example-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .example-card p {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }

        .example-code {
          background: var(--color-code-bg);
          border: 1px solid var(--color-code-border);
          border-radius: var(--radius-md);
          overflow: auto;
          margin-bottom: 1rem;
        }

        .example-code code {
          background: transparent;
          padding: 1rem;
          border: none;
          display: block;
          white-space: pre-wrap;
        }

        .example-actions {
          display: flex;
          gap: 0.5rem;
        }

        .example-actions .btn {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .all-examples {
          display: grid;
          gap: 1.5rem;
        }

        .category-section {
          border-left: 4px solid var(--color-primary-light);
          padding-left: 1rem;
        }

        .category-section h3 {
          margin-bottom: 1rem;
        }

        .category-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .example-link {
          padding: 0.25rem 0.75rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
        }

        .example-link a {
          color: var(--color-text);
          font-size: 0.875rem;
        }

        .patterns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .pattern-card h3 {
          margin-bottom: 1rem;
        }

        .learn-more-card {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .learn-more-card h2 {
          margin-bottom: 1rem;
        }

        .learn-more-card p {
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 1.5rem;
        }

        .learn-more-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .category-tabs {
            gap: 0.25rem;
          }

          .category-tab {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }

          .patterns-grid {
            grid-template-columns: 1fr;
          }

          .learn-more-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
