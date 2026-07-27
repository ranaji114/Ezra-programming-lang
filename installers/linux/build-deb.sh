#!/usr/bin/env bash
# Build a .deb package for Ezra
# Author: Ankur Rana
# Usage: ./build-deb.sh [version] [arch]
# Requires: dpkg-deb, install
set -euo pipefail

VERSION="${1:-1.0.0}"
ARCH="${2:-amd64}"
PKG="ezra-lang_${VERSION}_${ARCH}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BINARY="$ROOT/target/release/ezra"
LSP_BINARY="$ROOT/target/release/ezra-lsp"

if [[ ! -f "$BINARY" ]]; then
  echo "ERROR: $BINARY not found. Run: cargo build --release" >&2
  exit 1
fi

echo "=== Building $PKG.deb ==="
rm -rf "$PKG"

# --- Directory tree ---
mkdir -p "$PKG/DEBIAN"
mkdir -p "$PKG/usr/bin"
mkdir -p "$PKG/usr/share/ezra/examples"
mkdir -p "$PKG/usr/share/ezra/std"
mkdir -p "$PKG/usr/share/doc/ezra-lang"
mkdir -p "$PKG/usr/share/man/man1"
mkdir -p "$PKG/usr/share/mime/packages"
mkdir -p "$PKG/usr/share/applications"

# --- Binaries ---
install -Dm755 "$BINARY" "$PKG/usr/bin/ezra"
[[ -f "$LSP_BINARY" ]] && install -Dm755 "$LSP_BINARY" "$PKG/usr/bin/ezra-lsp"

# --- Data files ---
cp -r "$ROOT/examples/." "$PKG/usr/share/ezra/examples/"
cp -r "$ROOT/std/."      "$PKG/usr/share/ezra/std/"

# --- Docs ---
install -Dm644 "$ROOT/README.md" "$PKG/usr/share/doc/ezra-lang/README.md"
install -Dm644 "$ROOT/LICENSE"   "$PKG/usr/share/doc/ezra-lang/copyright"

# --- Man page ---
cat > "$PKG/usr/share/man/man1/ezra.1" << 'MAN'
.TH EZRA 1 "2026-07-25" "1.0.0" "Ezra Language"
.SH NAME
ezra \- Ezra scripting language interpreter
.SH SYNOPSIS
.B ezra
[\fICOMMAND\fR] [\fIOPTIONS\fR]
.SH DESCRIPTION
Ezra is a readable, indentation-based scripting language built in Rust.
Created by Ankur Rana.
.SH COMMANDS
.TP
.B run [file.ez]
Run an Ezra source file.
.TP
.B check [file.ez]
Parse without running.
.TP
.B test [path]
Run test files (*_test.ez).
.TP
.B fmt [path] [--check]
Format source files.
.TP
.B lint [path]
Lint source files.
.TP
.B build [project-dir]
Validate project and write manifest.
.TP
.B repl
Start the interactive REPL.
.TP
.B new <name>
Scaffold a new project.
.TP
.B --version
Print version.
.SH AUTHOR
Ankur Rana <https://github.com/ranaji114>
MAN
gzip -9 "$PKG/usr/share/man/man1/ezra.1"

# --- MIME type ---
cat > "$PKG/usr/share/mime/packages/ezra.xml" << 'MIME'
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="text/x-ezra">
    <comment>Ezra source file</comment>
    <glob pattern="*.ez"/>
    <glob pattern="*.flx"/>
    <magic priority="50">
      <match type="string" offset="0" value="say "/>
      <match type="string" offset="0" value="give "/>
      <match type="string" offset="0" value="check if"/>
    </magic>
  </mime-type>
</mime-info>
MIME

# --- Desktop entry ---
cat > "$PKG/usr/share/applications/ezra-repl.desktop" << 'DESKTOP'
[Desktop Entry]
Type=Application
Name=Ezra REPL
Comment=Ezra scripting language interactive shell — by Ankur Rana
Exec=ezra repl
Icon=utilities-terminal
Categories=Development;
MimeType=text/x-ezra;
Terminal=true
DESKTOP

# --- DEBIAN/control ---
INSTALLED_SIZE=$(du -sk "$PKG" | cut -f1)
cat > "$PKG/DEBIAN/control" << EOF
Package: ezra-lang
Version: $VERSION
Section: devel
Priority: optional
Architecture: $ARCH
Installed-Size: $INSTALLED_SIZE
Maintainer: Ankur Rana <ankur@ranaji114.github.io>
Homepage: https://ranaji114.github.io/Ezra-programming-lang
Description: Ezra scripting language interpreter
 Ezra is a readable, indentation-based scripting language built in Rust.
 Created by Ankur Rana.
Depends: libc6 (>= 2.17)
EOF

# --- DEBIAN/postinst ---
cp debian/postinst "$PKG/DEBIAN/postinst"
cp debian/prerm    "$PKG/DEBIAN/prerm"
chmod 755 "$PKG/DEBIAN/postinst" "$PKG/DEBIAN/prerm"

# --- Build ---
dpkg-deb --build --root-owner-group "$PKG"
echo "Built: $PKG.deb"

# --- SHA256 ---
sha256sum "$PKG.deb" | tee -a SHA256SUMS
rm -rf "$PKG"
