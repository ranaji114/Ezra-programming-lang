# Ezra Tutorial

This tutorial introduces Ezra step by step, from your first `say` statement to a working calculator.

## 1. Install Ezra

Follow the [Getting Started guide](getting-started.md) to install Ezra, then verify:

```bash
ezra --version
```

Expected: `ezra 1.0.0`

You can also use Cargo during development:

```bash
cargo run --bin ezra -- --version
```

## 2. Hello, Ezra

Create `hello.ez`:

```ezra
say "Hello, Ezra!"
```

Run it:

```bash
ezra run hello.ez
```

`say` prints the value followed by a newline. Text values use double quotes.

## 3. Variables

Ezra uses `is` for assignment:

```ezra
name is "Ankur"
age  is 20
score is 7 + 3 * 2   # 13 — * before +

say name
say age
say score
```

`is` creates or updates a variable. Assigning a new name creates it; reassigning updates it.

> Python: `name = "Ankur"` · JavaScript: `let name = "Ankur"`

## 4. Text Interpolation

Put expressions inside `{ }` in a text literal:

```ezra
name is "Ezra"
version is "1.0.0"
say "Welcome to {name} v{version}!"
say "2 + 2 = {2 + 2}"
say "Upper: {name.upper()}"
```

Output:
```
Welcome to Ezra v1.0.0!
2 + 2 = 4
Upper: EZRA
```

## 5. Conditions

```ezra
age is 20

check if age >= 18
  say "Adult"
otherwise if age >= 13
  say "Teenager"
otherwise
  say "Child"
```

> Python: `if age >= 18:` · JavaScript: `if (age >= 18) {`

Indentation defines blocks. Use spaces, not tabs. Two spaces per level is recommended.

## 6. Loops

**Repeat N times:**

```ezra
repeat 3 times
  say "tick"
```

**Iterate a list:**

```ezra
names is ["Alice", "Bob", "Carol"]
for each name in names
  say "Hello {name}"
```

**While loop:**

```ezra
i is 0
while i < 5
  i += 1
  say i
```

Use `break` to exit a loop early, `next` to skip to the next iteration.

## 7. Functions

```ezra
give add(a, b)
  -> a + b        # arrow shorthand for return

give greet(name)
  say "Hello {name.upper()}!"
  return "done"

say add(3, 4)     # 7
greet("rana")     # Hello RANA!
```

`-> expression` is shorthand for `return expression`. Functions that reach the end without a return produce `nothing`.

## 8. Lists and Objects

```ezra
# Lists
numbers is [10, 20, 30]
say numbers[0]         # 10
say numbers.length     # 3

numbers is numbers.push(40)
say numbers            # [10, 20, 30, 40]

# Objects
user is { name: "Rana", age: 25 }
say user.name          # Rana
say user["age"]        # 25
```

Note: list methods return a **new list** — they do not modify in place.

```ezra
# Higher-order functions
nums is [1, 2, 3, 4, 5]
say nums.filter(n -> n % 2 is 0)   # [2, 4]
say nums.map(n -> n * 2)           # [2, 4, 6, 8, 10]
say nums.reduce((a, n) -> a + n, 0) # 15
```

## 9. Input and Output

```ezra
name is input "Name: "
age  is input_number "Age: "
say "Hello {name}, next year you will be {age + 1}."
```

Other output statements:

```ezra
say "newline after"
write "no newline"
warn "warning to stderr"
fail "error-style message to stderr"
debug "diagnostic info to stderr"
```

## 10. Error Handling

```ezra
try
  result is 10 / 0
  say "This never prints"
catch err
  say "Caught: {err}"
finally
  say "Always runs"

# Manual throw
try
  throw "something went wrong"
catch msg
  say "Got: {msg}"
```

## 11. A Complete Calculator

```ezra
say "Ezra Calculator"
a  is input_number "First number: "
op is input "Operation (+ - * /): "
b  is input_number "Second number: "

check if op is "+"
  say "{a} + {b} = {a + b}"
otherwise if op is "-"
  say "{a} - {b} = {a - b}"
otherwise if op is "*"
  say "{a} * {b} = {a * b}"
otherwise if op is "/"
  check if b is 0
    say "Cannot divide by zero"
  otherwise
    say "{a} / {b} = {a / b}"
otherwise
  say "Unknown operation: {op}"
```

Run it:

```bash
ezra run calculator.ez
```

## Next Steps

- Read the [Language Reference](language-reference.md) for complete syntax
- Browse the [Standard Library](stdlib/index.md) for all built-in functions
- Look at the [CLI Reference](cli-reference.md) for tooling commands
- Check [Examples](examples/index.md) for more code patterns
