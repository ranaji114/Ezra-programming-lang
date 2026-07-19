#!/usr/bin/env sh
set -eu

REPO="${FLUX_REPO:-ranaji114/Flux-programming-lang}"
VERSION="${FLUX_VERSION:-latest}"
INSTALL_DIR="${FLUX_INSTALL_DIR:-$HOME/.local/bin}"

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS-$ARCH" in
  Linux-x86_64) ASSET="flux-linux-x86_64.tar.gz" ;;
  Darwin-x86_64) ASSET="flux-macos-x86_64.tar.gz" ;;
  Darwin-arm64) ASSET="flux-macos-aarch64.tar.gz" ;;
  *)
    echo "Unsupported platform: $OS-$ARCH" >&2
    exit 1
    ;;
esac

if [ "$VERSION" = "latest" ]; then
  RELEASE_URL="https://api.github.com/repos/$REPO/releases/latest"
else
  RELEASE_URL="https://api.github.com/repos/$REPO/releases/tags/$VERSION"
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Fetching Flux release metadata from $REPO..."
DOWNLOAD_URL="$(
  curl -fsSL "$RELEASE_URL" |
    sed -n "s/.*\"browser_download_url\": \"\\([^\"]*$ASSET\\)\".*/\\1/p" |
    head -n 1
)"

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Could not find release asset $ASSET in $REPO" >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"
echo "Downloading $ASSET..."
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/$ASSET"
tar -xzf "$TMP_DIR/$ASSET" -C "$INSTALL_DIR"

echo "Flux installed at $INSTALL_DIR/flux"
echo "Make sure $INSTALL_DIR is in PATH, then run: flux --version"
