# Syntax: Basics — Variables, Types, Operators

## Source Files

Ezra source files use the `.ez` extension and UTF-8 encoding. A UTF-8 BOM at
the start is silently ignored. Use spaces for indentation — tabs are rejected.

## Comments

```ezra
# This is a line comment
x is 5  # inline comment
x is 5  // also valid inline comment
```

Comment markers inside string literals are treated as text, not comments.

## Variables

Use `is` to create or update a variable:

```ezra
name is "Rana"
age is 20
score is 7 + 3 * 2   # 13, not 20 — * binds tighter than +
```

> **Python equivalent:** `name = "Rana"`
> **JavaScript equivalent:** `let name = "Rana"`

Variable names start with a letter or `_`, followed by letters, digits, or `_`.

### Typed declarations (`let` / `const`)

```ezra
let x is 10          # mutable, type inferred
let y: number is 3.14
const PI is 3.14159  # immutable
const MAX: number is 100
```

`const` variables cannot be reassigned — attempting to do so throws a runtime
error.

### Compound assignment

```ezra
score is 10
score += 5   # 15
score -= 2   # 13
score *= 2   # 26
score /= 2   # 13
```

> **Pitfall:** Compound assignment requires the variable to already exist.
> `new_var += 1` is a runtime error.

---

## Types

| Type | Literals | `type_of` result |
|---|---|---|
| Number | `0`, `-4`, `3.14`, `2.5e3` | `"number"` |
| Text | `"hello"`, `"line\n"` | `"text"` |
| Boolean | `yes`, `no` | `"bool"` |
| Nothing | `nothing` | `"nothing"` |
| List | `[1, 2, 3]` | `"list"` |
| Object | `{name: "Rana"}` | `"object"` |
| Function | `give f(x) -> x` | `"function"` |

Numbers are 64-bit floats. Whole numbers display without a decimal point (`3.0`
displays as `3`). There are no integer, long, or unsigned types.

```ezra
say type_of(42)        # number
say type_of("hello")   # text
say type_of(yes)       # bool
say type_of(nothing)   # nothing
say type_of([1, 2])    # list
say type_of({a: 1})    # object
```

---

## Text

```ezra
greeting is "Hello, World!"
multiline is "Line one\nLine two"
escaped is "She said \"hello\""
```

Escape sequences: `\n` newline · `\t` tab · `\"` double-quote · `\\` backslash

### Interpolation

```ezra
name is "Ezra"
version is 1
say "Welcome to {name} v{version}!"       # Welcome to Ezra v1!
say "2 + 2 = {2 + 2}"                     # 2 + 2 = 4
say "Upper: {name.upper()}"               # Upper: EZRA
```

> **Python equivalent:** `f"Welcome to {name} v{version}!"`
> **JavaScript equivalent:** `` `Welcome to ${name} v${version}!` ``

### Text methods

```ezra
s is "  Hello, World!  "
say s.upper()             # "  HELLO, WORLD!  "
say s.lower()             # "  hello, world!  "
say s.trim()              # "Hello, World!"
say s.contains("World")   # yes
say s.starts_with("  H")  # yes
say s.replace("World", "Ezra")  # "  Hello, Ezra!  "
say s.split(", ")         # ["  Hello", "World!  "]
say s.length              # 18
```

---

## Numbers

```ezra
x is 42
y is 3.14
z is -7
big is 1000000
```

Scientific notation is not a language literal but numbers can be computed:
```ezra
small is pow(10, -6)   # 0.000001
```

---

## Booleans

```ezra
ready is yes
done is no

check if ready
  say "Let's go!"
```

> **Python equivalent:** `True` / `False`
> **JavaScript equivalent:** `true` / `false`

### Truthiness

These values are **falsy** in conditions:
- `no`
- `nothing`
- `0`
- `""` (empty text)
- `[]` (empty list)
- `{}` (empty object)

Everything else is truthy.

```ezra
check if ""
  say "never"
otherwise
  say "empty string is falsy"   # ← this runs
```

---

## Operators

### Arithmetic

| Operator | Example | Result |
|---|---|---|
| `+` | `3 + 4` | `7` |
| `-` | `10 - 3` | `7` |
| `*` | `3 * 4` | `12` |
| `/` | `10 / 4` | `2.5` |
| `%` | `10 % 3` | `1` |
| `**` | `2 ** 8` | `256` |
| unary `-` | `-5` | `-5` |

`+` also concatenates: two numbers add, two lists merge, anything else
converts to text and concatenates.

```ezra
say 1 + 2      # 3  (number + number)
say [1] + [2]  # [1, 2]  (list + list)
say 1 + "2"    # "12"  (number + text → text)
say "a" + "b"  # "ab"
```

Division by zero is a runtime error. Remainder by zero is a runtime error.

### Comparison

| Operator | Meaning |
|---|---|
| `>` | Greater than |
| `>=` | Greater than or equal |
| `<` | Less than |
| `<=` | Less than or equal |
| `is` | Equal (in expression) |
| `is not` | Not equal (in expression) |
| `==` | Equal |
| `!=` | Not equal |

```ezra
say 3 > 2       # yes
say 3 is 3      # yes
say 3 is not 4  # yes
say "a" < "b"   # yes  (text comparison)
```

### Logical

| Operator | Behaviour |
|---|---|
| `not x` | Boolean negation |
| `x and y` | Short-circuit AND — right side not evaluated if left is falsy |
| `x or y` | Short-circuit OR — right side not evaluated if left is truthy |

```ezra
say not yes           # no
say yes and no        # no
say no or yes         # yes

# Safe null check — right side never runs if x is nothing
x is nothing
safe is x is not nothing and x > 0
```

### Bitwise

```ezra
say 12 & 10    # 8
say 12 | 10    # 14
say 12 ^ 10    # 6
say 8 << 2     # 32
say 16 >> 2    # 4
say ~5         # bitwise NOT (platform-dependent sign)
```

### Operator Precedence (high → low)

| Level | Operators |
|---|---|
| 1 | Function calls `f(args)` |
| 2 | Index `a[i]`, Property `a.b` |
| 3 | Unary `-`, `not` |
| 4 | `**` |
| 5 | `*`, `/`, `%` |
| 6 | `+`, `-` |
| 7 | `<<`, `>>` |
| 8 | `&` |
| 9 | `^` |
| 10 | `\|` |
| 11 | `>`, `>=`, `<`, `<=` |
| 12 | `is`, `is not`, `==`, `!=` |
| 13 | `and` |
| 14 | `or` |

Use parentheses to override:
```ezra
say (2 + 3) * 4   # 20, not 14
```

---

## Grammar Diagram

```
assignment ::= identifier "is" expression
             | identifier "+=" expression
             | identifier "-=" expression
             | identifier "*=" expression
             | identifier "/=" expression
             | "let" identifier [":" type] "is" expression
             | "const" identifier [":" type] "is" expression

expression ::= or_expr ["?" or_expr ":" or_expr]

or_expr    ::= and_expr ("or" and_expr)*
and_expr   ::= equality ("and" equality)*
equality   ::= comparison (("is" | "is not" | "==" | "!=") comparison)*
comparison ::= term ((">" | ">=" | "<" | "<=") term)*
term       ::= factor (("+" | "-") factor)*
factor     ::= power (("*" | "/" | "%") power)*
power      ::= unary ("**" unary)?
unary      ::= ("not" | "-") unary | postfix
postfix    ::= primary ("(" args ")" | "[" expr "]" | "." name)*
primary    ::= NUMBER | TEXT | "yes" | "no" | "nothing"
             | IDENTIFIER | "(" expression ")" | "[" list "]" | "{" object "}"
```
