#!/usr/bin/env bash
# Capture desktop and mobile screenshots of an already-running preview.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

: "${CAPTURE_URL:?CAPTURE_URL must be set to the exact preview URL}"
: "${CAPTURE_DIR:?CAPTURE_DIR must be set to an output directory outside the project}"

case "$CAPTURE_DIR" in
  "$PROJECT_DIR"|"$PROJECT_DIR"/*)
    echo "CAPTURE_DIR must be outside the project source: $CAPTURE_DIR" >&2
    exit 1
    ;;
esac

timed() {
  local label="$1"
  shift
  echo "[timing] $label"
  /usr/bin/time -p "$@"
}

timed "create capture directory" mkdir -p "$CAPTURE_DIR"

# capture.mjs launches the installed Playwright browser, waits for the rendered
# board, starts the game, writes both isolated screenshots, and closes its own
# browser. It returns 75 for temporary navigation/browser failures and 1 for
# script or rendering defects.
CAPTURE_URL="$CAPTURE_URL" \
CAPTURE_DIR="$CAPTURE_DIR" \
  timed "capture desktop and mobile screenshots" \
  node "$PROJECT_DIR/capture.mjs"

timed "verify desktop screenshot" test -s "$CAPTURE_DIR/final-desktop.png"
timed "verify mobile screenshot" test -s "$CAPTURE_DIR/final-mobile.png"

echo "Captured: $CAPTURE_DIR/final-desktop.png"
echo "Captured: $CAPTURE_DIR/final-mobile.png"
