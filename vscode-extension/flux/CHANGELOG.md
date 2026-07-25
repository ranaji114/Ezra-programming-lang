# Changelog

All notable changes to the Flux Language Support extension will be documented in this file.

## [0.1.0] - 2026-07-20

### Added
- **Syntax Highlighting** — Full TextMate grammar for Flux language keywords, strings, numbers, operators, comments, and built-in functions
- **Code Snippets** — 30+ ready-to-use snippets (say, give, check, pick, repeat, actor, try, pipe, hello, fizzbuzz, etc.)
- **Run Support** — Run `.flux` files directly from VS Code via `Ctrl+R` or `F5`
- **Command Palette** — Flux: Run File, Check Syntax, Lint File, Format File, Open REPL, New Project
- **Language Configuration** — Auto bracket closing, comment toggling, indent rules, folding markers
- **String Interpolation** — `{variable}` highlighting inside strings
- **Error Output Panel** — Dedicated Flux output channel in VS Code

### Language Support
- Keywords: `give`, `check`, `pick`, `repeat`, `build`, `on`, `tell`, `ask`, `try`, `catch`, `throw`, `shape`, `use`, etc.
- Built-in functions: `say`, `print`, `input`, `len`, `upper`, `lower`, `map`, `filter`, `reduce`, `sort`, etc.
- Constants: `yes`, `no`, `nothing`
- Operators: `->`, `|>`, `..`, `?`, `?.`, `...`, `+=`, `-=`, `*=`, `/=`
- Comments: `#` line comment, `/* */` block comment
- Numbers: integer, float, hex, binary, octal with underscore separators
- Strings: single, double, triple-quoted with interpolation

[0.1.0]: https://github.com/ankur-rana/flux/releases/tag/v0.1.0
