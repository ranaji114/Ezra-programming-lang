<div align="center">

# Ezra Language

**A readable, indentation-based scripting language built in Rust.**

[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet?style=flat-square)](https://github.com/ranaji114/Ezra-programming-lang/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-55%2F55%20passing-brightgreen?style=flat-square)](#)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-informational?style=flat-square)](#install)

**Created by [Ankur Rana](https://github.com/ranaji114)**

[📥 Download](https://github.com/ranaji114/Ezra-programming-lang/releases/latest) · [📚 Documentation](docs/index.md) · [🌐 Website](https://ranaji114.github.io/Ezra-programming-lang) · [🐛 Issues](https://github.com/ranaji114/Ezra-programming-lang/issues)

</div>

---

## What is Ezra?

Ezra is a scripting language designed to be easy to read and write. It uses natural English-like keywords, runs on all major platforms, and comes with a full standard library, formatter, linter, test runner, and VS Code extension — all in a single binary.

```ezra
# Hello, World!
name is input "Your name: "
say "Hello {name}!"
```

```ezra
# Functions, lists, error handling
give factorial(n)
  check if n <= 1
    -> 1
  -> n * factorial(n - 1)

say factorial(10)   # 3628800

nums is [1, 2, 3, 4, 5]
evens is nums.filter(n -> n % 2 is 0)
say evens   # [2, 4]

try
  result is 10 / 0
catch err
  say "Caught: {err}"   # Caught: divide by zero
```

---

## Install

### Windows

**Option 1 — GUI installer (recommended):**

Download **[EzraSetup-1.0.0.exe](https://github.com/ranaji114/Ezra-programming-lang/releases/latest/download/EzraSetup-1.0.0.exe)** and double-click it.

> ⚠️ Windows may show "Windows protected your PC" — click **More info → Run anyway**. This is normal for unsigned open-source software.

**Option 2 — Command line:**

```powershell
powershell -ExecutionPolicy Bypass -File install\install.ps1
```

### Linux / macOS

```bash
sh install/install.sh
```

### From source (requires Rust)

```bash
git clone https://github.com/ranaji114/Ezra-programming-lang
cd Flux-programming-lang
cargo build --release
# Binary: target/release/ezra
```

### Verify

```
ezra --version
```

Expected output: `ezra 1.0.0`

---

## Quick Start

```bash
# Create a new project
ezra new my_app
cd my_app

# Run it
ezra run
```

The generated `src/main.ez`:

```ezra
say "Hello from Ezra!"
```

---

## Language Overview

### Variables

```ezra
name is "Rana"          # create variable
age  is 25              # numbers
pi   is 3.14159

let count is 0          # explicit mutable
const MAX is 100        # immutable constant
```

### Conditions

```ezra
age is 20

check if age >= 18
  say "Adult"
otherwise if age >= 13
  say "Teenager"
otherwise
  say "Child"
```

### Loops

```ezra
# Repeat N times
repeat 3 times
  say "tick"

# Iterate a list
names is ["Alice", "Bob", "Carol"]
for each name in names
  say "Hello {name}"

# While loop
i is 0
while i < 5
  i += 1
  say i
```

### Functions

```ezra
give add(a, b)
  -> a + b

give greet(name)
  say "Hello {name.upper()}!"
  return "done"

say add(3, 4)      # 7
greet("rana")      # Hello RANA!
```

### Text Interpolation

```ezra
name is "Ezra"
version is "1.0.0"
say "Welcome to {name} v{version}!"
say "2 + 2 = {2 + 2}"
say "Upper: {name.upper()}"
```

### Lists

```ezra
nums is [3, 1, 4, 1, 5]
say nums.sort()               # [1, 1, 3, 4, 5]
say nums.filter(n -> n > 2)   # [3, 4, 5]
say nums.map(n -> n * 2)      # [6, 2, 8, 2, 10]
say nums.sum()                # 14
say nums.avg()                # 2.8
```

### Objects

```ezra
user is { name: "Rana", age: 25, city: "Delhi" }
say user.name          # Rana
say user["age"]        # 25
say user.keys()        # [age, city, name]
```

### Error Handling

```ezra
try
  data is parse_json("invalid json {")
catch err
  say "Parse failed: {err}"
finally
  say "Always runs"
```

### Pattern Matching

```ezra
day is "monday"
pick day
  when "monday"
    say "Start of the week"
  when "friday"
    say "Almost weekend!"
  otherwise
    say "Regular day"
```

### Modules

```ezra
use "std/math" as math
say math.pi             # 3.141592653589793
say math.sqrt(16)       # 4

from "std/json" use parse_json, stringify_json
data is parse_json("[1, 2, 3]")
say data[0]             # 1
```

### File I/O

```ezra
write_file("hello.txt", "Hello from Ezra!")
content is read_file("hello.txt")
say content                    # Hello from Ezra!
say file_exists("hello.txt")   # yes
```

---

## CLI Reference

| Command | Description |
|---|---|
| `ezra run [file.ez]` | Run an Ezra program |
| `ezra new <name>` | Create a new project |
| `ezra check [file.ez]` | Parse without running |
| `ezra test [path]` | Run test files (`*_test.ez`) |
| `ezra fmt [path] [--check]` | Format source files |
| `ezra lint [path]` | Lint and report style issues |
| `ezra build [dir]` | Validate project structure |
| `ezra repl` | Interactive shell |
| `ezra --version` | Print version |
| `ezra --help` | Show help |

---

## IDE Support

### VS Code

Download **[ezra-lang-1.0.0.vsix](https://github.com/ranaji114/Ezra-programming-lang/releases/latest/download/ezra-lang-1.0.0.vsix)** then:

1. Open VS Code → Extensions (`Ctrl+Shift+X`)
2. Click `···` → **Install from VSIX**
3. Select the downloaded file → Reload

Features:
- Full syntax highlighting for `.ez` files
- **Ezra Neon** dark theme
- 30+ smart snippets with tab stops
- Run/Check/Lint/Format commands (`Ctrl+R` to run)
- LSP: real-time diagnostics, hover docs, completions, go-to-definition

### Vim / Neovim

```bash
cp editor-support/vim/syntax/ezra.vim   ~/.vim/syntax/
cp editor-support/vim/ftdetect/ezra.vim ~/.vim/ftdetect/
cp editor-support/vim/indent/ezra.vim   ~/.vim/indent/
```

---

## Standard Library

| Module | Key Functions |
|---|---|
| Built-in | `say`, `input`, `len`, `range`, `type_of`, `text`, `number` |
| Math | `abs`, `sqrt`, `floor`, `ceil`, `sin`, `cos`, `pow`, `random` |
| Lists | `.sort()`, `.filter()`, `.map()`, `.reduce()`, `.sum()`, `.avg()` |
| Strings | `.upper()`, `.lower()`, `.trim()`, `.split()`, `.replace()` |
| File I/O | `read_file`, `write_file`, `file_exists`, `list_dir` |
| JSON | `parse_json`, `stringify_json` |
| OS | `cwd`, `env`, `args`, `sleep`, `time` |

Full reference: **[docs/stdlib/index.md](docs/stdlib/index.md)**

---

## Documentation

| Guide | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Installation and first program |
| [Tutorial](docs/tutorial.md) | Step-by-step introduction |
| [Language Reference](docs/language-reference.md) | Complete syntax reference |
| [CLI Reference](docs/cli-reference.md) | All commands |
| [Standard Library](docs/stdlib/index.md) | Built-in functions and modules |
| [Examples](docs/examples/index.md) | Annotated code examples |
| [Contributing](docs/contributing.md) | Dev setup and PR guide |

---

## Development

```bash
cargo fmt -- --check    # check formatting
cargo clippy            # lint (0 warnings expected)
cargo test              # 55/55 tests
cargo build --release   # release binary
```

**Test results:** 34 unit + 6 CLI smoke + 15 edge-case = **55/55 passing**

---

## Project Structure

```
src/            Rust source — lexer, parser, bytecode compiler, FastVM, LSP
docs/           MDN-style documentation
examples/       Runnable .ez example programs
std/            Standard library source files
vscode-extension/ VS Code extension (v1.0.0)
editor-support/ Vim/Neovim syntax files
installers/     Platform installer build scripts
install/        One-command install scripts
```

---

## License

**MIT** — Copyright 2026 Ankur Rana

Permission is hereby granted, free of charge, to any person obtaining a copy of this software to use, copy, modify, merge, publish, distribute, and sublicense it. See [LICENSE](LICENSE) for full text.
