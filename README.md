# Ezra

Ezra is a readable, indentation-based scripting language built in Rust.

**Created by [Ankur Rana](https://github.com/ranaji114)**  
**Version:** 1.0.0  
**Repository:** https://github.com/ranaji114/Flux-programming-lang  
**Docs:** https://ranaji114.github.io/Flux-programming-lang

---

## Why Ezra?

Ezra is designed for scripting that reads close to plain language:

```ezra
name is input "Enter your name: "
age is input_number "Enter your age: "

check if age >= 18
  say "Hello {name}, you are an adult."
otherwise
  say "Hello {name}, you are a minor."
```

---

## Install

### Windows

```powershell
powershell -ExecutionPolicy Bypass -File install/install.ps1
```

### Linux and macOS

```bash
sh install/install.sh
```

### From Source (requires Rust)

```bash
git clone https://github.com/ranaji114/Flux-programming-lang
cd Flux-programming-lang
cargo build --release
# binary at: target/release/ezra
```

Verify:

```bash
ezra --version    # ezra 1.0.0
```

---

## Quick Start

```bash
ezra new hello_app
cd hello_app
ezra run
```

Or run a single file:

```bash
ezra run examples/hello.ez
```

---

## Language at a Glance

| Feature | Example |
|---|---|
| Variables | `name is "Rana"` |
| Conditions | `check if age >= 18 ... otherwise ...` |
| Loops | `for each item in list`, `repeat 5 times`, `while`, `until` |
| Functions | `give add(a, b) -> a + b` |
| Error handling | `try ... catch err ... finally` |
| Pattern matching | `pick value when "x" ... otherwise` |
| Text interpolation | `"Hello {name.upper()}"` |
| Lists | `[1, 2, 3].sort()`, `.filter(n -> n > 2)` |
| Objects | `{name: "Rana", age: 25}.keys()` |
| Modules | `use "std/math" as math` |
| File I/O | `write_file("out.txt", "hello")` |
| JSON | `parse_json(s)`, `stringify_json(v)` |

---

## CLI

```
ezra new <project-name>     Create a new project
ezra run [file.ez]          Run a source file
ezra check [file.ez]        Parse without running
ezra test [path]            Run test files (*_test.ez)
ezra fmt [path] [--check]   Format .ez files
ezra lint [path]            Lint .ez files
ezra build [project-dir]    Validate project structure
ezra repl                   Interactive REPL
ezra --version              Print version
```

---

## VS Code Extension

The VS Code extension provides `.ez` syntax highlighting, snippets,
run/check/lint/format commands, REPL integration, and the Flux Neon color theme.

```bash
cd vscode-extension/flux
npm install
npm run package
# Install the generated .vsix from VS Code > Extensions > Install from VSIX
```

---

## Documentation

| Doc | Link |
|---|---|
| Homepage | [docs/index.md](docs/index.md) |
| Getting Started | [docs/getting-started.md](docs/getting-started.md) |
| Tutorial | [docs/tutorial.md](docs/tutorial.md) |
| Language Reference | [docs/language-reference.md](docs/language-reference.md) |
| CLI Reference | [docs/cli-reference.md](docs/cli-reference.md) |
| Standard Library | [docs/stdlib/index.md](docs/stdlib/index.md) |
| Examples | [docs/examples/index.md](docs/examples/index.md) |
| Tooling & VS Code | [docs/tooling.md](docs/tooling.md) |
| Contributing | [docs/contributing.md](docs/contributing.md) |

---

## Development

```bash
cargo fmt -- --check        # check formatting
cargo clippy                # lint (no errors expected)
cargo test                  # 25 unit + 6 CLI smoke tests
cargo build --release       # release binary
```

Build and package locally (Windows):

```powershell
.\build.ps1 --all
```

Build and package locally (Linux/macOS):

```bash
./build.sh --all
```

---

## License

MIT
