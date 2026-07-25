" Ezra indentation rules for Vim/Neovim
" Author: Ankur Rana
if exists("b:did_indent")
  finish
endif
let b:did_indent = 1

setlocal expandtab
setlocal tabstop=2
setlocal shiftwidth=2
setlocal softtabstop=2

setlocal indentexpr=EzraIndent(v:lnum)
setlocal indentkeys=o,O,!^F,=otherwise,=catch,=finally

function! EzraIndent(lnum)
  let prev_lnum = prevnonblank(a:lnum - 1)
  if prev_lnum == 0
    return 0
  endif
  let prev_line = getline(prev_lnum)
  let cur_line  = getline(a:lnum)
  let ind = indent(prev_lnum)

  " Increase indent after block-opening keywords
  if prev_line =~# '^\s*\(give\|check if\|otherwise\|otherwise if\|repeat.*times\|for each\|while\|until\|loop\|try\|catch\|finally\|pick\|struct\|enum\|impl\)\b'
    let ind += &shiftwidth
  endif

  " Decrease indent for continuation keywords
  if cur_line =~# '^\s*\(otherwise\|catch\|finally\)\b'
    let ind -= &shiftwidth
  endif

  return ind
endfunction
