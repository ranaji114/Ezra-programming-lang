# Flux Language Support for VS Code

Syntax highlighting, snippets, commands, and run support for the Flux
programming language.

## Features

- Flux language detection for .flux and .flx files
- syntax highlighting for current Flux syntax
- snippets for common Flux programs
- Run File, Check Syntax, Lint File, and Format File commands
- REPL and New Project commands
- Flux Neon dark color theme

## Installation from VSIX

1. Build or download the VSIX file.
2. Open the VS Code Extensions view.
3. Open the Extensions menu.
4. Choose Install from VSIX.
5. Select flux-0.1.0.vsix.
6. Reload the VS Code window.

The full package is built with:

~~~bash
npm install
npm run package
~~~

## Run a Flux File

Open a .flux file and confirm that the language mode is Flux. Then use:

- the Run button in the editor title
- Flux: Run File from the Command Palette
- Ctrl+R
- F5

Program output appears in the Flux output panel.

## Commands

- Flux: Run File
- Flux: Check Syntax
- Flux: Lint File
- Flux: Format File
- Flux: Open REPL
- Flux: New Project

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl+R | Run the current Flux file |
| F5 | Run the current Flux file |
| Ctrl+Shift+R | Open the Flux REPL |

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| flux.path | installed Flux path | Path to flux.exe or flux |
| flux.runOnSave | false | Run the active file after saving |

Example:

~~~json
{
  "flux.path": "C:\\Users\\ranaa\\.flux\\bin\\flux.exe",
  "flux.runOnSave": false
}
~~~

## Troubleshooting

If the file is shown as Plain Text, choose Flux from the language mode picker
in the lower-right corner. If the Run command cannot find Flux, set flux.path
to the full path of the installed executable.

For language syntax, read the repository
documentation at docs/language-reference.md.

