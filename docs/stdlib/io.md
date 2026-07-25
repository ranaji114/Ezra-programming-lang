# Standard Library: I/O

## Console Output

### `say expr`
Prints `expr` followed by a newline to **stdout**.
```ezra
say "Hello!"       # Hello!
say 42             # 42
say [1, 2, 3]      # [1, 2, 3]
```

### `write expr`
Prints `expr` **without** a trailing newline.
```ezra
write "Loading... "
say "done"    # Loading... done
```

### `warn expr`
Prints `warning: <expr>` to **stderr**.
```ezra
warn "disk almost full"    # stderr: warning: disk almost full
```

### `fail expr`
Prints `error: <expr>` to **stderr**. Does not stop the program.
```ezra
fail "something went wrong"
```

### `debug expr`
Prints `debug: <expr>` to **stderr**. Useful during development.
```ezra
debug x   # debug: 42
```

### `clear`
Sends an ANSI clear-screen escape sequence.

### `exit(code)`
Exits the program with the given numeric exit code.
```ezra
exit(0)   # success
exit(1)   # failure
```

---

## Console Input

### `input(prompt) -> text`
Displays `prompt` (no newline), reads a line from stdin, and returns it as text (newline stripped).

**Signature:** `input(prompt: text) -> text`

```ezra
name is input "Your name: "
say "Hello {name}"
```

### `input_number(prompt) -> number`
Same as `input` but converts the result to a number.
Throws a runtime error if the input is not a valid number.

**Signature:** `input_number(prompt: text) -> number`

```ezra
age is input_number "Your age: "
check if age >= 18
  say "Adult"
```

**Error:** `invalid number: \`abc\`` if input cannot be parsed.

---

## File I/O

### `read_file(path) -> text`
Returns the entire file contents as text. Returns `nothing` if the file does
not exist or cannot be read.

```ezra
content is read_file("data.txt")
check if content is nothing
  say "file not found"
otherwise
  say content
```

### `write_file(path, text)`
Writes text to a file, creating or overwriting it.
```ezra
write_file("output.txt", "Hello from Ezra!")
```

### `append_file(path, text)`
Appends text to an existing file (or creates it).
```ezra
append_file("log.txt", "Event at time {time()}\n")
```

### `file_exists(path) -> bool`
```ezra
check if file_exists("config.txt")
  say "found config"
```

### `file_delete(path)`
Deletes a file. Throws if the file does not exist.
```ezra
file_delete("temp.txt")
```

### `file_copy(src, dst)`
Copies a file.
```ezra
file_copy("data.txt", "data_backup.txt")
```

### `file_size(path) -> number`
Returns the file size in bytes.
```ezra
size is file_size("data.txt")
say "Size: {size} bytes"
```

### `list_dir(path) -> list`
Returns a list of filenames in the given directory.
```ezra
files is list_dir(".")
for each f in files
  say f
```

### `create_dir(path)`
Creates a directory (and all parent directories).
```ezra
create_dir("output/reports")
```

---

## JSON

### `parse_json(s) -> value`
Parses a JSON string into an Ezra value.

```ezra
data is parse_json("{\"name\": \"Rana\", \"age\": 25}")
say data.name   # Rana
say data.age    # 25

items is parse_json("[1, 2, 3]")
say items[0]    # 1
```

JSON types map as: `object` → object, `array` → list, `string` → text,
`number` → number, `true`/`false` → `yes`/`no`, `null` → `nothing`.

### `stringify_json(v) -> text`
Converts an Ezra value to a JSON string.

```ezra
json is stringify_json({name: "Rana", scores: [90, 85, 92]})
say json   # {"name":"Rana","scores":[90,85,92]}
```

**Error:** Throws if the value contains non-serialisable types (functions).

---

## Stream Conventions

| Stream | Used by |
|---|---|
| stdout | `say`, `write`, `input`/`input_number` prompts |
| stderr | `warn`, `fail`, `debug` |

Redirect in the shell:
```bash
ezra run script.ez > output.txt 2> errors.txt
```
