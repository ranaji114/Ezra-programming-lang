# Examples

These annotated examples show common Ezra patterns. All files are in the
`examples/` directory and can be run with `ezra run examples/<file>.ez`.

---

## Hello World

```ezra
say "Hello from Ezra!"
```

`say` prints the value followed by a newline. This is the minimal Ezra program.

---

## Variables and Interpolation

```ezra
name is "Rana"
age is 20
score is 7 + 3 * 2   # operator precedence: * before +

say "Hello {name}"
say "Age: {age}"
say "Score: {score}"   # 13
```

`is` creates or updates a variable. Curly braces inside a text literal
evaluate an expression. Compare with Python:
```python
name = "Rana"
print(f"Hello {name}")
```

---

## Conditions

```ezra
check if age >= 18
  say "Adult"
otherwise if age >= 13
  say "Teenager"
otherwise
  say "Child"
```

Equivalent Python:
```python
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teenager")
else:
    print("Child")
```

---

## Loops

```ezra
# Counted loop
repeat 5 times
  say "tick"

# List iteration
names is ["Rana", "Aman", "Priya"]
for each name in names
  say "Hello {name}"

# While loop
i is 0
while i < 10
  i += 1

# Until loop (do-while: body runs at least once)
j is 0
until j >= 5
  j += 1
```

---

## Functions

```ezra
give add(a, b)
  -> a + b        # arrow shorthand for return

give greet(name)
  say "Hello {name.upper()}"
  return "done"

result is add(2, 3)
say "2 + 3 = {result}"
```

Arrow functions (lambdas):
```ezra
double is x -> x * 2
say double(5)   # 10

add is (a, b) -> a + b
say add(3, 4)   # 7
```

---

## Error Handling

```ezra
try
  result is 10 / 0
catch error
  say "Caught: {error}"
finally
  say "This always runs"

# Manual throw
try
  throw "something went wrong"
catch err
  say "Got: {err}"
```

Compare with Python:
```python
try:
    result = 10 / 0
except Exception as e:
    print(f"Caught: {e}")
finally:
    print("This always runs")
```

---

## Pattern Matching

```ezra
day is "monday"
pick day
  when "monday"
    say "Start of work week"
  when "friday"
    say "Almost weekend!"
  when "saturday"
    say "Weekend!"
  when "sunday"
    say "Weekend!"
  otherwise
    say "Regular day"
```

Compare with JavaScript:
```javascript
switch (day) {
  case "monday": console.log("Start of work week"); break;
  case "friday": console.log("Almost weekend!"); break;
  default: console.log("Regular day");
}
```

---

## Lists and Objects

```ezra
# Lists
numbers is [10, 20, 30]
say numbers[0]          # 10
say numbers.length      # 3
say numbers.sort()      # [10, 20, 30]

# Objects
person is {name: "Alice", age: 30, city: "NYC"}
say person.name         # Alice
say person["age"]       # 30
say person.keys()       # [age, city, name]

# List of objects
users is [
  {name: "Rana", age: 25},
  {name: "Aman", age: 16}
]
for each user in users
  check if user.age >= 18
    say "{user.name} is adult"
  otherwise
    say "{user.name} is minor"
```

---

## File I/O and JSON

```ezra
# Write and read a file
write_file("data.txt", "Hello Ezra!")
content is read_file("data.txt")
say content

# JSON round-trip
data is {name: "Ezra", version: 1}
json is stringify_json(data)
say json                          # {"name":"Ezra","version":1}

parsed is parse_json(json)
say parsed.name                   # Ezra
```

---

## Fibonacci (Recursion)

```ezra
give fib(n)
  check if n <= 1
    -> n
  -> fib(n - 1) + fib(n - 2)

for each i in range(10)
  say "fib({i}) = {fib(i)}"
```

---

## Fibonacci (Iterative — faster for large n)

```ezra
give fib_iter(n)
  check if n <= 1
    -> n
  a is 0
  b is 1
  i is 2
  while i <= n
    c is a + b
    a is b
    b is c
    i += 1
  -> b

say fib_iter(30)   # 832040
```

---

## Higher-Order Functions

```ezra
numbers is [1, 2, 3, 4, 5, 6]

evens is numbers.filter(n -> n % 2 is 0)
say evens                          # [2, 4, 6]

doubled is evens.map(n -> n * 2)
say doubled                        # [4, 8, 12]

total is doubled.reduce((acc, n) -> acc + n, 0)
say total                          # 24
```

---

## Modules

```ezra
use "std/math" as math
say math.pi                        # 3.141592653589793
say math.sin(math.pi / 2)         # 1

from "std/json" use parse, stringify
data is parse("[1, 2, 3]")
say data[0]                        # 1
```

---

## Pipe Operator

```ezra
result is [3, 1, 4, 1, 5] |> sort() |> reverse()
say result    # [5, 4, 3, 1, 1]

# Equivalent to:
# result is reverse(sort([3, 1, 4, 1, 5]))
```

---

## Common Error Messages

| Error | Cause | Fix |
|---|---|---|
| `undefined variable \`name\`` | Using a variable before assigning it | Assign a value first: `name is "..."` |
| `divide by zero` | Division where denominator is 0 | Check before dividing: `check if b is not 0` |
| `repeat count must be a non-negative integer` | Fractional or negative repeat count | Use a whole number ≥ 0 |
| `list index must be non-negative` | Negative list index | Use `list[0]` not `list[-1]` |
| `text index must be integer` | Fractional text index | Use whole number index |
| `cannot assign to constant \`X\`` | Assigning to a `const` | Use `let` if you need mutability |
| `function \`add\` expected 2 argument(s), got 1` | Wrong number of arguments | Check the function definition |
| `tabs are not supported` | Tab character used for indentation | Use spaces (2 per level recommended) |
