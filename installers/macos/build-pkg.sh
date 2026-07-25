#!/usr/bin/env bash
# Build a macOS .pkg installer for Ezra
# Author: Ankur Rana
# Usage: ./build-pkg.sh [version] [arch]
# Requires: pkgbuild, productbuild (Xcode Command Line Tools)
set -euo pipefail

VERSION="${1:-1.0.0}"
ARCH="${2:-$(uname -m)}"   # x86_64 or arm64
PKG_STEM="ezra-macos-${ARCH}-${VERSION}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BINARY="$ROOT/target/release/ezra"
LSP_BINARY="$ROOT/target/release/ezra-lsp"
PAYLOAD="$ROOT/installers/macos/_payload"
SCRIPTS_DIR="$ROOT/installers/macos/_scripts"
COMPONENT_PKG="${PKG_STEM}-component.pkg"
FINAL_PKG="${PKG_STEM}.pkg"

if [[ ! -f "$BINARY" ]]; then
  echo "ERROR: $BINARY not found. Run: cargo build --release" >&2
  exit 1
fi

echo "=== Building $FINAL_PKG ==="

# --- Clean ---
rm -rf "$PAYLOAD" "$SCRIPTS_DIR" "$COMPONENT_PKG"

# --- Payload tree ---
mkdir -p "$PAYLOAD/usr/local/bin"
mkdir -p "$PAYLOAD/usr/local/share/ezra/examples"
mkdir -p "$PAYLOAD/usr/local/share/ezra/std"
mkdir -p "$PAYLOAD/usr/local/share/doc/ezra"
mkdir -p "$PAYLOAD/usr/local/man/man1"

install -m755 "$BINARY"     "$PAYLOAD/usr/local/bin/ezra"
[[ -f "$LSP_BINARY" ]] && install -m755 "$LSP_BINARY" "$PAYLOAD/usr/local/bin/ezra-lsp"

cp -r "$ROOT/examples/." "$PAYLOAD/usr/local/share/ezra/examples/"
cp -r "$ROOT/std/."      "$PAYLOAD/usr/local/share/ezra/std/"
cp    "$ROOT/README.md"  "$PAYLOAD/usr/local/share/doc/ezra/"
cp    "$ROOT/LICENSE"    "$PAYLOAD/usr/local/share/doc/ezra/"

# Man page
cat > "$PAYLOAD/usr/local/man/man1/ezra.1" << 'MAN'
.TH EZRA 1 "2026-07-25" "1.0.0" "Ezra Language"
.SH NAME
ezra \- Ezra scripting language interpreter
.SH SYNOPSIS
.B ezra
[\fICOMMAND\fR] [\fIFILE\fR]
.SH DESCRIPTION
Ezra is a readable, indentation-based scripting language built in Rust.
Created by Ankur Rana.
.SH COMMANDS
run, check, test, fmt, lint, build, repl, new, --version
.SH AUTHOR
Ankur Rana <https://github.com/ranaji114>
MAN
gzip -9 "$PAYLOAD/usr/local/man/man1/ezra.1"

# --- Scripts ---
mkdir -p "$SCRIPTS_DIR"
cat > "$SCRIPTS_DIR/postinstall" << 'SCRIPT'
#!/bin/sh
# Update man database if available
if command -v mandb >/dev/null 2>&1; then mandb -q; fi
if command -v man-db >/dev/null 2>&1;  then man-db -q; fi
echo ""
echo "✓ Ezra 1.0.0 installed to /usr/local/bin/ezra"
echo "  Created by Ankur Rana"
echo "  Docs: https://ranaji114.github.io/Flux-programming-lang"
echo ""
echo "Quick start:"
echo "  ezra --version"
echo "  ezra new my_app && cd my_app && ezra run"
echo ""
SCRIPT
chmod 755 "$SCRIPTS_DIR/postinstall"

# --- Component package ---
pkgbuild \
  --root "$PAYLOAD" \
  --scripts "$SCRIPTS_DIR" \
  --identifier "io.github.ranaji114.ezra" \
  --version "$VERSION" \
  --install-location "/" \
  "$COMPONENT_PKG"

# --- Distribution XML ---
DISTXML="$ROOT/installers/macos/_distribution.xml"
cat > "$DISTXML" << EOF
<?xml version="1.0" encoding="utf-8"?>
<installer-gui-script minSpecVersion="2">
  <title>Ezra ${VERSION}</title>
  <welcome    file="welcome.html"    mime-type="text/html" />
  <conclusion file="conclusion.html" mime-type="text/html" />
  <organization>io.github.ranaji114</organization>
  <domains enable_localSystem="true" enable_currentUserHome="false"/>
  <options
    customize="never"
    require-scripts="false"
    allow-external-scripts="false"
    hostArchitectures="${ARCH}"
  />
  <choices-outline>
    <line choice="default">
      <line choice="io.github.ranaji114.ezra"/>
    </line>
  </choices-outline>
  <choice id="default"/>
  <choice id="io.github.ranaji114.ezra" visible="false">
    <pkg-ref id="io.github.ranaji114.ezra"/>
  </choice>
  <pkg-ref
    id="io.github.ranaji114.ezra"
    version="${VERSION}"
    onConclusion="none"
  >${COMPONENT_PKG}</pkg-ref>
</installer-gui-script>
EOF

# Optional: welcome/conclusion HTML pages
cat > "$ROOT/installers/macos/welcome.html" << 'HTML'
<!DOCTYPE html>
<html>
<body style="font-family:system-ui;padding:20px">
  <h2>Welcome to Ezra 1.0.0</h2>
  <p>A readable scripting language built in Rust.</p>
  <p><b>Created by Ankur Rana</b></p>
  <p>This will install the <code>ezra</code> interpreter to <code>/usr/local/bin</code>.</p>
</body>
</html>
HTML

cat > "$ROOT/installers/macos/conclusion.html" << 'HTML'
<!DOCTYPE html>
<html>
<body style="font-family:system-ui;padding:20px">
  <h2>Ezra installed successfully!</h2>
  <p>Open a terminal and run:</p>
  <pre>ezra --version
ezra new hello_app
cd hello_app
ezra run</pre>
  <p>Docs: <a href="https://ranaji114.github.io/Flux-programming-lang">ranaji114.github.io/Flux-programming-lang</a></p>
</body>
</html>
HTML

# --- Final product package ---
productbuild \
  --distribution "$DISTXML" \
  --package-path "$(dirname "$COMPONENT_PKG")" \
  --resources "$ROOT/installers/macos" \
  "$FINAL_PKG"

# --- Cleanup temporaries ---
rm -f "$COMPONENT_PKG" "$DISTXML"
rm -rf "$PAYLOAD" "$SCRIPTS_DIR"

# --- SHA256 ---
if command -v sha256sum &>/dev/null; then
  sha256sum "$FINAL_PKG" | tee -a SHA256SUMS
else
  shasum -a 256 "$FINAL_PKG" | tee -a SHA256SUMS
fi

echo "Built: $FINAL_PKG"
