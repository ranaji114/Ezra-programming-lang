" Ezra language syntax highlighting for Vim/Neovim
" Author: Ankur Rana
" Version: 1.0.0
" Place in: ~/.vim/syntax/ezra.vim  (Vim)
"       or: ~/.config/nvim/syntax/ezra.vim  (Neovim)

if exists("b:current_syntax")
  finish
endif

" ── Keywords ────────────────────────────────────────────────────────────────
syn keyword ezraKeyword     check otherwise repeat for each in give return break next
syn keyword ezraKeyword     while until loop pick when
syn keyword ezraKeyword     try catch finally throw assert
syn keyword ezraKeyword     use from export module as
syn keyword ezraKeyword     let const struct enum impl self new
syn keyword ezraKeyword     and or not is
syn keyword ezraBoolean     yes no
syn keyword ezraNull        nothing

" ── Built-in functions ──────────────────────────────────────────────────────
syn keyword ezraBuiltin     say write print warn fail debug clear exit
syn keyword ezraBuiltin     input input_number
syn keyword ezraBuiltin     len range type_of text number bool size_of
syn keyword ezraBuiltin     abs sqrt floor ceil round min max pow
syn keyword ezraBuiltin     sin cos tan log log10 exp
syn keyword ezraBuiltin     random random_int time sleep
syn keyword ezraBuiltin     read_file write_file append_file file_exists file_delete
syn keyword ezraBuiltin     file_copy file_size list_dir create_dir
syn keyword ezraBuiltin     parse_json stringify_json
syn keyword ezraBuiltin     cwd env args date_now
syn keyword ezraBuiltin     is_number is_text is_bool is_list is_object is_function is_nothing

" ── Comments ────────────────────────────────────────────────────────────────
syn match  ezraLineComment  "#.*$"
syn match  ezraLineComment  "//.*$"
syn region ezraBlockComment start="/\*" end="\*/" fold

" ── Strings ─────────────────────────────────────────────────────────────────
syn region ezraString start='"' end='"' skip='\\"' contains=ezraInterp,ezraEscape
syn match  ezraEscape contained '\\[ntr"\\]'
syn region ezraInterp contained start='{' end='}' contains=@ezraExpr

" ── Numbers ─────────────────────────────────────────────────────────────────
syn match  ezraNumber '\b\d\+\(\.\d\+\)\?\b'

" ── Operators ────────────────────────────────────────────────────────────────
syn match  ezraOperator '[-+*/%^&|~<>!]=\?'
syn match  ezraOperator '\*\*'
syn match  ezraOperator '->'
syn match  ezraOperator '|>'
syn match  ezraOperator '?'
syn match  ezraOperator '\.'

" ── Function declarations ────────────────────────────────────────────────────
syn match  ezraFuncDecl '\bgive\s\+\zs[a-zA-Z_][a-zA-Z0-9_]*'

" ── Type names (CamelCase) ───────────────────────────────────────────────────
syn match  ezraType '\b[A-Z][a-zA-Z0-9_]*\b'

" ── Cluster for interpolation ────────────────────────────────────────────────
syn cluster ezraExpr contains=ezraBuiltin,ezraBoolean,ezraNull,ezraNumber,ezraOperator

" ── Highlight links ──────────────────────────────────────────────────────────
hi def link ezraKeyword     Keyword
hi def link ezraBoolean     Boolean
hi def link ezraNull        Constant
hi def link ezraBuiltin     Function
hi def link ezraLineComment Comment
hi def link ezraBlockComment Comment
hi def link ezraString      String
hi def link ezraEscape      SpecialChar
hi def link ezraInterp      PreProc
hi def link ezraNumber      Number
hi def link ezraOperator    Operator
hi def link ezraFuncDecl    Function
hi def link ezraType        Type

let b:current_syntax = "ezra"
