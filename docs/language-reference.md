# Flux Language Reference

This reference documents the behavior implemented by Flux `v0.1.0-alpha`.

## Source Files and Indentation

Flux source files normally use the `.flux` extension and are UTF-8 text. A
UTF-8 byte-order mark at the start of a file is accepted.

Flux uses indentation to define blocks:

~~~flux
check if ready
  say "The block is indented"
~~~

Blank lines are ignored. Use spaces instead of tabs. Two spaces per level is
the recommended style, although the parser accepts any larger child indent.

## Comments

Use `#` or `//` for a line comment:

~~~flux
# A full-line comment
say "Hello" # An inline comment
say "World" // Another comment
~~~

Comment markers inside a double-quoted text literal are treated as text.
Block comments are not part of the current language.

## Identifiers and Keywords

An identifier starts with an ASCII letter or `_`, followed by ASCII letters,
digits, or `_`:

~~~flux
user_name is "Rana"
item2 is 10
~~~

Expression keywords are:

| Word | Meaning |
| --- | --- |
| `yes` | Boolean true |
| `no` | Boolean false |
| `nothing` | Empty value |
| `is` | Assignment or equality |
| `not` | Logical negation or part of `is not` |
| `and` | Logical AND |
| `or` | Logical OR |

Statement words include `say`, `write`, `print`, `warn`, `fail`, `error`,
`debug`, `clear`, `exit`, `check`, `otherwise`, `repeat`, `for`, `each`,
`break`, `next`, `give`, and `return`.

## Values and Types

| Type | Examples | `type_of` result |
| --- | --- | --- |
| Number | `0`, `-4`, `3.14` | `"number"` |
| Text | `"hello"` | `"text"` |
| Boolean | `yes`, `no` | `"bool"` |
| Nothing | `nothing` | `"nothing"` |
| List | `[1, 2, 3]` | `"list"` |
| Object | `{ name: "Rana" }` | `"object"` |
| Function | a named function value | `"function"` |

Numbers are floating-point values. Whole numbers are displayed without a
decimal suffix, so `3.0` displays as `3`.

`nothing` is returned for missing list indexes, missing text indexes, missing
object keys, and functions that finish without returning a value.

## Text

Text literals use double quotes:

~~~flux
message is "Hello, Flux"
~~~

Supported escapes are `\\n` for newline, `\\t` for tab, `\\"` for a double
quote, and `\\\\` for a backslash. Unknown escapes keep the escaped character.

### Interpolation

Expressions can be evaluated inside braces:

~~~flux
name is "Flux"
count is 3
say "{name} has {count} examples"
say "Uppercase: {name.upper()}"
~~~

Interpolation uses normal Flux expression rules. An unterminated interpolation
is a runtime error.

## Numbers

Numbers may be integers or decimal numbers:

~~~flux
whole is 42
decimal is 3.14
negative is -7
~~~

Scientific notation, hexadecimal literals, binary literals, and octal
literals are not supported by the current lexer.

## Lists

Create a list with square brackets. Values may have different types:

~~~flux
values is [1, "two", yes, nothing]
numbers is [10, 20, 30]
say numbers[0]
say numbers[99] # nothing
~~~

Indexes start at zero and must be non-negative whole numbers. A negative or
fractional index is a runtime error. `list1 + list2` returns a new combined
list.

## Objects

Create an object with comma-separated `key: value` fields:

~~~flux
person is {
  name: "Rana",
  age: 25
}
~~~

Keys can be identifiers or text literals. Access fields with dot notation or a
text key:

~~~flux
say person.name
say person["age"]
say person.missing # nothing
~~~

Object display order is stable and sorted by key.

## Truthiness

The following values are false in a condition:

- `no`
- `nothing`
- the number `0`
- empty text
- an empty list
- an empty object

Non-zero numbers, non-empty text, non-empty collections, and functions are
true.

## Variables and Assignment

Use `is` to create or update a variable:

~~~flux
total is 10
total is total + 5
~~~

Compound assignment is available:

~~~flux
total += 2
total -= 1
total *= 3
total /= 2
~~~

Compound assignment updates the nearest existing variable. An undefined name
is a runtime error. Division by zero is a runtime error.

There is no separate `let` or `const` declaration in this release. A single
`=` is not valid syntax; use `is`.

## Output Statements

`say` prints a value followed by a newline:

~~~flux
say "Hello"
say 2 + 3
~~~

`write` prints without a newline. `print` is an alias for `write`:

~~~flux
write "Loading... "
print "done"
~~~

`warn` writes `warning: ...` to standard error. `fail` and `error` write
`error: ...` to standard error. They do not automatically stop the program.
`debug` writes `debug: ...` to standard error:

~~~flux
warn "This is a warning"
fail "This is an error-style message"
debug "Diagnostic information"
~~~

`clear` sends an ANSI terminal-clear sequence. Terminal support determines
how it appears:

~~~flux
clear
~~~

## Input

`input` reads text from standard input. `input_number` reads text and converts
it to a number:

~~~flux
name is input "Name: "
age is input_number "Age: "
say "Hello {name}; next year: {age + 1}"
~~~

Invalid numeric input is a runtime error.

## Conditions

Use `check if` with an indented body. `otherwise if` and `otherwise` are
optional:

~~~flux
check if score >= 90
  say "A"
otherwise if score >= 75
  say "B"
otherwise
  say "Try again"
~~~

Conditions use truthiness, so the condition does not have to be a Boolean.

## Loops

### `repeat`

`repeat` evaluates its count once and runs the body that many times:

~~~flux
repeat 5 times
  say "tick"
~~~

The count must be a non-negative whole number.

### `for each`

`for each` requires a list and binds one item per iteration:

~~~flux
items is ["a", "b", "c"]
for each item in items
  say item
~~~

`break` leaves the nearest loop. `next` skips the rest of the current
iteration. Using either outside a loop is a runtime error.

## Functions

Define a named function with `give`:

~~~flux
give multiply(a, b)
  return a * b

result is multiply(4, 5)
~~~

`-> expression` is shorthand for `return expression`:

~~~flux
give square(value)
  -> value * value
~~~

The number of arguments must exactly match the number of parameters. A function
that reaches the end without returning produces `nothing`. `return` outside a
function is a runtime error.

## Operators

### Arithmetic

| Operator | Meaning |
| --- | --- |
| `+` | Number addition, list concatenation, or text concatenation |
| `-` | Number subtraction |
| `*` | Number multiplication |
| `/` | Number division |
| `%` | Number remainder |
| unary `-` | Number negation |

For `+`, two numbers produce a number, two lists produce a new combined list,
and all other combinations produce concatenated text.

### Comparison and Equality

| Operator | Meaning |
| --- | --- |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `<` | Less than |
| `<=` | Less than or equal |
| `is` | Equality in an expression |
| `is not` | Inequality in an expression |
| `==` | Equality |
| `!=` | Inequality |

Ordering comparisons require two numbers. Equality works for same-type values,
including lists, objects, text, numbers, booleans, and `nothing`.

### Logical Operators

| Operator | Meaning |
| --- | --- |
| `not value` | Logical negation |
| `left and right` | Short-circuit AND |
| `left or right` | Short-circuit OR |

Logical operators return a Boolean. `and` and `or` do not evaluate the right
side when the left side already determines the result.

## Operator Precedence

From highest to lowest:

1. Calls: `name(args)`
2. Indexing and properties: `items[0]`, `user.name`
3. Unary `not` and unary `-`
4. `*`, `/`, `%`
5. `+`, `-`
6. `>`, `>=`, `<`, `<=`
7. `is`, `is not`, `==`, `!=`
8. `and`
9. `or`

Use parentheses for explicit grouping:

~~~flux
value is (2 + 3) * 4
~~~

## Indexing and Properties

Lists and text support numeric indexing and `.length`:

~~~flux
word is "Flux"
letters is ["F", "l", "u", "x"]
say word[0]
say word.length
say letters.length
~~~

Text indexing is by character, not byte. Objects support dot properties and
text-key indexing:

~~~flux
config is { mode: "dev", retries: 3 }
say config.mode
say config["retries"]
~~~

Missing properties return `nothing`.

## Built-in Functions

| Function | Arguments | Result |
| --- | --- | --- |
| `len(value)` | one text, list, or object | Character, item, or field count |
| `type_of(value)` | one value | Text type name |
| `text(value)` | one value | Text representation |
| `number(value)` | one value | Numeric conversion |

Examples:

~~~flux
say len("Flux")
say len([1, 2, 3])
say type_of(yes)
say text(42)
say number("3.5")
~~~

`len` rejects numbers, booleans, functions, and `nothing`. `number` raises a
runtime error when conversion fails.

## Methods

### Text Methods

| Method | Arguments | Result |
| --- | --- | --- |
| `.upper()` | none | Uppercase text |
| `.lower()` | none | Lowercase text |
| `.trim()` | none | Text without surrounding whitespace |
| `.contains(value)` | one value | Boolean substring check |

### List Methods

| Method | Arguments | Result |
| --- | --- | --- |
| `.push(value)` | one value | New list with a value appended |
| `.take(count)` | non-negative whole number | First values in a new list |
| `.drop(count)` | non-negative whole number | Remaining values in a new list |

~~~flux
items is [1, 2, 3]
items is items.push(4)
say items.take(2)
say items.drop(1)
~~~

Methods return new values; they do not mutate a list in place.

## Scope Rules

The top-level program has a global scope. Conditions, loops, and function
bodies create nested scopes:

- reads search from the innermost scope outward
- assignment updates the nearest existing variable
- assignment to a new name creates it in the current scope
- a `for each` item is local to its iteration
- function parameters and function-local names end with the call

## Errors

Syntax errors report a line and column:

~~~text
error at 1:8: expected expression
~~~

Runtime errors use the `error:` prefix:

~~~text
error: divide by zero
~~~

Common errors include invalid indentation, undefined variables, invalid input
numbers, invalid indexes, wrong function argument counts, wrong value types,
division by zero, and loop control outside a loop.

## Current Limitations

The alpha interpreter does not currently provide modules, packages, classes,
exceptions, async actors, file/network APIs, native compilation, built-in
assertions, or a production debugger. These are future design areas, not
currently valid Flux syntax.

