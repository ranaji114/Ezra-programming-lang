# Ezra — Vim / Neovim Support

**Author:** Ankur Rana

Provides syntax highlighting, file-type detection, and auto-indentation
for `.ez` files in Vim and Neovim.

## Installation

### Manual

```bash
# Vim
cp syntax/ezra.vim   ~/.vim/syntax/
cp ftdetect/ezra.vim ~/.vim/ftdetect/
cp indent/ezra.vim   ~/.vim/indent/

# Neovim
cp syntax/ezra.vim   ~/.config/nvim/syntax/
cp ftdetect/ezra.vim ~/.config/nvim/ftdetect/
cp indent/ezra.vim   ~/.config/nvim/indent/
```

### vim-plug

```vim
Plug 'ranaji114/Flux-programming-lang', { 'rtp': 'editor-support/vim' }
```

### Lazy.nvim (Neovim)

```lua
{ "ranaji114/Flux-programming-lang", config = false,
  init = function()
    vim.opt.rtp:append(vim.fn.stdpath("data") .. "/lazy/Flux-programming-lang/editor-support/vim")
  end
}
```

### LSP (Neovim with nvim-lspconfig)

After installing `ezra` (which ships `ezra-lsp`):

```lua
local lspconfig = require("lspconfig")
local configs   = require("lspconfig.configs")

if not configs.ezra_lsp then
  configs.ezra_lsp = {
    default_config = {
      cmd = { "ezra-lsp" },
      filetypes = { "ezra" },
      root_dir = lspconfig.util.root_pattern("ezra.toml", ".git"),
      settings = {},
    },
  }
end

lspconfig.ezra_lsp.setup {}
```

## Features

- Syntax highlighting: keywords, built-ins, strings, interpolation, numbers
- File-type detection for `.ez`, `.flx`, `.ar`
- Auto-indentation matching Ezra's indentation rules
- LSP: diagnostics, completions, hover, document symbols (via `ezra-lsp`)
