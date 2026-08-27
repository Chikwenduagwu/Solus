#!/usr/bin/env bash
# Run this after `npm run compile:contracts` (or after re-running it once
# contract source changes). It copies:
#   - the generated TypeScript contract API into src/generated/<contract>
#     (imported directly by src/lib/midnight/contracts/*.ts)
#   - the zkir/keys artifacts into public/managed/<contract>, where
#     FetchZkConfigProvider fetches them from at runtime (see
#     src/lib/midnight/providers-full.ts)
#
# Both destinations are meant to be committed to the repo — Vercel's build
# step does not run the Compact compiler (it isn't installed there, and
# installing a Rust toolchain on every build would be slow and fragile).
# Compile contracts locally or in a separate CI job, run this script, then
# commit the results.

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for contract in auction registry; do
  echo "Syncing $contract..."
  mkdir -p "$ROOT/src/generated/$contract"
  cp "$ROOT/contracts/$contract/managed/contract/index.js" "$ROOT/src/generated/$contract/"
  cp "$ROOT/contracts/$contract/managed/contract/index.d.ts" "$ROOT/src/generated/$contract/"

  mkdir -p "$ROOT/public/managed/$contract"
  rm -rf "$ROOT/public/managed/$contract/keys" "$ROOT/public/managed/$contract/zkir"
  if [ -d "$ROOT/contracts/$contract/managed/keys" ]; then
    cp -r "$ROOT/contracts/$contract/managed/keys" "$ROOT/public/managed/$contract/"
  fi
  if [ -d "$ROOT/contracts/$contract/managed/zkir" ]; then
    cp -r "$ROOT/contracts/$contract/managed/zkir" "$ROOT/public/managed/$contract/"
  fi
done

echo "Done. If you compiled with --skip-zk, public/managed/*/keys will be"
echo "empty — that's expected; you need a full compile (real keys) before"
echo "proof generation will work end-to-end."
