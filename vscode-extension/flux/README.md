# Flux Language Support for VS Code

**Created by [Ankur Rana](https://github.com/ranaji114)**

Syntax highlighting, snippets, commands, and integrated run support for the
[Flux programming language](https://github.com/ranaji114/Flux-programming-lang) —
a readable, indentation-based scripting language built in Rust.

```flux
name is input "Enter your name: "
age is input_number "Enter your age: "

check if age >= 18
  say "Hello {name}, you are an adult."
otherwise
  say "Hello {name}, you are a minor."
```

---

## Step 1 — Install the Flux Interpreter

The extension needs the `flux` executable to run, check, lint, and format files.

### Windows

1. Go to the [latest release](https://github.com/ranaji114/Flux-programming-lang/releases/latest)
2. Download **`flux-windows-x86_64.zip`**
3. Extract it — you'll find `flux.exe` inside
4. Move `flux.exe` to a folder like `C:\Users\YourName\AppData\Local\Flux\bin\`
5. Add that folder to your **PATH** (System → Advanced → Environment Variables)
6. Open a new terminal and run: `flux --version`

Or run the one-line installer in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/ranaji114/Flux-programming-lang/main/install/install.ps1 | iex"
```

### Linux / macOS

```bash
curl -fsSL https://raw.githubusercontent.com/ranaji114/Flux-programming-lang/main/install/install.sh | sh
```

---

## Step 2 — Write and Run Flux Code

Open any `.flux` file. The extension activates automatically.

**Run options:**

| Method | Action |
|--------|--------|
| ▶ Button (editor title) | Run current file |
| `Ctrl+R` / `Cmd+R` | Run current file |
| `F5` | Run current file |
| Command Palette → **Flux: Run File** | Run current file |

Output appears in the **Flux** output panel.

---

## Features

- **Language detection** for `.flux` and `.flx` files
- **Syntax highlighting** for keywords, strings, numbers, operators, and comments
- **Snippets** for common patterns (`check if`, `give`, `repeat`, `for each`, etc.)
- **Run, Check, Lint, Format** commands via Command Palette or keyboard
- **REPL** — open an interactive Flux session in the integrated terminal
- **New Project** — scaffold a new Flux project from inside VS Code
- **Flux Neon** dark color theme optimized for Flux syntax

---

## Commands

| Command | Description |
|---------|-------------|
| **Flux: Run File** | Run the active `.flux` file |
| **Flux: Check Syntax** | Check for syntax errors |
| **Flux: Lint File** | Run the linter on the active file |
| **Flux: Format File** | Auto-format the active file |
| **Flux: Open REPL** | Open an interactive Flux REPL |
| **Flux: New Project** | Scaffold a new Flux project |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+R` / `Cmd+R` | Run the current Flux file |
| `F5` | Run the current Flux file |
| `Ctrl+Shift+R` / `Cmd+Shift+R` | Open the Flux REPL |

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `flux.path` | `flux` | Path to the Flux executable. Set this if Flux is not on your PATH. |
| `flux.runOnSave` | `false` | Automatically run the file whenever you save it. |

Custom path example (`settings.json`):

```json
{
  "flux.path": "C:\\Users\\YourName\\AppData\\Local\\Flux\\bin\\flux.exe"
}
```

---

## Troubleshooting

**File shows as Plain Text?**
Click the language indicator in the bottom-right corner and select **Flux**.

**"Flux executable was not found"?**
Install the interpreter (Step 1 above), then either restart VS Code or set
`flux.path` in your settings to the full path of the executable.

---

## Resources

- [GitHub Repository](https://github.com/ranaji114/Flux-programming-lang)
- [Language Reference](https://github.com/ranaji114/Flux-programming-lang/blob/main/docs/language-reference.md)
- [Tutorial](https://github.com/ranaji114/Flux-programming-lang/blob/main/docs/tutorial.md)
- [CLI Reference](https://github.com/ranaji114/Flux-programming-lang/blob/main/docs/cli-reference.md)

---

## License

MIT — Created by [Ankur Rana](https://github.com/ranaji114)
