#!/bin/bash
# Build with Expo and push dist to worm-world-dist repo
set -e

DIST_REPO="$HOME/worm-world-dist"
SRC_REPO="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Building Expo web export ==="
cd "$SRC_REPO"
bunx expo export --platform web

echo "=== Syncing to dist repo ==="
# Clean old files (except .git)
find "$DIST_REPO" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy new build
cp -r "$SRC_REPO/dist/"* "$DIST_REPO/"

echo "=== Committing and pushing ==="
cd "$DIST_REPO"
HASH=$(cd "$SRC_REPO" && git rev-parse --short HEAD)
git add -A
git commit -m "Build from $HASH at $(date +%Y-%m-%d_%H:%M:%S)" || echo "Nothing to commit"
git push origin main

echo "=== Done! ==="
