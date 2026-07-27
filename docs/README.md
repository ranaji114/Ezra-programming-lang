# Ezra Documentation

Flux is a readable, indentation-based scripting language built in Rust.
This documentation describes the language and tools available in the current
`v1.0.0` release.

## Start Here

- [Tutorial](tutorial.md): learn Flux by building small programs.
- [Language Reference](language-reference.md): complete syntax and behavior reference.
- [CLI Reference](cli-reference.md): every `ezra` command and its options.
- [Tooling and VS Code](tooling.md): projects, formatting, linting, REPL, and editor integration.
- [Release Guide](release.md): build and publish Flux releases.

## A First Program

```ezra
name is input "What is your name? "
say "Hello {name}!"
```

Save it as `main.ez` and run it:

```bash
ezra run main.ez
```

## What Is Available Today?

The current interpreter supports:

- text, numbers, booleans, `nothing`, lists, and objects
- variables and compound assignment
- arithmetic, comparison, equality, and logical operators
- conditions, counted loops, and list iteration
- named functions, parameters, `return`, and `->`
- text interpolation, indexing, property access, and a small standard library
- input/output statements, syntax checking, linting, formatting, testing, and a REPL

Flux is an alpha release. Modules, packages, native compilation, async actors,
and a larger standard library are not part of this version.

## Documentation Conventions

Code blocks marked `ezra` are Ezra source files. Shell commands are shown for a
terminal. In examples, two spaces are used for one indentation level.

The reference documents the behavior implemented by the interpreter. Planned
features are kept in the limitations sections and are not presented as valid
Flux syntax.
