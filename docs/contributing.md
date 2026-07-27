# Contributing to Ezra

Thanks for your interest in contributing. This page covers how to build
the project, run tests, and submit changes.

---

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain, 1.75 or later)
- Git

For the VS Code extension:
- Node.js 20+
- `npm`

---

## Build from Source

```bash
git clone https://github.com/ranaji114/Ezra-programming-lang
cd Flux-programming-lang
cargo build
```

Run a program:
```bash
cargo run --bin ezra -- run examples/hello.ez
```

---

## Running Tests

```bash
cargo test
```

This runs 25 unit tests and 6 CLI smoke tests. All must pass before submitting.

### Adding Tests

Unit tests live in `src/tests.rs`. Use the `run_source` helper:

```rust
#[test]
fn my_new_feature_works() {
    run_source("x is 42\nassert x is 42, \"should be 42\"")
        .expect("should work");
}
```

CLI smoke tests live in `tests/cli_smoke.rs`.

---

## Code Quality

Before submitting a PR, run:

```bash
cargo fmt -- --check       # formatting
cargo clippy               # lints (should have no errors)
cargo test                 # all tests must pass
```

---

## Project Structure

```
src/
  lexer.rs        Token scanner
  token.rs        Token types
  parser.rs       Indentation-based parser -> AST
  ast.rs          AST node types
  fullvm.rs       Bytecode compiler + FastVM (primary runtime)
  bytecode.rs     Instruction set
  value.rs        Runtime value types
  environment.rs  Lexical scope stack
  interpreter.rs  Legacy tree-walking interpreter (kept for reference)
  vm.rs           Expression VM (used by interpreter)
  formatter.rs    Source formatter
  linter.rs       Static linter
  error.rs        Error type
  main.rs         CLI entry point
  lib.rs          Public module exports
  tests.rs        Unit tests

tests/
  cli_smoke.rs    Integration tests via spawned process

std/
  *.ez            Standard library source files (exported symbols)

examples/
  *.ez            Runnable example programs

vscode-extension/flux/
  extension.js    VS Code extension entry point
  package.json    Extension manifest

docs/             Documentation (Markdown)
install/          One-command install scripts
```

---

## Submitting Changes

1. Fork the repository and create a branch: `git checkout -b my-feature`
2. Make your changes with tests.
3. Run `cargo fmt`, `cargo clippy`, and `cargo test`.
4. Push and open a Pull Request against `main`.
5. Describe what you changed and why.

---

## Reporting Bugs

Open a GitHub Issue with:
- The `ezra --version` output
- Your operating system
- The `.ez` program that caused the issue
- The error message or unexpected output
- What you expected to happen

---

## Roadmap (Help Wanted)

- [ ] Proper `struct` / `impl` method dispatch with `self`
- [ ] Package manager (`ezra add <library>`)
- [ ] Multi-line REPL (continuation detection)
- [ ] LSP diagnostics (hover, go-to-definition)
- [ ] Async / await
- [ ] Native compilation target
- [ ] More `std` modules (http, csv, regex)
