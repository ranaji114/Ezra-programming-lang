# Flux CLI Reference

The flux command runs Flux programs and provides the project tools included in
the alpha release.

## Command Summary

| Command | Purpose |
| --- | --- |
| flux new <project-name> | Create a new project |
| flux run [file.flux] | Run a source file |
| flux check [file.flux] | Parse a file without running it |
| flux test [path] | Run Flux test files |
| flux fmt [path] [--check] | Format Flux files |
| flux lint [path] | Report style and parser diagnostics |
| flux build [project-dir] | Validate a project and write a manifest |
| flux repl | Open the interactive shell |
| flux --version | Print the installed version |
| flux --help | Print command help |

When a file or path is omitted, commands use the current directory or the
default project entry point where applicable.

## flux new

Creates a project directory with a source folder, test folder, manifest, and
starter files:

~~~text
flux new hello_flux
cd hello_flux
flux run
~~~

Generated layout:

~~~text
hello_flux/
  flux.toml
  src/
    main.flux
  tests/
    main_test.flux
~~~

Project names may contain ASCII letters, numbers, hyphen, and underscore. The
command fails if the target already exists.

The generated flux.toml currently contains package metadata for future tooling.
The interpreter does not yet resolve dependencies from it.

## flux run

Runs a Flux file:

~~~bash
flux run examples/hello.flux
~~~

With no path, the CLI reads src/main.flux in the current directory:

~~~bash
cd hello_flux
flux run
~~~

Program output goes to standard output. warn, fail, and debug diagnostics go to
standard error. A syntax or runtime failure exits with a non-zero status.

## flux check

Parses a file without executing it:

~~~bash
flux check src/main.flux
~~~

A successful check prints a confirmation. This is useful before running code
that asks for input or performs side effects.

With no path, it checks src/main.flux.

## flux test

Runs .flux files as test programs:

~~~bash
flux test
flux test tests/main_test.flux
~~~

When the path is a directory, only files whose filename stem ends in _test are
selected. For example, math_test.flux is selected but example.flux is not.
When the path is a single file, that file is run regardless of its name.

Each test file is parsed and executed. A test is considered successful when it
finishes without an error. The current language has no built-in assertion
statement, so tests commonly use program behavior and runtime failures.

## flux fmt

Formats one file or every .flux file under a directory:

~~~bash
flux fmt src/main.flux
flux fmt .
~~~

The formatter currently:

- normalizes CRLF and CR line endings to LF
- removes trailing whitespace
- preserves leading indentation
- reduces consecutive blank lines to at most one
- ensures the file ends with a newline

Use --check in CI or before a commit:

~~~bash
flux fmt . --check
~~~

--check does not write files. It exits non-zero when a file needs formatting.

## flux lint

Checks a file or directory:

~~~bash
flux lint src/main.flux
flux lint .
~~~

The linter reports:

- lines longer than 100 characters
- trailing spaces or tabs
- a missing final newline
- parser errors

Warnings do not fail the command. Parser errors do. Diagnostics include the
path, line, column, severity, and message.

## flux build

Validates a project entry point and writes a build manifest:

~~~bash
flux build .
~~~

The command expects:

~~~text
./src/main.flux
~~~

On success it creates:

~~~text
./build/manifest.txt
~~~

The manifest records the project path, entry file, and Flux version. This is a
project validation step, not native compilation. It does not produce a
standalone executable.

## flux repl

Starts a small interactive read-eval-print loop:

~~~bash
flux repl
~~~

Enter a single-line Flux statement or expression. Type exit or quit to leave:

~~~text
Flux REPL 0.1.0
Type exit or press Ctrl+C to quit.
flux> say "Hello"
Hello
flux> exit
~~~

The REPL keeps its environment between input lines. Multi-line blocks are
better written to a .flux file and run with flux run.

## flux --version and flux --help

Print the installed version:

~~~bash
flux --version
~~~

Print usage information and the available command list:

~~~bash
flux --help
~~~

## Running from Source

When developing Flux itself, use Cargo:

~~~bash
cargo run -- run examples/hello.flux
cargo run -- check examples/hello.flux
cargo run -- test
cargo run -- fmt . --check
cargo run -- lint .
cargo run -- build .
cargo run -- repl
~~~

The double hyphen separates Cargo arguments from Flux arguments.

## Exit Status

A command normally returns exit status 0 on success. It returns a non-zero
status for:

- missing files or directories
- invalid command arguments
- syntax errors
- runtime errors
- failed format checks
- lint results containing parser errors
- a project without src/main.flux

## Input and Output Streams

Flux follows normal command-line stream conventions:

- say, write, and normal program output use standard output
- warn, fail, and debug use standard error
- prompts from input and input_number use standard output
- flux run does not capture or transform child program streams

This makes it possible to redirect output:

~~~bash
flux run main.flux > output.txt
flux run main.flux 2> diagnostics.txt
~~~

## Common Workflows

### New Project

~~~bash
flux new my_app
cd my_app
flux check
flux run
~~~

### Before Commit

~~~bash
flux fmt . --check
flux lint .
flux test
~~~

### Try an Example

~~~bash
flux run examples/basics.flux
flux run examples/collections.flux
flux run examples/functions.flux
flux run examples/input.flux
~~~

