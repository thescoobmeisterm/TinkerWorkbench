#!/usr/bin/env bash
# Start Tinkerer's Robot Lab and open it in the default browser.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5186}"
HOST="${HOST:-127.0.0.1}"
URL="http://${HOST}:${PORT}/"

already_up() {
  command -v curl >/dev/null 2>&1 && curl -fsS --max-time 1 "$URL" >/dev/null 2>&1
}

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || true
  fi
}

if already_up; then
  printf 'Tinkerers Robot Lab already running at %s\n' "$URL"
  open_browser
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  printf 'Python 3 is required to serve the lab.\n' >&2
  exit 1
fi

printf 'Starting Tinkerers Robot Lab at %s\n' "$URL"
printf 'Leave this window open. Close it or press Ctrl+C to stop.\n'

python3 -m http.server "$PORT" --bind "$HOST" &
pid=$!

cleanup() {
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 40); do
  if already_up; then
    open_browser
    wait "$pid"
    exit $?
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    wait "$pid" || true
    printf 'The lab server exited before it was ready.\n' >&2
    exit 1
  fi
  sleep 0.25
done

printf 'Timed out waiting for %s\n' "$URL" >&2
exit 1
