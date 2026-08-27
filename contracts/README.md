# Contracts

Two real Compact contracts, both verified against Compact compiler v0.31.1
(`compact compile`, not `--skip-zk`, produces real proving/verifier keys —
this repo's committed artifacts were generated with `--skip-zk` since the
sandbox that built this scaffold couldn't reach Midnight's trusted-setup
key-generation service; see "Full compile" below for what changes with
real keys).

- `auction/src/auction.compact` — the sealed-bid auction: create → open →
  commitBid (sealed) → close → settle → verifyCommitment.
- `registry/src/registry.compact` — a discovery registry so the frontend
  can enumerate deployed auctions without a centralized backend.

## Prerequisites

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
compact update   # installs and selects the latest compactc
```

## Compiling

```bash
npm run compile:contracts           # full compile — generates real ZK keys
npm run compile:contracts:skip-zk   # TypeScript output only, no keys (fast, for iterating on contract logic)
npm run sync:contracts              # copies output into src/generated/ and public/managed/
```

A full compile downloads trusted-setup parameters from Midnight's
key-generation service on first run and can take a while. `--skip-zk` is
what this scaffold currently ships with — it's enough to develop and
type-check against the generated TypeScript API, but proof generation
(and therefore real transactions) requires the full compile's keys.

## Deploying

You need a running Midnight network and proof server to deploy against —
either the [local devnet](https://docs.midnight.network/guides/midnight-local-network)
or Testnet/Preprod (see [docs.midnight.network/relnotes](https://docs.midnight.network/relnotes)
for current network status — Midnight has no mainnet yet).

1. Deploy the registry once, from a terminal (no browser needed):

   ```bash
   MIDNIGHT_SEED=<your hex seed> \
   NEXT_PUBLIC_MIDNIGHT_INDEXER=... \
   NEXT_PUBLIC_MIDNIGHT_INDEXER_WS=... \
   NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER=... \
   NEXT_PUBLIC_MIDNIGHT_NODE=... \
   npm run deploy:registry
   ```

   This uses `@midnight-ntwrk/wallet`'s headless, seed-based wallet — not
   the browser DApp Connector the rest of the app uses — since a terminal
   has no injected `window.midnight`. See `scripts/deploy-registry.ts`.
   It prints the deployed contract address when done.
2. Put the resulting address in `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS`.
3. From then on, the `/create` page's "Lock Allocation & Launch Auction"
   deploys a new auction contract and registers it automatically.

## What's intentionally not here

`settle()` trusts its caller to have computed the correct uniform-price
clearing outcome off-chain — the contract does not verify that
computation inside a circuit. A fully trustless version would need the
auction operator to submit a ZK proof that the published clearing price
and allocation are the correct output of the uniform-price rule applied
to every committed bid. That's a meaningful circuit-design problem on its
own, and this scaffold calls it out explicitly rather than faking it.
