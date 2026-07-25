#!/usr/bin/env sh
# build.sh — Build and package Ezra for Linux / macOS
# Usage:  ./build.sh [--release] [--package] [--test] [--all]
set -eu

RELEASE=0; PACKAGE=0; TEST=0
for arg in "$@"; do
  case "$arg" in
    --release) RELEASE=1 ;;
    --package) PACKAGE=1; RELEASE=1 ;;
    --test)    TEST=1 ;;
    --all)     RELEASE=1; PACKAGE=1; TEST=1 ;;
  esac
done

VERSION=$(grep '^version' Cargo.toml | head -1 | sed 's/.*"\(.*\)"/\1/')
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

step() { printf '\n==> %s\n' "$1"; }

step "Format check"
cargo fmt -- --check

step "Clippy lint"
cargo clippy

if [ "$TEST" = "1" ]; then
  step "Tests"
  cargo test
fi

if [ "$RELEASE" = "1" ]; then
  step "Release build"
  cargo build --release
  echo "  Binary: target/release/ezra"
fi

if [ "$PACKAGE" = "1" ]; then
  case "$OS-$ARCH" in
    linux-x86_64)  ARCHIVE="ezra-linux-x86_64.tar.gz" ;;
    darwin-x86_64) ARCHIVE="ezra-macos-x86_64.tar.gz" ;;
    darwin-arm64)  ARCHIVE="ezra-macos-aarch64.tar.gz" ;;
    *)             ARCHIVE="ezra-${OS}-${ARCH}.tar.gz" ;;
  esac
  step "Package $ARCHIVE"
  tar -czf "$ARCHIVE" -C target/release ezra ezra-lsp -C ../.. README.md examples
  echo "  Archive: $ARCHIVE"
fi

printf '\nDone — Ezra v%s\n' "$VERSION"
