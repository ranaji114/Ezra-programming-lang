# Ezra v1.0.0 — Release Summary

**Author:** Ankur Rana  
**Date:** 2026-07-25  
**Repository:** https://github.com/ranaji114/Ezra-programming-lang  
**Docs:** https://ranaji114.github.io/Ezra-programming-lang

---

## What's New in v1.0.0

### Bug Fixes (from v0.1.0-alpha)

| # | Fix | File |
|---|---|---|
| 1 | `and`/`or` now short-circuit in FastVM | `src/fullvm.rs` |
| 2 | Arrow functions parse in all expression positions | `src/parser.rs` |
| 3 | `invoke_compiled_function` no longer discards return values | `src/fullvm.rs` |
| 4 | `.filter()` / `.map()` / `.reduce()` work as list dot-methods | `src/fullvm.rs` |
| 5 | `input_number` throws runtime error on invalid input | `src/fullvm.rs` |
| 6 | Arity checking at call time in FastVM | `src/fullvm.rs` |
| 7 | `sort()` sorts number lists numerically | `src/fullvm.rs` |
| 8 | 46 clippy style warnings resolved via `cargo clippy --fix` | all |

### New Features

| Feature | Description |
|---|---|
| **VS Code Extension v1.0.0** | Complete rewrite: new language ID `ezra`, 30+ snippets, Ezra Neon theme, stop-run button, LSP config settings |
| **Rich LSP hover** | 60+ built-in function docs with signatures, parameter descriptions, and examples |
| **LSP completions with snippets** | Keyword completions expand to full code templates with tab stops |
| **LSP go-to-definition** | Jumps to user-defined function or variable definition within the file |
| **LSP user-symbol completion** | Completions include functions and variables from the open document |
| **Vim/Neovim support** | Syntax highlighting, file-type detection, indentation, LSP setup instructions |
| **Inno Setup installer** | Full Windows `.exe` installer with PATH, file association, uninstaller |
| **Debian `.deb` package** | MIME type, man page, desktop entry, dpkg-deb build script |
| **RPM package** | Fedora/RHEL `.rpm` build script |
| **macOS `.pkg` installer** | `pkgbuild`/`productbuild` with welcome/conclusion HTML pages |
| **Linux ARM64 CI target** | `aarch64-unknown-linux-gnu` cross-compile in GitHub Actions |
| **Docs deploy to GitHub Pages** | MkDocs Material, auto-deploys on push to `main` |
| **VS Code Marketplace publish** | GitHub Actions workflow on release + manual dry-run |
| **SHA256SUMS** | All release artifacts have checksums |

---

## Test Suite

| Suite | Tests | Status |
|---|---|---|
| Unit tests | 34 | ✅ All pass |
| CLI smoke tests | 6 | ✅ All pass |
| Edge-case tests | 15 | ✅ All pass |
| **Total** | **55** | **✅ 100%** |

Zero clippy warnings. Zero unsafe code. Zero hardcoded secrets.

---

## Installation

### Windows (one-click)
```powershell
powershell -ExecutionPolicy Bypass -File install/install.ps1
```
Or download `ezra-windows-x86_64-1.0.0.exe` from GitHub Releases.

### Linux / macOS
```bash
sh install/install.sh
```

### Linux (Debian/Ubuntu)
```bash
sudo dpkg -i ezra-lang_1.0.0_amd64.deb
```

### Verify
```bash
ezra --version   # ezra 1.0.0
```

---

## IDE Support

### VS Code
1. Install from Marketplace: search **Ezra Language**
2. Or install VSIX: Extensions → ··· → Install from VSIX → `ezra-lang-1.0.0-vscode.vsix`

Features: syntax highlighting, Ezra Neon theme, 30+ snippets, run/check/lint/format commands, LSP (diagnostics, hover, completions, go-to-def).

### Vim / Neovim
```bash
cp editor-support/vim/syntax/ezra.vim   ~/.vim/syntax/
cp editor-support/vim/ftdetect/ezra.vim ~/.vim/ftdetect/
cp editor-support/vim/indent/ezra.vim   ~/.vim/indent/
```

---

## Platform Binaries

| Platform | Archive |
|---|---|
| Windows x86_64 | `ezra-windows-x86_64-1.0.0.zip` |
| Linux x86_64 | `ezra-linux-x86_64-1.0.0.tar.gz` |
| Linux ARM64 | `ezra-linux-aarch64-1.0.0.tar.gz` |
| macOS x86_64 | `ezra-macos-x86_64-1.0.0.tar.gz` |
| macOS Apple Silicon | `ezra-macos-aarch64-1.0.0.tar.gz` |
| VS Code Extension | `ezra-lang-1.0.0-vscode.vsix` |
| Windows Installer | `ezra-windows-x86_64-1.0.0.exe` |
| Debian Package | `ezra-lang_1.0.0_amd64.deb` |

---

## Known Limitations

1. **`struct`/`impl` OOP** — constructors work; `self`-binding in methods is incomplete (v1.1)
2. **REPL is single-line** — multi-line blocks must be saved to a file (v1.1)
3. **Recursive performance** — ~1.5× slower than Python for deep recursion; iterative code matches CPython
4. **`async`/`await`** — keywords are reserved but not implemented (v1.1)
5. **Package manager** — `ezra add` not yet implemented (v1.1)

---

## Roadmap: v1.1

- Full `struct`/`impl` with `self` binding
- Multi-line REPL with continuation detection
- Tail-call optimisation
- `ezra add <library>` package manager
- `std/http`, `std/regex`, `std/csv` modules
- Async/await with tokio
- LSP go-to-definition across files
- VS Code Marketplace publish

---

## File Structure

```
ezra-v1.0.0/
├── src/                          Rust source (lexer, parser, FastVM, LSP)
├── tests/
│   ├── cli_smoke.rs              6 CLI integration tests
│   ├── edge_cases.rs             15 edge-case integration tests
│   └── edge_cases/               .ez test programs
├── examples/                     Runnable .ez example programs
├── std/                          Standard library source files
├── docs/
│   ├── index.md
│   ├── syntax/                   basics, control-flow, functions, advanced
│   ├── stdlib/                   io, math, collections, index
│   ├── examples/                 annotated examples
│   └── contributing.md
├── vscode-extension/flux/
│   ├── extension.js              Extension entry point (v1.0.0)
│   ├── syntaxes/ezra.tmLanguage.json   Complete grammar (60+ scopes)
│   ├── snippets/ezra.json        30+ snippets with tab stops
│   ├── themes/ezra-neon-color-theme.json
│   └── ezra-lang-1.0.0.vsix     Packaged extension
├── editor-support/vim/           Vim/Neovim syntax, ftdetect, indent
├── installers/
│   ├── windows/ezra-setup.iss   Inno Setup script
│   ├── linux/build-deb.sh       .deb builder
│   ├── linux/build-rpm.sh       .rpm builder
│   ├── macos/build-pkg.sh       .pkg builder
│   ├── build-all.sh             Unix all-in-one build
│   └── build-all.ps1            Windows all-in-one build
├── install/
│   ├── install.ps1              Windows one-liner installer
│   └── install.sh               Linux/macOS one-liner installer
├── .github/workflows/
│   ├── release.yml              CI + cross-platform build + GitHub Release + Pages
│   └── publish-vscode.yml       VS Code Marketplace publish
├── mkdocs.yml                   MkDocs Material configuration
├── SHA256SUMS                   Checksums for all release artifacts
├── AUDIT_REPORT_ANKUR_RANA.md  Full production audit report
├── RELEASE_SUMMARY.md           This file
└── README.md                    Updated project README (v1.0.0)
```
