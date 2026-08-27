# Deploying to Vercel

This app is a standard Next.js 16 App Router project — `vercel deploy` or
connecting the repo in the Vercel dashboard works with no special
configuration for Next.js itself. The things below are specific to this
project's Midnight integration.

## 1. Don't run the Compact compiler in the Vercel build

The `compact` CLI is a Rust toolchain, not an npm package — Vercel's build
image doesn't have it, and installing it on every build would be slow and
fragile. Instead:

- Compile contracts locally (or in a separate CI job that has the
  toolchain) with `npm run compile:contracts`.
- Run `npm run sync:contracts` to copy the output into `src/generated/`
  and `public/managed/`.
- Commit both directories.

`npm run build` (what Vercel actually runs) never touches the compiler —
it only imports the already-generated TypeScript in `src/generated/` and
serves the already-compiled artifacts in `public/managed/` as static
files.

## 2. Environment variables

Set the variables in `.env.example` under Project Settings → Environment
Variables. They're all `NEXT_PUBLIC_*` because the wallet connection,
contract calls, and ledger reads all happen in the browser — there is no
server-side secret to protect here. At minimum you need:

- `NEXT_PUBLIC_MIDNIGHT_INDEXER` / `_INDEXER_WS` — pointing at a reachable
  Midnight indexer (local devnet or Testnet/Preprod)
- `NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER` — a proof server reachable **from
  the browser**, not just from Vercel's servers (proving happens
  client-side). If you only have a local proof server, deployed users
  won't be able to submit real transactions until you run one somewhere
  publicly reachable, or bidders run their own locally.
- `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` — set once you've deployed
  `contracts/registry` (see `contracts/README.md`)

## 3. Real ZK keys, not `--skip-zk`

This scaffold's committed `public/managed/*/keys` directories are empty
(compiled with `--skip-zk` in an environment that couldn't reach
Midnight's key-generation service). The deployed app will build and
render fine, but any real `commitBid`/`settle`/etc. call will fail at the
proving step until you run a full `compact compile` (not `--skip-zk`)
somewhere with network access and re-run `npm run sync:contracts`.

## 4. Things already handled for you

Two real, non-obvious build issues were found and fixed while building
this against Turbopack (Next.js 16's default bundler) — you shouldn't
need to touch these, but they're worth knowing about if you upgrade
dependencies later:

- **`isomorphic-ws` / `graphql-ws` named-export mismatch**: fixed via
  `turbopack.resolveAlias` in `next.config.ts`, pointing at
  `src/shims/isomorphic-ws-browser.ts`. Turbopack's static ESM analysis
  correctly caught a real mismatch between what `graphql-ws` expects and
  what `isomorphic-ws`'s browser build exports.
- **`level`/`classic-level` native binding during prerender**:
  `@midnight-ntwrk/midnight-js-level-private-state-provider` pulls in a
  native Node addon that has no prebuilt binary for every possible build
  ABI, and — more importantly — has no business running during
  server-side prerendering anyway (it's meant to run in the browser via
  IndexedDB). Fixed by splitting `providers-full.ts` (wallet-write path,
  dynamically imported only inside click handlers) from
  `providers-public.ts` (read-only, statically imported everywhere,
  including pages Next.js prerenders). If you add new wallet-write
  functionality, dynamically import `providers-full.ts` the same way
  `auction.ts`/`registry.ts` do — don't import it at a page or component's
  top level.

## 5. What's still unverified end-to-end

None of this was exercised against a real deployed Vercel instance talking
to a real Midnight network, because no Midnight indexer/node/proof server
was reachable from the sandbox this was built in. `next build` passes
cleanly and every type checks, which rules out an entire class of
deploy-time failures — but a live smoke test (connect a real wallet,
deploy a real auction, commit a real bid) against your own network is the
one step you should do before treating this as production-ready.
