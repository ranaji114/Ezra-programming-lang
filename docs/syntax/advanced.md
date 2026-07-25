# Syntax: Advanced — Error Handling, Modules, OOP, Types

## Error Handling

### `try` / `catch` / `finally`

```ezra
try
  result is 10 / 0
catch error
  say "Caught: {error}"
finally
  say "This always runs"
```

> **Python equivalent:** `try: ... except Exception as e: ... finally: ...`
> **JavaScript equivalent:** `try { } catch (e) { } finally { }`

The `catch` variable receives the error as text. `finally` always runs,
even when an error is re-thrown. Both `catch` and `finally` are optional:

```ezra
try
  risky_operation()
finally
  cleanup()
```

### `throw`

```ezra
give divide(a, b)
  check if b is 0
    throw "cannot divide by zero"
  -> a / b

try
  say divide(10, 0)
catch err
  say "Error: {err}"   # Error: cannot divide by zero
```

> **Python equivalent:** `raise ValueError("message")`
> **JavaScript equivalent:** `throw new Error("message")`

### Common error messages

| Message | Cause |
|---|---|
| `divide by zero` | `x / 0` |
| `remainder by zero` | `x % 0` |
| `undefined variable \`name\`` | Using a name before assigning it |
| `cannot assign to constant \`X\`` | Reassigning a `const` |
| `list index must be non-negative` | Negative list index |
| `text index must be integer` | Fractional text index |
| `repeat count must be a non-negative integer` | Bad repeat count |
| `function \`f\` expected N argument(s), got M` | Arity mismatch |
| `break used outside loop` | `break` not inside a loop |

---

## Modules

### Importing

```ezra
use "std/math" as math
say math.pi              # 3.141592653589793
say math.sin(math.pi)   # 0 (approximately)
```

Import specific names:

```ezra
from "std/math" use sin, cos, pi
say sin(pi / 2)   # 1
```

Import all into the current scope:

```ezra
use "std/io"
content is read_file("data.txt")
```

> **Python equivalent:** `import math` / `from math import sin, pi`
> **JavaScript equivalent:** `import { sin, pi } from "math"`

### File modules

Any `.ez` file can be a module. Names marked with `export` are available
to importers:

```ezra
# mylib.ez
export greet
export PI

PI is 3.14159

give greet(name)
  say "Hello {name}"
```

```ezra
# main.ez
use "mylib" as lib
lib.greet("Rana")
say lib.PI
```

### Standard modules

| Module | Key exports |
|---|---|
| `std/math` | `pi`, `e`, `sin`, `cos`, `sqrt`, `floor`, `ceil`, `random` |
| `std/io` | `read_file`, `write_file`, `append_file`, `file_exists`, `list_dir` |
| `std/string` | `split`, `join`, `replace`, `trim`, `upper`, `lower` |
| `std/json` | `parse`, `stringify` |
| `std/os` | `env`, `cwd`, `args`, `sleep`, `exit` |
| `std/datetime` | `now` |
| `std/types` | `is_number`, `is_text`, `is_bool`, `is_list`, `type_of` |

---

## Structs (Partial — v0.1.0)

Structs define named data types. In v0.1.0, `struct` creates a constructor
function that returns an object:

```ezra
struct Point
  x
  y

p is Point(3, 4)
say p.x   # 3
say p.y   # 4
```

> **Status:** Struct `impl` method dispatch is incomplete in v0.1.0.
> Methods defined in `impl` blocks register globally but do not bind to `self`
> automatically. Use plain objects and functions for reliable OOP patterns.

---

## Enums (Partial — v0.1.0)

```ezra
enum Direction
  North
  South
  East
  West

d is Direction.North
say d.__variant   # "North"
```

> **Status:** Enums produce plain objects. Pattern-matching on enum variants
> via `pick` works through equality comparison.

---

## Type Hints

Type hints are parsed and stored but not enforced at runtime. They serve
as documentation:

```ezra
let name: text is "Rana"
let count: number is 42
const MAX: number is 100

give add(a: number, b: number)   # hint in function — not yet enforced
  -> a + b
```

---

## Assert

```ezra
x is 42
assert x > 0, "x must be positive"
assert x is 42
```

If the condition is falsy, a runtime error is thrown with the message.
`assert` with no message uses `"assertion failed"`.

---

## Advanced Expressions

### Ternary

```ezra
label is score >= 60 ? "pass" : "fail"
```

> **Python equivalent:** `"pass" if score >= 60 else "fail"`
> **JavaScript equivalent:** `score >= 60 ? "pass" : "fail"`

### Optional chaining

```ezra
user is {profile: {name: "Rana"}}
say user?.profile?.name    # Rana
say user?.missing?.field   # nothing (does not throw)
```

### Spread

```ezra
a is [1, 2, 3]
b is [0, ...a, 4]   # [0, 1, 2, 3, 4]
```

### `type_of` / `size_of`

```ezra
say type_of(42)         # number
say type_of([1, 2])     # list
say size_of([1, 2, 3])  # 3
say size_of("hello")    # 5
```

---

## Grammar Extensions

```
try_stmt     ::= "try" BLOCK
                 ["catch" [identifier] BLOCK]
                 ["finally" BLOCK]

throw_stmt   ::= "throw" expression

use_stmt     ::= "use" text_literal ["as" identifier]
              | "from" text_literal "use" identifier ("," identifier)*

export_stmt  ::= "export" identifier

struct_stmt  ::= "struct" identifier BLOCK  # fields one per indented line

enum_stmt    ::= "enum" identifier BLOCK    # variants one per indented line

impl_stmt    ::= "impl" identifier BLOCK    # function definitions

assert_stmt  ::= "assert" expression ["," expression]

ternary_expr ::= or_expr "?" or_expr ":" or_expr
```
