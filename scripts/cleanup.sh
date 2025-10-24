#!/usr/bin/env zsh
# Safe cleanup helper for this repo.
# Removes build outputs and node_modules folders inside workspace packages.
set -euo pipefail

echo "Removing dist/ and node_modules/ from workspace packages (api, web, root)"
rm -rf api/dist web/dist
# don't remove top-level node_modules unless user explicitly runs cleanup --all
if [[ "${1:-}" = "--all" ]]; then
  echo "Removing node_modules recursively (this can be slow)..."
  rm -rf node_modules api/node_modules web/node_modules
else
  echo "Skipping node_modules removal. Run ./scripts/cleanup.sh --all to remove node_modules in workspace packages."
fi

echo "Done." 
