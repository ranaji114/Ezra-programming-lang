# Release and Install Guide

This page describes the release artifacts and the local checks for Flux.

## Release Artifacts

The GitHub Actions release workflow is intended to build:

- flux-windows-x86_64.zip
- flux-linux-x86_64.tar.gz
- flux-macos-x86_64.tar.gz
- flux-macos-aarch64.tar.gz

The VS Code extension is packaged as a separate VSIX file:

- flux-0.1.0.vsix

## Release from GitHub

1. Push the Flux repository to GitHub.
2. Update installer examples to use the real owner and repository.
3. Create and push a version tag.

~~~bash
git tag v0.1.0
git push origin v0.1.0
~~~

The release workflow builds the platform archives and publishes them to the
GitHub release.

## Install on Windows

~~~powershell
powershell -ExecutionPolicy Bypass -File install/install.ps1
~~~

After the terminal is restarted:

~~~powershell
flux --version
~~~

## Install on Linux and macOS

~~~bash
sh install/install.sh
flux --version
~~~

Make sure the install directory is in PATH.

## Package the VS Code Extension

~~~bash
cd vscode-extension/flux
npm install
npm run package
~~~

The generated VSIX can be installed from the VS Code Extensions menu with
Install from VSIX.

## Local Quality Checks

Run these checks before publishing a release:

~~~bash
cargo fmt -- --check
cargo clippy -- -D warnings
cargo test
cargo build --release
~~~

Run representative examples too:

~~~bash
flux check examples/calculator.flux
flux run examples/hello.flux
flux run examples/collections.flux
~~~

## Versioning

The CLI and extension currently use version 0.1.0. Keep the Cargo package,
CLI output, extension package, documentation, and release tag aligned when
preparing a new release.

## Current Limitation

flux build validates a Flux project and writes build/manifest.txt. It does not
compile .flux programs into standalone native executables. Native compilation
and application bundling are future milestones.
