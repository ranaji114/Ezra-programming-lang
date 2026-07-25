#!/usr/bin/env sh
# Ezra Language — Linux / macOS Installer
# Author: Ankur Rana
# Usage:  sh install.sh [--version 1.0.0] [--dir ~/.local/bin] [--silent]
# Env overrides: EZRA_REPO, EZRA_VERSION, EZRA_INSTALL_DIR
set -eu

# ── defaults ────────────────────────────────────────────────────────────────
REPO="${EZRA_REPO:-ranaji114/Flux-programming-lang}"
VERSION="${EZRA_VERSION:-latest}"
INSTALL_DIR="${EZRA_INSTALL_DIR:-}"
SILENT=0

# ── arg parsing ──────────────────────────────────────────────────────────────
while [ "$#" -gt 0 ]; do
  case "$1" in
    --version)  VERSION="$2";     shift 2 ;;
    --dir)      INSTALL_DIR="$2"; shift 2 ;;
    --silent)   SILENT=1;         shift   ;;
    *) printf "Unknown arg: %s\n" "$1" >&2; exit 1 ;;
  esac
done

# ── default install dir ───────────────────────────────────────────────────────
if [ -z "$INSTALL_DIR" ]; then
  if [ -w "/usr/local/bin" ]; then
    INSTALL_DIR="/usr/local/bin"
  else
    INSTALL_DIR="${HOME}/.local/bin"
  fi
fi

# ── helpers ───────────────────────────────────────────────────────────────────
step() { [ "$SILENT" -eq 0 ] && printf "  → %s\n" "$1"; }
done_() { [ "$SILENT" -eq 0 ] && printf "  ✓ %s\n" "$1"; }
fail() { printf "  ✗ %s\n" "$1" >&2; exit 1; }

require() {
  command -v "$1" >/dev/null 2>&1 || fail "'$1' is required but not found. Install it first."
}

# ── detect platform ───────────────────────────────────────────────────────────
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS-$ARCH" in
  Linux-x86_64)   ASSET="ezra-linux-x86_64-1.0.0.tar.gz" ;;
  Linux-aarch64|Linux-arm64) ASSET="ezra-linux-aarch64-1.0.0.tar.gz" ;;
  Darwin-x86_64)  ASSET="ezra-macos-x86_64-1.0.0.tar.gz" ;;
  Darwin-arm64)   ASSET="ezra-macos-aarch64-1.0.0.tar.gz" ;;
  *) fail "Unsupported platform: $OS-$ARCH. Build from source: cargo build --release" ;;
esac

require curl

# ── banner ────────────────────────────────────────────────────────────────────
if [ "$SILENT" -eq 0 ]; then
  printf "\n"
  printf "  Ezra Language Installer\n"
  printf "  Created by Ankur Rana\n"
  printf "  https://github.com/ranaji114\n"
  printf "\n"
fi

# ── fetch release metadata ───────────────────────────────────────────────────
if [ "$VERSION" = "latest" ]; then
  RELEASE_URL="https://api.github.com/repos/${REPO}/releases/latest"
else
  RELEASE_URL="https://api.github.com/repos/${REPO}/releases/tags/v${VERSION}"
fi

step "Fetching release metadata..."
META="$(curl -fsSL -H "User-Agent: ezra-installer/1.0" "$RELEASE_URL")" || \
  fail "Could not reach GitHub API. Check your internet connection."

# Parse download URL (portable — no jq dependency)
DOWNLOAD_URL="$(printf '%s' "$META" | \
  grep '"browser_download_url"' | \
  grep "$ASSET\"" | \
  head -1 | \
  sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')"

[ -z "$DOWNLOAD_URL" ] && fail "Asset '$ASSET' not found in release. Check: https://github.com/$REPO/releases"

# Optional checksum
CHECKSUM_URL="$(printf '%s' "$META" | \
  grep '"browser_download_url"' | \
  grep "${ASSET}.sha256\"" | \
  head -1 | \
  sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')"

# ── download ──────────────────────────────────────────────────────────────────
TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

ARCHIVE="$TMP/$ASSET"
step "Downloading $ASSET..."
curl -fsSL --progress-bar "$DOWNLOAD_URL" -o "$ARCHIVE"

# ── verify checksum ───────────────────────────────────────────────────────────
if [ -n "$CHECKSUM_URL" ]; then
  SHA_FILE="$TMP/${ASSET}.sha256"
  curl -fsSL "$CHECKSUM_URL" -o "$SHA_FILE"
  EXPECTED="$(awk '{print $1}' "$SHA_FILE")"

  if command -v sha256sum >/dev/null 2>&1; then
    ACTUAL="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
  elif command -v shasum >/dev/null 2>&1; then
    ACTUAL="$(shasum -a 256 "$ARCHIVE" | awk '{print $1}')"
  else
    ACTUAL=""
  fi

  if [ -n "$ACTUAL" ]; then
    [ "$EXPECTED" = "$ACTUAL" ] || fail "SHA256 mismatch!\n  expected: $EXPECTED\n  got:      $ACTUAL"
    done_ "Checksum verified"
  fi
fi

# ── extract ───────────────────────────────────────────────────────────────────
step "Extracting..."
mkdir -p "$TMP/extract"
tar -xzf "$ARCHIVE" -C "$TMP/extract"

# Locate ezra binary (may be at root or in a subdirectory)
EZRA_BIN="$(find "$TMP/extract" -name "ezra" -type f | head -1)"
EZRA_LSP="$(find "$TMP/extract" -name "ezra-lsp" -type f | head -1)"

[ -z "$EZRA_BIN" ] && fail "Could not find 'ezra' binary in archive"

# ── install ───────────────────────────────────────────────────────────────────
step "Installing to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
install -m755 "$EZRA_BIN" "$INSTALL_DIR/ezra"
[ -n "$EZRA_LSP" ] && install -m755 "$EZRA_LSP" "$INSTALL_DIR/ezra-lsp"

# ── PATH check ────────────────────────────────────────────────────────────────
NEEDS_PATH=0
case ":${PATH}:" in
  *":${INSTALL_DIR}:"*) ;;
  *) NEEDS_PATH=1 ;;
esac

if [ "$NEEDS_PATH" -eq 1 ] && [ "$SILENT" -eq 0 ]; then
  printf "\n"
  printf "  ⚠  %s is not in your PATH.\n" "$INSTALL_DIR"
  printf "  Add this to your shell config (~/.bashrc, ~/.zshrc, or ~/.profile):\n"
  printf "\n"
  printf '    export PATH="%s:$PATH"\n' "$INSTALL_DIR"
  printf "\n"
  printf "  Then reload: source ~/.bashrc  (or open a new terminal)\n"
fi

# ── verify ────────────────────────────────────────────────────────────────────
if command -v "$INSTALL_DIR/ezra" >/dev/null 2>&1; then
  VER="$("$INSTALL_DIR/ezra" --version 2>&1)"
  done_ "Verified: $VER"
fi

# ── done ──────────────────────────────────────────────────────────────────────
if [ "$SILENT" -eq 0 ]; then
  printf "\n"
  printf "  Ezra installed successfully!\n"
  printf "  Run: ezra --version\n"
  printf "  Run: ezra new my_app && cd my_app && ezra run\n"
  printf "\n"
  printf "  Docs: https://ranaji114.github.io/Flux-programming-lang\n"
  printf "\n"
fi
