# Ezra Language — VS Code Extension

**Author:** Ankur Rana  
**Version:** 1.0.0  
**Marketplace:** [ankur-rana.ezra-lang](https://marketplace.visualstudio.com/items?itemName=ankur-rana.ezra-lang)

Ezra is a readable, indentation-based scripting language built in Rust.
This extension brings full IDE support to VS Code.

---

## Features

### Syntax Highlighting

Full token-level colouring for all Ezra constructs:

- Keywords: `check if`, `otherwise`, `repeat`, `for each`, `give`, `try`, `pick`, …
- Built-in functions: `say`, `input`, `len`, `range`, `read_file`, `parse_json`, …
- String interpolation: `"Hello {name}"` — the `{…}` part is highlighted separately
- Method calls: `.filter()`, `.map()`, `.sort()`, `.upper()`, …
- Type names, constants (`yes`, `no`, `nothing`), operators, numbers

### Ezra Neon Theme

A purpose-built dark theme with vivid neon accents tuned for Ezra syntax.
Select it via **Preferences → Color Theme → Ezra Neon**.

### Snippets

30+ snippets for common patterns. Trigger with Tab after typing the prefix:

| Prefix | Inserts |
|---|---|
| `hello` | Hello World |
| `say` | `say "..."` |
| `check` | if block |
| `checkotherwise` | if / else |
| `checkchain` | if / else-if / else |
| `repeat` | repeat N times |
| `foreach` | for each loop |
| `while` | while loop with counter |
| `give` | function definition |
| `lambda` | arrow function |
| `filter` | `.filter(n -> ...)` |
| `map` | `.map(n -> ...)` |
| `reduce` | `.reduce((acc,n) -> ...)` |
| `trycatch` | try / catch |
| `pick` | pattern match |
| `json` | JSON round-trip |
| `fib` | Fibonacci function |
| `calculator` | Complete calculator example |

### Run, Check, Lint, Format

| Command | Shortcut | Description |
|---|---|---|
| Ezra: Run File | `Ctrl+R` / `F5` | Run the active `.ez` file |
| Ezra: Stop Running | — | Kill the running process |
| Ezra: Check Syntax | `Ctrl+Shift+K` | Parse without running |
| Ezra: Lint File | — | Report style warnings |
| Ezra: Format File | — | Auto-format the file |
| Ezra: Open REPL | `Ctrl+Shift+R` | Open interactive shell |
| Ezra: New Project | — | Scaffold a new project |

Output appears in the **Ezra** output panel.

### Language Server (LSP)

When `ezra-lsp` is on your PATH (it ships alongside `ezra`):

- **Diagnostics** — syntax errors underlined in red as you type
- **Auto-completions** — keywords, builtins, snippets
- **Hover tooltips** — function descriptions on hover
- **Document symbols** — functions and variables in the Outline panel

### File Associations

Activates for `.ez`, `.ar`, and `.flx` files.

---

## Installation

### From the Marketplace

Search for **Ezra Language** in the VS Code Extensions view (`Ctrl+Shift+X`).

### From VSIX

1. Download `ezra-lang-1.0.0.vsix` from the [GitHub releases page](https://github.com/ranaji114/Flux-programming-lang/releases).
2. Open VS Code → Extensions (`Ctrl+Shift+X`).
3. Click **···** → **Install from VSIX…**
4. Select the downloaded file and reload.

### Build from Source

```bash
cd vscode-extension/flux
npm install
npm run package          # produces ezra-lang-1.0.0.vsix
code --install-extension ezra-lang-1.0.0.vsix
```

---

## Requirements

- VS Code 1.75.0 or later.
- The `ezra` binary on your PATH (or set `ezra.executablePath` in settings).

### Install Ezra

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File install/install.ps1
```

**Linux / macOS:**
```bash
sh install/install.sh
```

Verify: `ezra --version`

---

## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `ezra.executablePath` | `ezra` | Path to the `ezra` binary |
| `ezra.runOnSave` | `false` | Auto-run on file save |
| `ezra.lsp.enabled` | `true` | Enable the language server |
| `ezra.lsp.serverPath` | `` | Explicit path to `ezra-lsp` |
| `ezra.lsp.trace` | `off` | LSP trace level |

---

## Troubleshooting

**"Ezra executable not found"**  
Set `ezra.executablePath` to the full path, e.g. `C:\Users\you\AppData\Local\Ezra\bin\ezra.exe`.

**Syntax not highlighted**  
Confirm the file language mode in the lower-right corner shows **Ezra**.
Click it to change manually.

**LSP not starting**  
Check that `ezra-lsp` exists in the same directory as `ezra`.
Set `ezra.lsp.serverPath` explicitly if needed.

---

## Author

Created by **Ankur Rana**  
GitHub: [github.com/ranaji114](https://github.com/ranaji114)  
Language repo: [Flux-programming-lang](https://github.com/ranaji114/Flux-programming-lang)

---

## License

MIT
