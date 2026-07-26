# Ezra

**A readable scripting language built in Rust.**

**Created by [Ankur Rana](https://github.com/ranaji114)**

[![Release](https://img.shields.io/github/v/release/ranaji114/Flux-programming-lang?label=version&color=blueviolet)](https://github.com/ranaji114/Flux-programming-lang/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-55%2F55-brightgreen)](#)

---

## Install

### Windows — One Command

Open PowerShell and run:

```powershell
powershell -ExecutionPolicy Bypass -File install\install.ps1
```

Or download the zip directly from [GitHub Releases](https://github.com/ranaji114/Flux-programming-lang/releases/latest), extract it, and add the folder to your PATH.

### Linux / macOS

```bash
sh install/install.sh
```

### Verify

```bash
ezra --version   # ezra 1.0.0
```

---

## Quick Start

```bash
ezra new my_app
cd my_app
ezra run
```

First program (`src/main.ez`):

```ezra
name is input "Your name: "
say "Hello {name}!"
```

---

## Language at a Glance

```ezra
# Variables
name is "Rana"
age  is 25

# Conditions
check if age >= 18
  say "Adult"
otherwise
  say "Minor"

# Functions
give add(a, b)
  -> a + b

say add(3, 4)   # 7

# Lists + higher-order
nums   is [1, 2, 3, 4, 5]
evens  is nums.filter(n -> n % 2 is 0)
say evens   # [2, 4]

# Error handling
try
  result is 10 / 0
catch err
  say "Caught: {err}"

# JSON
data is { name: "Ezra", version: 1 }
say stringify_json(data)
```

---

## CLI Commands

| Command | Description |
|---|---|
| `ezra run [file.ez]` | Run a program |
| `ezra new <name>` | Create a new project |
| `ezra check [file.ez]` | Parse without running |
| `ezra test [path]` | Run test files |
| `ezra fmt [path]` | Format source files |
| `ezra lint [path]` | Lint source files |
| `ezra repl` | Interactive shell |
| `ezra --version` | Print version |

---

## IDE Support

### VS Code
Install the extension — search **"Ezra Language"** in Extensions, or install the VSIX from [Releases](https://github.com/ranaji114/Flux-programming-lang/releases/latest).

Features: syntax highlighting, Ezra Neon theme, 30+ snippets, run/check/lint/format commands, LSP (diagnostics, hover, completions, go-to-definition).

### Vim / Neovim

```bash
cp editor-support/vim/syntax/ezra.vim   ~/.vim/syntax/
cp editor-support/vim/ftdetect/ezra.vim ~/.vim/ftdetect/
cp editor-support/vim/indent/ezra.vim   ~/.vim/indent/
```

---

## Documentation

📚 **https://ranaji114.github.io/Flux-programming-lang**

| Section | Link |
|---|---|
| Tutorial | [docs/tutorial.md](docs/tutorial.md) |
| Language Reference | [docs/language-reference.md](docs/language-reference.md) |
| Standard Library | [docs/stdlib/index.md](docs/stdlib/index.md) |
| CLI Reference | [docs/cli-reference.md](docs/cli-reference.md) |

---

## Build from Source

Requires [Rust](https://rustup.rs/) (stable):

```bash
git clone https://github.com/ranaji114/Flux-programming-lang
cd Flux-programming-lang
cargo build --release
# Binary: target/release/ezra
```

---

## License

MIT — Created by Ankur Rana
