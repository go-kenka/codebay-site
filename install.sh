#!/usr/bin/env bash
#
# install.sh — install the unsigned CodeBay preview on macOS.
#
#   curl -fsSL https://go-kenka.github.io/codebay-site/install.sh | bash -s -- --allow-unsigned
#
# What it does:
#   1. downloads CodeBay-<arch>.dmg from the latest preview release
#   2. verifies SHA256SUMS when available
#   3. copies CodeBay.app to /Applications (or ~/Applications)
#   4. ad-hoc signs it (or signs with --identity if you have your own cert)
#   5. optionally clears the quarantine attribute, then opens the app
#
# This is a stopgap for an unsigned build. It cannot make macOS trust the app
# the way an Apple Developer ID signature + notarization does. Only run it if
# you trust this build and understand that --allow-unsigned bypasses Gatekeeper.

set -eo pipefail

REPO="$CODEBAY_REPO"
if [ -z "$REPO" ]; then REPO="go-kenka/codebay-site"; fi
TAG="$CODEBAY_RELEASE_TAG"
if [ -z "$TAG" ]; then
  API="https://api.github.com/repos/$REPO/releases"
  RELEASES="$(curl -fsSL --retry 2 -H "Accept: application/vnd.github+json" "$API" 2>/dev/null || true)"
  TAG="$(printf '%s' "$RELEASES" | awk -F'"' '/"tag_name"/ {print $4; exit}')"
  if [ -z "$TAG" ]; then TAG="v0.1.0"; fi
fi
BASE="https://github.com/$REPO/releases/download/$TAG"

ARCH="$CODEBAY_ARCH"
if [ -z "$ARCH" ]; then ARCH="$(uname -m)"; fi
if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi
if [ "$(sysctl -in sysctl.proc_translated 2>/dev/null || true)" = "1" ]; then
  ARCH="arm64"
fi
case "$ARCH" in
  arm64|x86_64) ;;
  *) echo "unsupported architecture: $ARCH" >&2; exit 1 ;;
esac

FROM=""
IDENTITY=""
ALLOW_UNSIGNED=0
OPEN_AFTER=1
INSTALL_DIR="$CODEBAY_INSTALL_DIR"

while [ $# -gt 0 ]; do
  case "$1" in
    --from) FROM="$2"; shift 2 ;;
    --identity) IDENTITY="$2"; shift 2 ;;
    --install-dir) INSTALL_DIR="$2"; shift 2 ;;
    --allow-unsigned) ALLOW_UNSIGNED=1; shift ;;
    --no-open) OPEN_AFTER=0; shift ;;
    -h|--help)
      sed -n '2,25p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$INSTALL_DIR" ]; then
  if [ -w /Applications ]; then
    INSTALL_DIR="/Applications"
  else
    INSTALL_DIR="$HOME/Applications"
  fi
fi

if pgrep -x CodeBay >/dev/null 2>&1; then
  echo "CodeBay is running. Quit it before installing." >&2
  exit 1
fi

TMPROOT="$TMPDIR"
if [ -z "$TMPROOT" ]; then TMPROOT="/tmp"; fi
WORK="$(mktemp -d "$TMPROOT/codebay-install.XXXXXX")"
MNT="$WORK/mnt"
mkdir -p "$MNT"

cleanup() {
  hdiutil detach "$MNT" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

DMG="$WORK/CodeBay-$ARCH.dmg"
if [ -n "$FROM" ]; then
  case "$FROM" in
    http://*|https://*)
      echo "==> Downloading $FROM"
      curl -fL --retry 3 -o "$DMG" "$FROM"
      ;;
    *)
      if [ ! -f "$FROM" ]; then
        echo "No such file: $FROM" >&2
        exit 1
      fi
      cp "$FROM" "$DMG"
      ;;
  esac
else
  echo "==> Downloading $BASE/CodeBay-$ARCH.dmg"
  curl -fL --retry 3 -o "$DMG" "$BASE/CodeBay-$ARCH.dmg"
  if curl -fsL --retry 2 -o "$WORK/SHA256SUMS" "$BASE/SHA256SUMS"; then
    echo "==> Verifying SHA256SUMS for $ARCH"
    (cd "$WORK" && grep " CodeBay-$ARCH.dmg$" SHA256SUMS > "checksum-$ARCH" && shasum -a 256 -c "checksum-$ARCH")
  else
    echo "!! No SHA256SUMS in the release; continuing without a checksum."
    shasum -a 256 "$DMG"
  fi
fi

echo "==> Mounting"
hdiutil attach -nobrowse -readonly -mountpoint "$MNT" "$DMG" >/dev/null
if [ ! -d "$MNT/CodeBay.app" ]; then
  echo "CodeBay.app not found in the disk image." >&2
  exit 1
fi

TARGET="$INSTALL_DIR/CodeBay.app"
mkdir -p "$INSTALL_DIR"
if [ -d "$TARGET" ]; then
  EXISTING_ID="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$TARGET/Contents/Info.plist" 2>/dev/null || true)"
  if [ "$EXISTING_ID" != "com.codebay.CodeBay" ]; then
    echo "$TARGET exists but is not CodeBay; refusing to replace it." >&2
    exit 1
  fi
  echo "==> Removing previous install at $TARGET"
  rm -rf "$TARGET"
fi

echo "==> Installing to $TARGET"
ditto "$MNT/CodeBay.app" "$TARGET"

echo "==> Signing"
if [ -n "$IDENTITY" ]; then
  codesign --force --deep --options runtime --timestamp --sign "$IDENTITY" "$TARGET"
else
  codesign --force --deep --sign - "$TARGET"
fi
codesign --verify --deep --strict "$TARGET"

if [ "$ALLOW_UNSIGNED" = "1" ]; then
  echo "==> Removing quarantine attribute (Gatekeeper bypass)"
  xattr -dr com.apple.quarantine "$TARGET" 2>/dev/null || true
elif xattr -p com.apple.quarantine "$TARGET" >/dev/null 2>&1; then
  echo
  echo "This copy is quarantined and macOS will refuse to open it."
  echo "Either right-click CodeBay.app → Open, or re-run with --allow-unsigned."
fi

echo
echo "Installed: $TARGET"
if [ "$OPEN_AFTER" = "1" ]; then
  open "$TARGET"
fi
echo "Done. Unsigned preview: macOS may still warn; see the note above."
