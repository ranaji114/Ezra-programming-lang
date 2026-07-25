# Syntax: Functions — Defining, Calling, Closures

## Defining Functions

Use `give` to define a named function:

```ezra
give add(a, b)
  -> a + b
```

`->` is shorthand for `return`. The longer form:

```ezra
give greet(name)
  message is "Hello, {name}!"
  return message
```

> **Python equivalent:** `def add(a, b): return a + b`
> **JavaScript equivalent:** `function add(a, b) { return a + b; }`

---

## Calling Functions

```ezra
result is add(3, 4)     # 7
say greet("Rana")       # Hello, Rana!
```

The number of arguments **must exactly match** the number of parameters.
A mismatch is a runtime error:

```ezra
add(1)       # error: function `add` expected 2 argument(s), got 1
add(1, 2, 3) # error: function `add` expected 2 argument(s), got 3
```

---

## Return Values

A function that reaches the end without a `return` or `->` produces `nothing`:

```ezra
give side_effect(x)
  say "x is {x}"

result is side_effect(5)
say result   # nothing
```

---

## Arrow Shorthand

`-> expression` is equivalent to `return expression`:

```ezra
give square(n)
  -> n * n

give max_of(a, b)
  -> a > b ? a : b   # ternary expression
```

---

## Arrow Functions (Lambdas)

Single-expression anonymous functions use the `->` operator:

```ezra
# Single parameter
double is n -> n * 2
say double(5)   # 10

# Multiple parameters (use parentheses)
add is (a, b) -> a + b
say add(3, 4)   # 7

# Inline in a call
result is [1, 2, 3, 4, 5].filter(n -> n % 2 is 0)
say result   # [2, 4]
```

> **Python equivalent:** `lambda n: n * 2`
> **JavaScript equivalent:** `n => n * 2`

### Arrow functions in higher-order calls

```ezra
nums is [1, 2, 3, 4, 5]

evens is nums.filter(n -> n % 2 is 0)          # [2, 4]
doubled is nums.map(n -> n * 2)                # [2, 4, 6, 8, 10]
total is nums.reduce((acc, n) -> acc + n, 0)   # 15
sorted is nums.sort()                          # [1, 2, 3, 4, 5]
```

---

## Scope Rules

Functions have their own scope. They can **read** variables from outer scopes
but do not modify them:

```ezra
base is 10

give add_base(x)
  -> x + base   # reads `base` from outer scope

say add_base(5)   # 15
```

Variables defined inside a function are local to that call:

```ezra
give counter()
  count is 0
  count += 1
  -> count

say counter()   # 1
say counter()   # 1  (count is reset each call)
```

---

## Nested Functions

Functions can be defined inside other functions:

```ezra
give make_adder(x)
  give inner(n)
    -> x + n
  -> inner

add5 is make_adder(5)
say add5(3)    # 8
say add5(10)   # 15
```

---

## Recursion

Ezra supports recursion. There is no explicit recursion limit beyond the
system stack:

```ezra
give factorial(n)
  check if n <= 1
    -> 1
  -> n * factorial(n - 1)

say factorial(10)   # 3628800
```

```ezra
give fibonacci(n)
  check if n <= 1
    -> n
  -> fibonacci(n - 1) + fibonacci(n - 2)

say fibonacci(20)   # 6765
```

> **Performance note:** Recursive fibonacci is ~46× slower than Python for
> `fib(28)` because Ezra does not yet implement tail-call optimization.
> Use the iterative version for large inputs.

---

## Pipe Operator

Chain function calls left to right with `|>`:

```ezra
result is [3, 1, 4, 1, 5] |> sort() |> reverse()
say result   # [5, 4, 3, 1, 1]
```

The piped value is prepended as the first argument:

```ezra
# these are equivalent:
result is double(add(3, 4))
result is add(3, 4) |> double()
```

---

## Grammar

```
function_def ::= "give" identifier "(" params ")" BLOCK

params       ::= [identifier ("," identifier)*]

return_stmt  ::= "return" expression
              | "->" expression

arrow_fn     ::= identifier "->" expression
              | "(" params ")" "->" expression

call_expr    ::= expression "(" args ")"

args         ::= [expression ("," expression)*]
```
