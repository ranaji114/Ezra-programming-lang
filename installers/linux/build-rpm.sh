#!/usr/bin/env bash
# Build an .rpm package for Ezra (Fedora/RHEL/openSUSE)
# Author: Ankur Rana
# Usage: ./build-rpm.sh [version]
# Requires: rpmbuild
set -euo pipefail

VERSION="${1:-1.0.0}"
RELEASE="1"
ARCH="x86_64"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BINARY="$ROOT/target/release/ezra"

if [[ ! -f "$BINARY" ]]; then
  echo "ERROR: $BINARY not found. Run: cargo build --release" >&2
  exit 1
fi

# Set up rpmbuild tree
RPMBUILD="$HOME/rpmbuild"
mkdir -p "$RPMBUILD"/{SOURCES,SPECS,BUILD,RPMS,SRPMS}

# Create source tarball
TARNAME="ezra-lang-${VERSION}"
TARBALL="$RPMBUILD/SOURCES/${TARNAME}.tar.gz"
mkdir -p "/tmp/${TARNAME}/bin"
cp "$BINARY" "/tmp/${TARNAME}/bin/ezra"
[[ -f "$ROOT/target/release/ezra-lsp" ]] && cp "$ROOT/target/release/ezra-lsp" "/tmp/${TARNAME}/bin/"
cp -r "$ROOT/examples" "/tmp/${TARNAME}/"
cp -r "$ROOT/std"      "/tmp/${TARNAME}/"
cp "$ROOT/README.md"   "/tmp/${TARNAME}/"
cp "$ROOT/LICENSE"     "/tmp/${TARNAME}/"
tar -czf "$TARBALL" -C /tmp "$TARNAME"
rm -rf "/tmp/${TARNAME}"

# Write spec file
cat > "$RPMBUILD/SPECS/ezra-lang.spec" << SPEC
Name:           ezra-lang
Version:        $VERSION
Release:        ${RELEASE}%{?dist}
Summary:        Ezra scripting language interpreter
License:        MIT
URL:            https://ranaji114.github.io/Flux-programming-lang
Source0:        %{name}-%{version}.tar.gz
BuildArch:      $ARCH

%description
Ezra is a readable, indentation-based scripting language built in Rust.
Created by Ankur Rana.

%prep
%setup -q

%install
install -Dm755 bin/ezra           %{buildroot}/usr/bin/ezra
[ -f bin/ezra-lsp ] && install -Dm755 bin/ezra-lsp %{buildroot}/usr/bin/ezra-lsp || true
cp -r examples %{buildroot}/usr/share/ezra/
cp -r std      %{buildroot}/usr/share/ezra/
install -Dm644 README.md %{buildroot}/usr/share/doc/ezra-lang/README.md
install -Dm644 LICENSE   %{buildroot}/usr/share/licenses/ezra-lang/LICENSE

%post
echo "Ezra $VERSION installed. Run: ezra --version"
echo "Created by Ankur Rana — https://github.com/ranaji114"

%files
/usr/bin/ezra
%ghost /usr/bin/ezra-lsp
/usr/share/ezra/
/usr/share/doc/ezra-lang/
/usr/share/licenses/ezra-lang/

%changelog
* $(date "+%a %b %d %Y") Ankur Rana <ankur@ranaji114.github.io> - $VERSION-$RELEASE
- Initial RPM release
SPEC

# Build
rpmbuild -bb "$RPMBUILD/SPECS/ezra-lang.spec"
RPM_FILE="$RPMBUILD/RPMS/${ARCH}/ezra-lang-${VERSION}-${RELEASE}$(rpm --eval %dist).${ARCH}.rpm"
if [[ -f "$RPM_FILE" ]]; then
  cp "$RPM_FILE" "./ezra-lang-${VERSION}.${ARCH}.rpm"
  sha256sum "./ezra-lang-${VERSION}.${ARCH}.rpm" | tee -a SHA256SUMS
  echo "Built: ezra-lang-${VERSION}.${ARCH}.rpm"
else
  echo "RPM built in: $RPMBUILD/RPMS/${ARCH}/"
  ls "$RPMBUILD/RPMS/${ARCH}/"
fi
