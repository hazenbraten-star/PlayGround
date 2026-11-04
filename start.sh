#!/usr/bin/env bash
# Build the static game and serve the built output in the foreground.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_META_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
DIST_DIR="$PROJECT_DIR/dist"
PORT="${PORT:-3000}"

timed() {
  local label="$1"
  shift
  echo "[timing] $label"
  /usr/bin/time -p "$@"
}

cd "$PROJECT_DIR"

timed "create metadata directory" mkdir -p "$WEB_META_DIR"

# Install dependencies and run a framework build when the project has one.
if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    timed "install dependencies" npm ci --no-audit --no-fund
  else
    timed "install dependencies" npm install --no-audit --no-fund
  fi
  if node -e 'const p=require("./package.json");process.exit(p.scripts&&p.scripts.build?0:1)'; then
    timed "run package build" npm run build
  fi
fi

# This project is plain static HTML/CSS/JS, so its build is a clean copy.
# A package build that already produced dist/ is left untouched.
if [[ ! -f "$DIST_DIR/index.html" ]]; then
  timed "remove old build" rm -rf "$DIST_DIR"
  timed "create build directory" mkdir -p "$DIST_DIR"
  timed "copy static assets" cp index.html styles.css data.js game.js ui.js "$DIST_DIR/"
fi

timed "verify built index" test -s "$DIST_DIR/index.html"

timed "write deployment metadata" sh -c \
  'printf "{\"project\":\"%s\",\"directory\":\"%s\"}" "$1" "$2" > "$3/deployment-output.json"' \
  sh "$PROJECT_DIR" "$DIST_DIR" "$WEB_META_DIR"

echo "Serving $DIST_DIR on port $PORT"
exec python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$DIST_DIR"
