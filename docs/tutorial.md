# Flux Tutorial

This tutorial introduces Flux from the first line of code to a small command
line calculator.

## 1. Install Flux

Install a release binary, then confirm that the command is available:

```bash
flux --version
```

You can also run Flux from the repository with Cargo:

```bash
cargo run -- --version
```

## 2. Hello, Flux

Create a file named `hello.flux`:

```flux
say "Hello, Flux!"
```

Run it:

```bash
flux run hello.flux
```

`say` evaluates its expression and prints the result followed by a newline.
Flux text values use double quotes.

## 3. Variables

Flux uses `is` for assignment:

```flux
name is "Ankur"
age is 20
score is 7 + 3 * 2

say name
say age
say score
```

There is no separate `let` or `const` declaration in the current language.
Assigning to a name that already exists updates it; assigning a new name
creates it.

## 4. Text Interpolation

Put an expression inside braces in a text literal:

```flux
name is "Flux"
version is 1
say "Welcome to {name} {version}!"
```

Interpolation can contain function calls, indexing, and property access:

```flux
user is { name: "Rana", age: 25 }
say "{user.name} is {user.age} years old"
say "{user.name.upper()}"
```

## 5. Conditions

Use `check if`, followed by an indented body. `otherwise if` and `otherwise`
are optional:

```flux
age is 20

check if age >= 18
  say "Adult"
otherwise if age >= 13
  say "Teenager"
otherwise
  say "Child"
```

Flux uses indentation to define blocks. Keep indentation consistent and use
spaces instead of tabs.

## 6. Loops

Repeat a block a fixed number of times:

```flux
count is 0
repeat 3 times
  count += 1
  say count
```

Iterate over a list with `for each`:

```flux
names is ["Rana", "Aman", "Priya"]

for each name in names
  say "Hello {name}"
```

Use `break` to leave the loop and `next` to skip to the next iteration.

## 7. Functions

Define a named function with `give`:

```flux
give add(a, b)
  -> a + b

result is add(2, 3)
say result
```

`-> expression` is shorthand for `return expression`. A function that reaches
the end without returning a value produces `nothing`.

Functions can read values from outer scopes, but parameters and variables
created inside a function are local to its call.

## 8. Lists and Objects

Lists use square brackets. Objects use braces with `key: value` fields:

```flux
numbers is [10, 20, 30]
person is { name: "Rana", age: 25 }

say numbers[0]
say person.name
say person["age"]
```

Missing list indexes, text indexes, and object keys return `nothing`.

## 9. Input and Output

Use `input` for text and `input_number` for numeric input:

```flux
name is input "Name: "
age is input_number "Age: "
say "Hello {name}; next year you will be {age + 1}."
```

Other output statements are available:

```flux
say "newline"
write "no newline"
warn "warning on stderr"
fail "error-style message on stderr"
debug "diagnostic message on stderr"
```

## 10. A Complete Calculator

```flux
say "Flux Calculator"
first is input_number "First number: "
operation is input "Operation (+, -, *, /): "
second is input_number "Second number: "

check if operation is "+"
  say "Result: {first + second}"
otherwise if operation is "-"
  say "Result: {first - second}"
otherwise if operation is "*"
  say "Result: {first * second}"
otherwise if operation is "/"
  check if second is 0
    say "Cannot divide by zero."
  otherwise
    say "Result: {first / second}"
otherwise
  say "Unknown operation."
```

Run it with:

```bash
flux run calculator.flux
```

## Next Steps

- Read the [Language Reference](language-reference.md) for exact syntax.
- Read the [CLI Reference](cli-reference.md) for project and developer commands.
- Read [Tooling and VS Code](tooling.md) to configure the editor.
