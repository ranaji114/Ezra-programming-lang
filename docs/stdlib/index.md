# Standard Library

Ezra provides two layers of built-in functionality:

1. **Global builtins** — always available, no `use` needed.
2. **Standard modules** — imported with `use "std/..."`.

---

## Global Built-in Functions

### Output and Diagnostics

| Function / Statement | Description |
|---|---|
| `say expr` | Print value + newline to stdout |
| `write expr` | Print value without newline to stdout |
| `warn expr` | Print `warning: ...` to stderr |
| `fail expr` | Print `error: ...` to stderr |
| `debug expr` | Print `debug: ...` to stderr |
| `clear` | Send ANSI clear-screen sequence |
| `exit(code)` | Exit with given numeric code |

### Type Inspection

| Function | Arguments | Returns |
|---|---|---|
| `type_of(v)` | any value | text type name: `"number"`, `"text"`, `"bool"`, `"nothing"`, `"list"`, `"object"`, `"function"` |
| `is_number(v)` | any value | `yes` / `no` |
| `is_text(v)` | any value | `yes` / `no` |
| `is_bool(v)` | any value | `yes` / `no` |
| `is_list(v)` | any value | `yes` / `no` |
| `is_object(v)` | any value | `yes` / `no` |
| `is_function(v)` | any value | `yes` / `no` |
| `is_nothing(v)` | any value | `yes` / `no` |

### Type Conversion

| Function | Returns |
|---|---|
| `text(v)` | Text representation of any value |
| `number(v)` | Numeric conversion (error if not convertible) |
| `bool(v)` | Truthiness as `yes` / `no` |

### Collections

| Function | Arguments | Returns |
|---|---|---|
| `len(v)` | text, list, or object | length / character count / field count |
| `range(n)` | number | list `[0, 1, ..., n-1]` |
| `keys(obj)` | object | list of key strings |
| `values(obj)` | object | list of values |
| `has(obj, key)` | object, text | `yes` if key exists |

### Math

| Function | Returns |
|---|---|
| `abs(n)` | Absolute value |
| `sqrt(n)` | Square root |
| `floor(n)` | Round down |
| `ceil(n)` | Round up |
| `round(n)` | Round to nearest integer |
| `min(a, b)` | Smaller of two numbers |
| `max(a, b)` | Larger of two numbers |
| `pow(base, exp)` | `base ** exp` |
| `sin(n)` | Sine (radians) |
| `cos(n)` | Cosine (radians) |
| `tan(n)` | Tangent (radians) |
| `log(n)` | Natural logarithm |
| `log10(n)` | Base-10 logarithm |
| `exp(n)` | `e ** n` |

### Strings

| Function | Arguments | Returns |
|---|---|---|
| `contains(s, sub)` | text, text | `yes` if `sub` in `s` |
| `starts_with(s, pre)` | text, text | `yes` / `no` |
| `ends_with(s, suf)` | text, text | `yes` / `no` |
| `find(s, sub)` | text, text | index or `-1` |
| `replace(s, from, to)` | text, text, text | new text |
| `split(s, sep)` | text, text | list of text |
| `join(list, sep)` | list, text | joined text |
| `trim(s)` | text | whitespace removed from both ends |
| `upper(s)` | text | uppercase |
| `lower(s)` | text | lowercase |

### Functional

| Function | Arguments | Returns |
|---|---|---|
| `map(list, fn)` | list, function | new list with fn applied to each item |
| `filter(list, fn)` | list, function | new list with items where fn returns truthy |
| `reduce(list, fn, init)` | list, function, value | accumulated value |
| `sort(list)` | list | sorted copy (numeric for all-number lists, else lexicographic) |
| `reverse(list)` | list | reversed copy |

### File I/O

| Function | Arguments | Returns |
|---|---|---|
| `read_file(path)` | text | file contents as text, or `nothing` on error |
| `write_file(path, text)` | text, text | `nothing` |
| `append_file(path, text)` | text, text | `nothing` |
| `file_exists(path)` | text | `yes` / `no` |
| `file_delete(path)` | text | `nothing` |
| `file_copy(src, dst)` | text, text | `nothing` |
| `file_size(path)` | text | size in bytes as number |
| `list_dir(path)` | text | list of filenames |
| `create_dir(path)` | text | `nothing` |

### JSON

| Function | Returns |
|---|---|
| `parse_json(s)` | Ezra value (object, list, number, text, bool, nothing) |
| `stringify_json(v)` | JSON text |

### OS and Time

| Function | Returns |
|---|---|
| `cwd()` | Current working directory as text |
| `env(name)` | Environment variable value or `nothing` |
| `args()` | List of command-line argument strings |
| `sleep(ms)` | Pause execution for `ms` milliseconds |
| `time()` | Unix timestamp as number (seconds) |
| `date_now()` | Object with `unix` field (current Unix time) |
| `random()` | Random float in `[0, 1)` |
| `random_int(min, max)` | Random integer in `[min, max]` |

---

## Standard Modules

Import a module with `use`:

```ezra
use "std/math" as math
say math.pi
```

Or import specific names:

```ezra
from "std/math" use sin, cos, pi
say sin(pi / 2)
```

### `std/math`

Constants: `pi`, `e`  
Functions: all math builtins above plus `random`, `random_int`

### `std/io`

Functions: `read_file`, `write_file`, `append_file`, `file_exists`, `file_delete`, `file_copy`, `file_size`, `list_dir`, `create_dir`

### `std/string`

Functions: `split`, `join`, `replace`, `trim`, `upper`, `lower`, `contains`, `starts_with`, `ends_with`, `find`

### `std/json`

- `parse(s)` — alias for `parse_json`
- `stringify(v)` — alias for `stringify_json`

### `std/os`

Functions: `env`, `cwd`, `args`, `sleep`, `exit`, `time`

### `std/datetime`

- `now()` — alias for `date_now`

### `std/types`

Functions: all type-check and conversion builtins above

---

## Method Syntax

Methods are called with dot notation on a value:

```ezra
text is "Hello, World!"
say text.upper()
say text.lower()
say text.trim()
say text.contains("World")
say text.length

numbers is [3, 1, 4, 1, 5]
say numbers.sort()
say numbers.reverse()
say numbers.push(9)
say numbers.length
say numbers.first()
say numbers.last()
say numbers.sum()
say numbers.avg()
```

### Text Methods

| Method | Returns |
|---|---|
| `.upper()` | Uppercase copy |
| `.lower()` | Lowercase copy |
| `.trim()` | Whitespace-stripped copy |
| `.contains(sub)` | `yes` / `no` |
| `.starts_with(pre)` | `yes` / `no` |
| `.ends_with(suf)` | `yes` / `no` |
| `.split(sep)` | list |
| `.replace(from, to)` | new text |
| `.length` | character count |
| `.is_empty()` | `yes` / `no` |

### List Methods

| Method | Returns |
|---|---|
| `.push(v)` | new list with v appended |
| `.pop()` | new list without last item |
| `.sort()` | sorted copy |
| `.reverse()` | reversed copy |
| `.take(n)` | first n items |
| `.drop(n)` | items after first n |
| `.sum()` | sum of all numbers |
| `.avg()` | average of all numbers |
| `.min()` | smallest number |
| `.max()` | largest number |
| `.join(sep)` | joined text |
| `.contains(v)` | `yes` / `no` |
| `.length` | item count |
| `.is_empty()` | `yes` / `no` |
| `.first()` | first item or `nothing` |
| `.last()` | last item or `nothing` |
| `.map(fn)` | new list with fn applied |
| `.filter(fn)` | filtered new list |

### Object Methods

| Method | Returns |
|---|---|
| `.keys()` | list of key strings |
| `.values()` | list of values |
| `.has(key)` | `yes` / `no` |
| `.length` | field count |
| `.is_empty()` | `yes` / `no` |
