# Ezra Language

Ezra is a readable, indentation-based scripting language built in Rust.
It is designed to be approachable for beginners while offering practical
features for real programs: pattern matching, error handling, file I/O,
JSON, and a growing standard library.

## Key Features

- **Natural syntax** — `name is "Rana"`, `check if age >= 18`, `for each item in list`
- **Readable keywords** — `yes`/`no` instead of `true`/`false`, `nothing` instead of `null`
- **Single binary** — one `ezra` executable, no runtime installation required
- **Built-in tooling** — formatter, linter, test runner, REPL, and project scaffolding
- **VS Code extension** — syntax highlighting, snippets, run/check/lint/format commands

## Quick Start

```bash
# Install (Linux / macOS)
sh install/install.sh

# Install (Windows)
powershell -ExecutionPolicy Bypass -File install/install.ps1

# Run your first program
ezra run examples/hello.ez
```

Your first program (`hello.ez`):

```ezra
say "Hello from Ezra!"
```

## Documentation

| Guide | Description |
|---|---|
| [Getting Started](getting-started.md) | Install, hello world, first project |
| [Tutorial](tutorial.md) | Step-by-step introduction to the language |
| [Language Reference](language-reference.md) | Complete syntax and semantics |
| [CLI Reference](cli-reference.md) | Every `ezra` command |
| [Standard Library](stdlib/index.md) | Built-in functions and modules |
| [Examples](examples/index.md) | Annotated code examples |
| [Tooling & VS Code](tooling.md) | Formatter, linter, REPL, editor |

## What Works in v0.1.0

| Feature | Status |
|---|---|
| Variables, types, expressions | ✅ |
| Conditions, loops, functions | ✅ |
| Text interpolation | ✅ |
| Lists and objects | ✅ |
| Error handling (`try`/`catch`/`throw`) | ✅ |
| Pattern matching (`pick`/`when`) | ✅ |
| Modules (`use`/`from`/`export`) | ✅ |
| File I/O, JSON, math, OS builtins | ✅ |
| REPL | ✅ |
| Formatter and linter | ✅ |
| VS Code extension | ✅ |
| Native compilation | 🔜 Planned |
| Package manager | 🔜 Planned |
| Concurrency / async | 🔜 Planned |
