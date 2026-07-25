# Standard Library: Collections — Lists and Objects

## Lists

Create a list with square brackets:

```ezra
nums is [10, 20, 30]
mixed is [1, "two", yes, nothing]
empty is []
```

### Indexing

Zero-based. Returns `nothing` for out-of-bounds.

```ezra
nums is [10, 20, 30]
say nums[0]    # 10
say nums[2]    # 30
say nums[99]   # nothing

# Errors:
say nums[-1]    # error: list index must be non-negative
say nums[1.5]   # error: list index must be non-negative integer
```

### Concatenation

```ezra
a is [1, 2]
b is [3, 4]
c is a + b    # [1, 2, 3, 4]
```

---

## List Methods

All list methods return a **new** list — they do not mutate the original.

### Size

| Method | Returns |
|---|---|
| `.length` | Number of items |
| `len(list)` | Number of items |
| `.is_empty()` | `yes` / `no` |

```ezra
nums is [1, 2, 3]
say nums.length    # 3
say len(nums)      # 3
say nums.is_empty()  # no
```

### Access

| Method | Returns |
|---|---|
| `.first()` | First item or `nothing` |
| `.last()` | Last item or `nothing` |
| `list[i]` | Item at index `i` |

### Modification (returns new list)

| Method | Returns |
|---|---|
| `.push(v)` | New list with `v` appended |
| `.pop()` | New list without last item |
| `.take(n)` | First `n` items |
| `.drop(n)` | Items after first `n` |

```ezra
nums is [1, 2, 3]
nums is nums.push(4)   # [1, 2, 3, 4]
nums is nums.pop()     # [1, 2, 3]
say nums.take(2)       # [1, 2]
say nums.drop(1)       # [2, 3]
```

### Ordering

| Method | Returns |
|---|---|
| `.sort()` | Sorted copy (numeric for all-number lists, else lexicographic) |
| `.reverse()` | Reversed copy |

```ezra
say [3, 1, 4, 1, 5].sort()     # [1, 1, 3, 4, 5]  ← numeric sort
say ["c", "a", "b"].sort()     # [a, b, c]  ← lexicographic
say [1, 2, 3].reverse()        # [3, 2, 1]
```

### Search

| Method | Returns |
|---|---|
| `.contains(v)` | `yes` / `no` |

```ezra
say [1, 2, 3].contains(2)   # yes
say [1, 2, 3].contains(9)   # no
```

### Aggregates

| Method | Returns |
|---|---|
| `.sum()` | Sum of numeric items |
| `.avg()` | Average of numeric items |
| `.min()` | Smallest numeric item |
| `.max()` | Largest numeric item |

```ezra
nums is [3, 1, 4, 1, 5]
say nums.sum()   # 14
say nums.avg()   # 2.8
say nums.min()   # 1
say nums.max()   # 5
```

### Functional

| Method | Arguments | Returns |
|---|---|---|
| `.map(fn)` | `fn: value -> value` | New list with `fn` applied to each item |
| `.filter(fn)` | `fn: value -> bool` | Items where `fn` is truthy |
| `.reduce(fn, init)` | `fn: (acc, value) -> acc`, initial accumulator | Single accumulated value |
| `.flat_map(fn)` | `fn: value -> list` | Flattened result of mapping |
| `.any(fn)` | `fn: value -> bool` | `yes` if any item satisfies `fn` |
| `.all(fn)` | `fn: value -> bool` | `yes` if all items satisfy `fn` |
| `.count(fn)` | `fn: value -> bool` | Number of items satisfying `fn` |

```ezra
nums is [1, 2, 3, 4, 5]

doubled is nums.map(n -> n * 2)
say doubled   # [2, 4, 6, 8, 10]

evens is nums.filter(n -> n % 2 is 0)
say evens     # [2, 4]

total is nums.reduce((acc, n) -> acc + n, 0)
say total     # 15

say nums.any(n -> n > 4)    # yes
say nums.all(n -> n > 0)    # yes
say nums.count(n -> n > 3)  # 2
```

### Joining

```ezra
say ["a", "b", "c"].join(", ")   # a, b, c
say [1, 2, 3].join(" - ")        # 1 - 2 - 3
```

### Chunking and Zipping

```ezra
say [1, 2, 3, 4].chunk(2)   # [[1, 2], [3, 4]]

a is [1, 2, 3]
b is ["a", "b", "c"]
say a.zip(b)   # [[1, a], [2, b], [3, c]]
```

---

## Objects

Create an object with `{key: value}` syntax:

```ezra
person is {
  name: "Rana",
  age: 25,
  city: "Delhi"
}
```

Keys can be identifiers or text literals.

### Access

```ezra
say person.name        # Rana
say person["age"]      # 25
say person.missing     # nothing  (no error)
```

### Object Methods

| Method | Returns |
|---|---|
| `.keys()` | List of key strings |
| `.values()` | List of values |
| `.has(key)` | `yes` / `no` |
| `.get(key)` | Value or `nothing` |
| `.set(key, value)` | New object with key set |
| `.delete(key)` | New object with key removed |
| `.length` | Number of fields |
| `.is_empty()` | `yes` / `no` |

```ezra
say person.keys()          # [age, city, name]  ← sorted
say person.values()        # [25, Delhi, Rana]
say person.has("name")     # yes
say person.has("email")    # no

updated is person.set("email", "rana@example.com")
say updated.email          # rana@example.com

trimmed is updated.delete("city")
say trimmed.keys()         # [age, email, name]
```

Object key order is always **alphabetically sorted** (uses `BTreeMap` internally).

### `keys(obj)` / `values(obj)` as functions

```ezra
say keys(person)    # [age, city, name]
say values(person)  # [25, Delhi, Rana]
```

---

## Comparison with Python / JavaScript

| Ezra | Python | JavaScript |
|---|---|---|
| `[1, 2, 3]` | `[1, 2, 3]` | `[1, 2, 3]` |
| `list.push(v)` | `list.append(v)` | `list.push(v)` |
| `list.filter(fn)` | `list(filter(fn, list))` | `list.filter(fn)` |
| `list.map(fn)` | `list(map(fn, list))` | `list.map(fn)` |
| `list.reduce(fn, 0)` | `functools.reduce(fn, list, 0)` | `list.reduce(fn, 0)` |
| `{key: val}` | `{"key": val}` | `{key: val}` |
| `obj.has("k")` | `"k" in obj` | `"k" in obj` |

> **Pitfall:** List methods return **new lists** — they do not modify in place.
> `nums.push(4)` does NOT update `nums`. You must write `nums is nums.push(4)`.
