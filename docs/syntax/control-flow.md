# Syntax: Control Flow — Conditions, Loops, Match

## Conditions

### `check if`

```ezra
check if age >= 18
  say "Adult"
```

> **Python:** `if age >= 18:`
> **JavaScript:** `if (age >= 18) {`

### `otherwise if` / `otherwise`

```ezra
check if score >= 90
  say "A"
otherwise if score >= 75
  say "B"
otherwise if score >= 60
  say "C"
otherwise
  say "F"
```

Chains can be arbitrarily long. Each branch executes at most one block.

**Truthiness in conditions:** the condition does not have to be a boolean.
Any truthy value takes the `check if` branch.

```ezra
name is ""
check if name
  say "has a name"
otherwise
  say "no name"   # ← runs, empty string is falsy
```

> **Pitfall:** `check if x = 5` is a syntax error — single `=` is not valid.
> Use `check if x is 5`.

---

## Loops

### `repeat N times`

```ezra
repeat 5 times
  say "tick"
```

The count is evaluated once before the loop starts. It must be a
non-negative whole number:

```ezra
count is 3
repeat count times
  say "loop"

# Error cases:
repeat -1 times   # runtime error: repeat count must be a non-negative integer
repeat 1.5 times  # runtime error: repeat count must be a non-negative integer
```

> **Python equivalent:** `for _ in range(5):`

### `for each`

```ezra
names is ["Rana", "Aman", "Priya"]
for each name in names
  say "Hello {name}"
```

The iteration variable is scoped to each iteration.

```ezra
for each item in [1, 2, 3]
  say item
say item   # runtime error: undefined variable `item`
```

> **Python equivalent:** `for name in names:`
> **JavaScript equivalent:** `for (const name of names)`

### `while`

```ezra
i is 0
while i < 10
  say i
  i += 1
```

> **Python/JavaScript equivalent:** `while i < 10:`

### `until`

`until` is a do-while loop — the body runs **at least once**, then checks
whether to stop:

```ezra
i is 0
until i >= 5
  say i
  i += 1
# Prints 0, 1, 2, 3, 4
```

> **Pitfall:** Unlike `while`, `until` always executes the body at least once
> even if the condition is already true at the start.

### `loop`

`loop` runs forever until a `break`:

```ezra
i is 0
loop
  i += 1
  check if i is 5
    break
say i   # 5
```

### `break` and `next`

`break` exits the nearest enclosing loop immediately.
`next` skips the rest of the current iteration and continues with the next.

```ezra
for each n in [1, 2, 3, 4, 5]
  check if n is 3
    break   # stop entirely
  say n

# Prints: 1, 2
```

```ezra
evens is []
for each n in [1, 2, 3, 4, 5]
  check if n % 2 is 1
    next    # skip odd numbers
  evens is evens + [n]

say evens   # [2, 4]
```

Using `break` or `next` outside a loop is a runtime error.

> **Python equivalent:** `break` / `continue`
> **JavaScript equivalent:** `break` / `continue`

---

## Pattern Matching (`pick`)

```ezra
day is "monday"
pick day
  when "monday"
    say "Start of work week"
  when "friday"
    say "Almost weekend!"
  when "saturday"
    say "Weekend!"
  otherwise
    say "Regular day"
```

`pick` evaluates the expression once and compares it for equality against each
`when` clause. The first matching clause runs. `otherwise` is the default
branch. If no clause matches and there is no `otherwise`, nothing happens.

> **Python equivalent:** `match day:` (Python 3.10+)
> **JavaScript equivalent:** `switch (day)`

```ezra
# Match on numbers
score is 85
pick score
  when 100
    say "Perfect!"
  when 90
    say "Excellent"
  otherwise
    say "Keep going: {score}"
```

> **Pitfall:** `pick` uses equality matching, not pattern destructuring.
> You cannot match ranges like `when > 90` — use `check if` for that.

---

## Grammar

```
check_stmt  ::= "check if" expr BLOCK
                ("otherwise if" expr BLOCK)*
                ["otherwise" BLOCK]

repeat_stmt ::= "repeat" expr "times" BLOCK

for_stmt    ::= "for each" identifier "in" expr BLOCK

while_stmt  ::= "while" expr BLOCK

until_stmt  ::= "until" expr BLOCK

loop_stmt   ::= "loop" BLOCK

pick_stmt   ::= "pick" expr
                ("when" expr BLOCK)+
                ["otherwise" BLOCK]

BLOCK       ::= indented sequence of statements
```
