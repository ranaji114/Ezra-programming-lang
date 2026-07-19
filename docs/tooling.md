# Flux Tooling and VS Code

This guide covers the tools around the Flux interpreter.

## Installation

### Windows Release Install

From the repository:

~~~powershell
powershell -ExecutionPolicy Bypass -File install/install.ps1
~~~

Restart the terminal, then verify:

~~~powershell
flux --version
~~~

The installer downloads the Windows x86_64 release and adds its install
directory to the user PATH.

### Linux and macOS Release Install

~~~bash
sh install/install.sh
flux --version
~~~

The Unix installer installs into the user local binary directory. Ensure that
directory is in PATH.

### Run from Source

Flux development requires Rust and Cargo:

~~~bash
cargo run -- run examples/hello.flux
~~~

Useful source checks:

~~~bash
cargo fmt -- --check
cargo clippy -- -D warnings
cargo test
cargo build
~~~

## Project Structure

A project created by flux new looks like this:

~~~text
my_app/
  flux.toml
  src/
    main.flux
  tests/
    main_test.flux
~~~

The current CLI uses src/main.flux as the default entry point. The flux.toml
file stores package metadata, but dependency resolution and package commands
are not implemented yet.

A larger repository may also contain:

~~~text
examples/       runnable example programs
docs/           language and tool documentation
build/          generated manifest from flux build
target/         Rust build output; ignored by Flux file collection
~~~

## Formatting

Run the formatter on a file:

~~~bash
flux fmt src/main.flux
~~~

Run it over a project:

~~~bash
flux fmt .
~~~

Check without modifying files:

~~~bash
flux fmt . --check
~~~

The current formatter normalizes line endings, removes trailing whitespace,
keeps leading indentation, limits consecutive blank lines to one, and adds a
final newline.

It is intentionally conservative. It does not re-indent a program or rewrite
expressions.

## Linting

Run the linter on one file or a directory:

~~~bash
flux lint src/main.flux
flux lint .
~~~

The linter reports long lines, trailing whitespace, missing final newlines,
and parser errors. A parser error makes the command fail. Style warnings are
reported but do not fail the command.

## Testing

Flux test discovery is filename-based. In a tests directory, only files whose
stem ends with _test are selected:

~~~text
tests/
  calculator_test.flux
  strings_test.flux
  sample.flux
~~~

calculator_test.flux and strings_test.flux run with flux test. sample.flux is
ignored when the directory is passed.

A test file is a normal Flux program. It passes when it finishes without a
syntax or runtime error. There is no built-in assert statement yet, so a test
can use conditional logic and deliberate runtime failures when needed.

Run all tests:

~~~bash
flux test
~~~

Run one test file:

~~~bash
flux test tests/calculator_test.flux
~~~

## Build Validation

flux build checks that src/main.flux parses and writes build/manifest.txt:

~~~bash
flux build .
~~~

This is a validation and metadata step. It is not a compiler and does not
produce a native executable.

## REPL

Start the REPL:

~~~bash
flux repl
~~~

The REPL evaluates one input line at a time and preserves variables between
lines. Use exit, quit, or Ctrl+C to leave. Multi-line blocks should be saved in
a .flux file.

## VS Code Extension

The repository includes a VS Code extension under
vscode-extension/flux. It contributes:

- Flux language detection for .flux and .flx files
- syntax highlighting
- snippets
- Flux: Run File
- Flux: Check Syntax
- Flux: Lint File
- Flux: Format File
- Flux: Open REPL
- Flux: New Project
- a Flux Neon color theme

### Install from VSIX

Build the extension package:

~~~bash
cd vscode-extension/flux
npm install
npm run package
~~~

In VS Code:

1. Open the Extensions view.
2. Open the Extensions menu.
3. Choose Install from VSIX.
4. Select the generated flux-0.1.0.vsix file.
5. Reload the VS Code window.

### Run a Flux File

Open a file ending in .flux. Confirm that the language mode in the lower-right
corner says Flux. Then use any of these:

- the Run button in the editor title
- Flux: Run File from the Command Palette
- Ctrl+R
- F5

Output appears in the Flux output panel.

### Check, Lint, and Format

Open the Command Palette and choose:

~~~text
Flux: Check Syntax
Flux: Lint File
Flux: Format File
Flux: Open REPL
Flux: New Project
~~~

### Flux Neon Theme

Open the Command Palette and choose Preferences: Color Theme. Select Flux
Neon for the Flux-specific dark editor colors.

### Extension Settings

The extension supports:

| Setting | Meaning |
| --- | --- |
| flux.path | Path to the Flux executable |
| flux.runOnSave | Run the active Flux file after saving when true |

Example settings:

~~~json
{
  "flux.path": "flux",
  "flux.runOnSave": false
}
~~~

Run-on-save is disabled by default because a program may ask for input or have
side effects.

## Troubleshooting

### File Is Plain Text

Open a .flux file and select Flux from the language mode picker in the
lower-right corner. Confirm that the extension is installed and reload the
window.

### Run Command Cannot Find Flux

Set flux.path to the full path of the installed executable. On Windows the
installer uses:

~~~text
%LOCALAPPDATA%\Flux\bin\flux.exe
~~~

On a terminal, verify the executable with flux --version.

### Unexpected Character at 1:1

If the message mentions an invisible character at the beginning of the file,
the file may contain a UTF-8 byte-order mark. Current Flux accepts a BOM. If
an older binary is being used, update Flux and make sure flux.path points to
the updated executable.

### Unexpected Indentation

Use spaces instead of tabs. Every indented line must belong to a statement
that opens a block, such as check if, otherwise, repeat, for each, or give.

### Input Program Appears Frozen

The program may be waiting for input. input and input_number read from the
terminal. Type the requested value and press Enter.

### Syntax Looks Correct but Check Fails

Run:

~~~bash
flux check path/to/file.flux
~~~

The command reports the first parser error with a line and column. Also check
that the file is saved and that its language mode is Flux in VS Code.

## Release Artifacts

The release workflow is intended to publish:

~~~text
flux-windows-x86_64.zip
flux-linux-x86_64.tar.gz
flux-macos-x86_64.tar.gz
flux-macos-aarch64.tar.gz
~~~

The VS Code package is published separately as a VSIX file.
