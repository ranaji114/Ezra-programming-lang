# Ezra CLI Reference

The ezra command runs Ezra programs and provides the project tools included in
the alpha release.

## Command Summary

| Command | Purpose |
| --- | --- |
| ezra new <project-name> | Create a new project |
| ezra run [file.ez] | Run a source file |
| ezra check [file.ez] | Parse a file without running it |
| ezra test [path] | Run ezra test files |
| ezra fmt [path] [--check] | Format Ezra files |
| ezra lint [path] | Report style and parser diagnostics |
| ezra build [project-dir] | Validate a project and write a manifest |
| ezra repl | Open the interactive shell |
| ezra --version | Print the installed version |
| ezra --help | Print command help |

When a file or path is omitted, commands use the current directory or the
default project entry point where applicable.

## ezra new

Creates a project directory with a source folder, test folder, manifest, and
starter files:

~~~text
ezra new hello_flux
cd hello_flux
ezra run
~~~

Generated layout:

~~~text
hello_flux/
  ezra.toml
  src/
    main.ez
  tests/
    main_test.ez
~~~

Project names may contain ASCII letters, numbers, hyphen, and underscore. The
command fails if the target already exists.

The generated ezra.toml currently contains package metadata for future tooling.
The interpreter does not yet resolve dependencies from it.

## ezra run

Runs an Ezra file:

~~~bash
ezra run examples/hello.ez
~~~

With no path, the CLI reads src/main.ez in the current directory:

~~~bash
cd hello_flux
ezra run
~~~

Program output goes to standard output. warn, fail, and debug diagnostics go to
standard error. A syntax or runtime failure exits with a non-zero status.

## ezra check

Parses a file without executing it:

~~~bash
ezra check src/main.ez
~~~

A successful check prints a confirmation. This is useful before running code
that asks for input or performs side effects.

With no path, it checks src/main.ez.

## ezra test

Runs .ez files as test programs:

~~~bash
ezra test
ezra test tests/main_test.ez
~~~

When the path is a directory, only files whose filename stem ends in _test are
selected. For example, math_test.ez is selected but example.ez is not.
When the path is a single file, that file is run regardless of its name.

Each test file is parsed and executed. A test is considered successful when it
finishes without an error. The current language has no built-in assertion
statement, so tests commonly use program behavior and runtime failures.

## ezra fmt

Formats one file or every .ez file under a directory:

~~~bash
ezra fmt src/main.ez
ezra fmt .
~~~

The formatter currently:

- normalizes CRLF and CR line endings to LF
- removes trailing whitespace
- preserves leading indentation
- reduces consecutive blank lines to at most one
- ensures the file ends with a newline

Use --check in CI or before a commit:

~~~bash
ezra fmt . --check
~~~

--check does not write files. It exits non-zero when a file needs formatting.

## ezra lint

Checks a file or directory:

~~~bash
ezra lint src/main.ez
ezra lint .
~~~

The linter reports:

- lines longer than 100 characters
- trailing spaces or tabs
- a missing final newline
- parser errors

Warnings do not fail the command. Parser errors do. Diagnostics include the
path, line, column, severity, and message.

## ezra build

Validates a project entry point and writes a build manifest:

~~~bash
ezra build .
~~~

The command expects:

~~~text
./src/main.ez
~~~

On success it creates:

~~~text
./build/manifest.txt
~~~

The manifest records the project path, entry file, and Ezra version. This is a
project validation step, not native compilation. It does not produce a
standalone executable.

## ezra repl

Starts a small interactive read-eval-print loop:

~~~bash
ezra repl
~~~

Enter a single-line Ezra statement or expression. Type exit or quit to leave:

~~~text
ezra repl 0.1.0
Type exit or press Ctrl+C to quit.
ezra> say "Hello"
Hello
ezra> exit
~~~

The REPL keeps its environment between input lines. Multi-line blocks are
better written to a .ez file and run with ezra run.

## ezra --version and ezra --help

Print the installed version:

~~~bash
ezra --version
~~~

Print usage information and the available command list:

~~~bash
ezra --help
~~~

## Running from Source

When developing Ezra itself, use Cargo:

~~~bash
cargo run -- run examples/hello.ez
cargo run -- check examples/hello.ez
cargo run -- test
cargo run -- fmt . --check
cargo run -- lint .
cargo run -- build .
cargo run -- repl
~~~

The double hyphen separates Cargo arguments from Ezra arguments.

## Exit Status

A command normally returns exit status 0 on success. It returns a non-zero
status for:

- missing files or directories
- invalid command arguments
- syntax errors
- runtime errors
- failed format checks
- lint results containing parser errors
- a project without src/main.ez

## Input and Output Streams

Ezra follows normal command-line stream conventions:

- say, write, and normal program output use standard output
- warn, fail, and debug use standard error
- prompts from input and input_number use standard output
- ezra run does not capture or transform child program streams

This makes it possible to redirect output:

~~~bash
ezra run main.ez > output.txt
ezra run main.ez 2> diagnostics.txt
~~~

## Common Workflows

### New Project

~~~bash
ezra new my_app
cd my_app
ezra check
ezra run
~~~

### Before Commit

~~~bash
ezra fmt . --check
ezra lint .
ezra test
~~~

### Try an Example

~~~bash
ezra run examples/basics.ez
ezra run examples/collections.ez
ezra run examples/functions.ez
ezra run examples/input.ez
~~~

