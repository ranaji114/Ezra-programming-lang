#!/usr/bin/env bash
# Build all Ezra release artifacts
# Usage: ./build-all.sh [--version 0.1.0] [--skip-tests]
# Platform: Linux (cross-compiles Windows via cross or cargo)
set -euo pipefail

VERSION="0.1.0"
SKIP_TESTS=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --version) VERSION="$2"; shift 2 ;;
    --skip-tests) SKIP_TESTS=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Ezra v$VERSION — Build All ==="

# 1. Quality checks
echo ""
echo "--- Formatting check ---"
cargo fmt -- --check

echo "--- Clippy ---"
cargo clippy

# 2. Tests
if [[ "$SKIP_TESTS" -eq 0 ]]; then
  echo ""
  echo "--- Tests ---"
  cargo test
fi

# 3. Release build (native)
echo ""
echo "--- Release build ---"
cargo build --release

# 4. Package for current platform
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS-$ARCH" in
  linux-x86_64)
    ARCHIVE="ezra-linux-x86_64-${VERSION}.tar.gz"
    tar -czf "$ARCHIVE" -C target/release ezra ezra-lsp -C ../.. README.md examples std
    echo "Linux archive: $ARCHIVE"
    sha256sum "$ARCHIVE" >> SHA256SUMS
    # Build deb if dpkg-deb available
    if command -v dpkg-deb &>/dev/null; then
      cd installers/linux
      bash build-deb.sh "$VERSION"
      cd "$ROOT"
    fi
    ;;
  darwin-x86_64|darwin-arm64)
    ARCHIVE="ezra-macos-${ARCH}-${VERSION}.tar.gz"
    tar -czf "$ARCHIVE" -C target/release ezra -C ../.. README.md examples std
    echo "macOS archive: $ARCHIVE"
    sha256sum "$ARCHIVE" >> SHA256SUMS
    if command -v pkgbuild &>/dev/null; then
      cd installers/macos
      bash build-pkg.sh "$VERSION" "$ARCH"
      cd "$ROOT"
    fi
    ;;
esac

echo ""
echo "=== Done: Ezra v$VERSION ==="
cat SHA256SUMS 2>/dev/null || true
