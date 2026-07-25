# Standard Library: Math

All math functions are available globally without any import.
They are also available via `use "std/math" as math`.

## Constants

| Name | Value |
|---|---|
| `math.pi` | `3.141592653589793` |
| `math.e` | `2.718281828459045` |

```ezra
use "std/math" as math
say math.pi   # 3.141592653589793
```

---

## Basic Math

### `abs(n) -> number`
Absolute value.
```ezra
say abs(-5)    # 5
say abs(3.14)  # 3.14
```

### `sqrt(n) -> number`
Square root. Returns `nan` for negative inputs.
```ezra
say sqrt(16)   # 4
say sqrt(2)    # 1.4142135623730951
```

### `pow(base, exp) -> number`
Exponentiation. Equivalent to `base ** exp`.
```ezra
say pow(2, 10)   # 1024
say pow(9, 0.5)  # 3.0
```

### `floor(n) -> number`
Round toward negative infinity.
```ezra
say floor(3.7)    # 3
say floor(-3.2)   # -4
```

### `ceil(n) -> number`
Round toward positive infinity.
```ezra
say ceil(3.2)    # 4
say ceil(-3.7)   # -3
```

### `round(n) -> number`
Round to nearest integer (half rounds away from zero).
```ezra
say round(3.5)   # 4
say round(3.4)   # 3
```

### `min(a, b) -> number`
```ezra
say min(10, 5)   # 5
```

### `max(a, b) -> number`
```ezra
say max(10, 5)   # 10
```

---

## Trigonometry

All trig functions take **radians**.

### `sin(n) -> number`
```ezra
say sin(0)      # 0
say sin(math.pi / 2)  # 1.0
```

### `cos(n) -> number`
```ezra
say cos(0)   # 1
```

### `tan(n) -> number`
```ezra
say tan(0)   # 0
```

---

## Logarithms and Exponential

### `log(n) -> number`
Natural logarithm (base *e*). Also aliased as `ln(n)`.
```ezra
say log(math.e)   # 1.0
```

### `log10(n) -> number`
Base-10 logarithm.
```ezra
say log10(100)   # 2.0
```

### `exp(n) -> number`
*e* raised to the power *n*.
```ezra
say exp(1)   # 2.718281828459045
```

---

## Random Numbers

### `random() -> number`
Returns a random float in `[0, 1)`.
```ezra
say random()   # e.g. 0.7342891...
```

### `random_int(min, max) -> number`
Returns a random integer in `[min, max]` (inclusive).
```ezra
die is random_int(1, 6)
say "Rolled: {die}"
```

---

## Number Utilities

### `range(n) -> list`
### `range(start, end) -> list`
### `range(start, end, step) -> list`

```ezra
say range(5)         # [0, 1, 2, 3, 4]
say range(2, 6)      # [2, 3, 4, 5]
say range(0, 10, 2)  # [0, 2, 4, 6, 8]
say range(5, 0, -1)  # [5, 4, 3, 2, 1]
```

---

## Comparison with Python / JavaScript

| Ezra | Python | JavaScript |
|---|---|---|
| `abs(-5)` | `abs(-5)` | `Math.abs(-5)` |
| `sqrt(16)` | `math.sqrt(16)` | `Math.sqrt(16)` |
| `pow(2, 8)` | `2 ** 8` | `Math.pow(2, 8)` |
| `floor(3.7)` | `math.floor(3.7)` | `Math.floor(3.7)` |
| `ceil(3.2)` | `math.ceil(3.2)` | `Math.ceil(3.2)` |
| `round(3.5)` | `round(3.5)` | `Math.round(3.5)` |
| `random()` | `random.random()` | `Math.random()` |
| `range(5)` | `list(range(5))` | `Array.from({length:5},(_,i)=>i)` |
