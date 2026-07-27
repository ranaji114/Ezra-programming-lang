# Getting Started with Ezra

This page gets you running with Ezra in under 5 minutes.

---

## Install

### Windows

**Option 1 — GUI installer (recommended)**

Download [EzraSetup-1.0.0.exe](https://github.com/ranaji114/Ezra-programming-lang/releases/latest/download/EzraSetup-1.0.0.exe) and double-click it.

> Windows may show "Windows protected your PC" — click **More info → Run anyway**.

**Option 2 — Command line**

```powershell
powershell -ExecutionPolicy Bypass -File install\install.ps1
```

### Linux / macOS

```bash
sh install/install.sh
```

### From source

```bash
git clone https://github.com/ranaji114/Ezra-programming-lang
cd Flux-programming-lang
cargo build --release
```

### Verify

```
ezra --version
```

Expected: `ezra 1.0.0`

---

## Your First Program

Create a file called `hello.ez`:

```ezra
say "Hello, World!"
```

Run it:

```bash
ezra run hello.ez
```

Output: `Hello, World!`

---

## Create a Project

```bash
ezra new hello_app
cd hello_app
ezra run
```

This creates:

```
hello_app/
  ezra.toml         project config
  src/
    main.ez         entry point
  tests/
    main_test.ez    test file
```

---

## Core Commands

```bash
ezra run [file.ez]          # Run a program
ezra check [file.ez]        # Parse without running
ezra test [tests-dir]       # Run test files
ezra fmt [path] [--check]   # Format .ez files
ezra lint [path]            # Lint source files
ezra build [project-dir]    # Validate project
ezra repl                   # Interactive shell
ezra --version              # Print version
```

---

## A Small Example

```ezra
name is input "Name: "
say "Hello {name}!"
```

Save as `main.ez` and run:

```bash
ezra run main.ez
```

---

## Current Status

Ezra v1.0.0 supports:

- Variables, types, expressions
- Conditions, loops, functions
- Text interpolation
- Lists, objects, higher-order functions
- Error handling (`try`/`catch`/`throw`)
- Pattern matching (`pick`/`when`)
- Modules (`use`/`from`)
- File I/O, JSON, math, OS builtins
- REPL, formatter, linter, test runner
- VS Code extension with LSP

See the [Language Reference](language-reference.md) for the complete syntax.
See the [Standard Library](stdlib/index.md) for all built-in functions.
