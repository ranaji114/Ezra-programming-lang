# Getting Started with Flux

This page is a short entry point for the current Flux alpha release.

For the complete guide, start with:

- [Flux Documentation](README.md)
- [Flux Tutorial](tutorial.md)
- [Language Reference](language-reference.md)
- [CLI Reference](cli-reference.md)
- [Tooling and VS Code](tooling.md)

## Run an Existing File

~~~bash
flux check examples/hello.flux
flux run examples/hello.flux
~~~

## Create a Project

~~~bash
flux new hello_flux
cd hello_flux
flux check
flux run
flux test
~~~

## Core Commands

~~~bash
flux run [file.flux]
flux check [file.flux]
flux test [tests-dir-or-file]
flux fmt [path] [--check]
flux lint [path]
flux build [project-dir]
flux repl
flux --version
~~~

## Small Example

~~~flux
name is input "Name: "
say "Hello {name}!"
~~~

Save the program as main.flux and run:

~~~bash
flux run main.flux
~~~

## Current Status

The current build supports variables, values, expressions, conditions, loops,
functions, input/output, collections, interpolation, formatting, linting,
testing, and the REPL.

It is an alpha release. Modules, package management, native compilation, async
actors, and advanced standard-library features are not implemented yet.

