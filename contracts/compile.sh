#!/usr/bin/env bash
# Compiles both Compact contracts using the official `compact` CLI toolchain.
#
# Prerequisites (see contracts/README.md):
#   curl --proto '=https' --tlsv1.2 -LsSf \
#     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
#   compact update   # installs + selects the latest compactc
#
# Usage:
#   ./contracts/compile.sh            # full build, generates ZK proving keys
#   ./contracts/compile.sh --skip-zk  # TypeScript output only, no keys
#
# Generating proving keys downloads the trusted-setup parameters from
# Midnight's key-generation service and can take a while on first run;
# --skip-zk is useful while iterating on contract logic and TypeScript
# integration before you need real proofs.

set -euo pipefail
FLAG="${1:-}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Compiling auction.compact..."
compact compile $FLAG "$ROOT/auction/src/auction.compact" "$ROOT/auction/managed"

echo "Compiling registry.compact..."
compact compile $FLAG "$ROOT/registry/src/registry.compact" "$ROOT/registry/managed"

echo "Done. Generated contract APIs:"
echo "  $ROOT/auction/managed/contract/index.d.ts"
echo "  $ROOT/registry/managed/contract/index.d.ts"
