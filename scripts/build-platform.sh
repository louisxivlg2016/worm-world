#!/usr/bin/env bash
set -euo pipefail
PLATFORM="${1:?Usage: $0 <platform>}"
bunx vite build --mode "$PLATFORM"
rm -rf "builds/$PLATFORM" && mkdir -p "builds/$PLATFORM"
cp -r dist/. "builds/$PLATFORM"/
