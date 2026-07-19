# Flux

Flux is a readable, indentation-based scripting language built in Rust.

Created by [Ankur Rana](https://github.com/ankur-rana).

Current status: `v0.1.0-alpha` interpreter release.

## Why Flux?

Flux is designed for scripting that reads close to plain language:

~~~flux
name is input "Enter your name: "
age is input_number "Enter your age: "

check if age >= 18
  say "Hello {name}, you are an adult."
otherwise
  say "Hello {name}, you are a minor."
~~~

## Documentation

The complete documentation is available in the [documentation index](docs/README.md).

- [Tutorial](docs/tutorial.md)
- [Language Reference](docs/language-reference.md)
- [CLI Reference](docs/cli-reference.md)
- [Tooling and VS Code](docs/tooling.md)
- [Release Guide](docs/release.md)

## Install a Release

Download the latest release from:

https://github.com/ranaji114/Flux-programming-lang/releases/latest

Windows:

~~~powershell
powershell -ExecutionPolicy Bypass -File install/install.ps1
~~~

Linux and macOS:

~~~bash
sh install/install.sh
~~~

Verify the installation:

~~~bash
flux --version
~~~

## Create and Run a Project

~~~bash
flux new hello_flux
cd hello_flux
flux check
flux run
~~~

Run an individual file:

~~~bash
flux run examples/hello.flux
~~~

## Language at a Glance

The current interpreter supports:

- text, numbers, booleans, nothing, lists, and objects
- variables with is and compound assignment
- arithmetic, comparison, equality, and logical operators
- check if, otherwise if, and otherwise
- repeat N times and for each item in list
- named functions with give, return, and arrow returns
- indexing, object properties, text interpolation, and .length
- built-ins: len, type_of, text, and number
- text methods: upper, lower, trim, and contains
- list methods: push, take, and drop
- say, write, print, warn, fail, error, debug, clear, and exit

See the [Language Reference](docs/language-reference.md) for exact behavior.

## CLI

~~~text
flux new <project-name>
flux run [file.flux]
flux check [file.flux]
flux test [tests-dir-or-file]
flux fmt [path] [--check]
flux lint [path]
flux build [project-dir]
flux repl
flux --version
~~~

## VS Code

The VS Code extension provides Flux file detection, syntax highlighting,
snippets, run/check/lint/format commands, and the Flux Neon color theme.

See the [VS Code guide](docs/tooling.md#vs-code-extension) for installation
and configuration.

## Development Checks

~~~bash
cargo fmt -- --check
cargo test
cargo clippy -- -D warnings
cargo build
~~~

## Release Status

Flux is ready for a first public alpha release. It is not a stable v1 language
yet. Syntax, runtime behavior, and standard library APIs may change while the
language matures.

The current build command validates a project and writes a manifest. It does
not compile Flux programs into standalone native executables.

## License

MIT
