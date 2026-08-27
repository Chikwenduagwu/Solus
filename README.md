# Seal — Private Token Auctions

Built for the **Midnight Buildathon**: a privacy-preserving sealed-bid
token auction application, running against real Compact contracts and the
real Midnight SDK — no mocked data, no fabricated proof states.

> Private bids. Publicly verifiable outcomes.

## What's real here

- **`contracts/`** — two Compact contracts, compiler-verified against
  Compact v0.31.1 (`compact compile`, not invented syntax). See
  `contracts/README.md`.
- **SDK integration** — real `@midnight-ntwrk/*` packages (v4.1.1):
  `dapp-connector-api` for wallet connection, `midnight-js-contracts` for
  deploy/call, `midnight-js-indexer-public-data-provider` for ledger
  reads, `midnight-js-level-private-state-provider` +
  `midnight-js-http-client-proof-provider` +
  `midnight-js-fetch-zk-config-provider` for proving.
- **No sample data** — the marketplace reads a real on-chain registry
  contract; auction cards read each auction's real ledger state; bid
  history is real `commitBid()` output stored locally (bid terms are
  private by design, so the bidder's own device is the only place that
  history can legitimately come from).
- **Verified build** — `next build` (Next.js 16, Turbopack) passes clean
  end-to-end, including two real bundler issues this SDK combination hits
  (see `DEPLOYMENT.md`).

## What isn't verified end-to-end

This was built in a sandbox with no reachable Midnight indexer, node, or
proof server, and no way to install a browser wallet. Every API call is
written against the real, currently-published SDK signatures — but the
full chain (connect a wallet → deploy → commit a bid → settle → verify)
has not been exercised against a live network. See "What's still
unverified end-to-end" in `DEPLOYMENT.md` before treating this as
production-ready. Also worth knowing: Midnight has no mainnet yet
(Testnet/Preprod only, see [docs.midnight.network/relnotes](https://docs.midnight.network/relnotes))
— "production" here means "real testnet-ready code," not a live mainnet
deployment.

## Getting started

```bash
npm install
npm run dev
```

The app builds and renders with zero configuration, but every page that
touches the network (auctions list, auction detail, bid, create) needs a
reachable Midnight network to do anything beyond show its empty/loading
state — see `.env.example` and `DEPLOYMENT.md`.

## Project structure

```
contracts/
  auction/src/auction.compact     real Compact contract
  registry/src/registry.compact   real Compact contract
  compile.sh                      wraps the real `compact` CLI
src/
  generated/                      compiled contract output (checked in)
  shims/                          isomorphic-ws browser fix (see DEPLOYMENT.md)
  app/                            routes (App Router)
  components/
    ui/                           Button, Badge, Card
    layout/                       NavBar, MobileTabBar
    auction/                      TokenAvatar, Countdown, AuctionCard, BidCard,
                                   SealedBidActivity, Stepper, DataRow, EmptyState,
                                   PrivacyIndicator, VerificationPanel
    wallet/                       ConnectWalletModal, WalletButton, WalletProvider
  lib/
    local-bids.ts                 on-device record of the user's own real bids
    midnight/
      network.ts                  endpoint config (env-var driven)
      wallet.ts                   real DApp Connector API wiring
      wallet-provider-bridge.ts   bridges connector string-txs to typed WalletProvider/MidnightProvider
      providers-public.ts         read-only provider (safe for SSR/prerender)
      providers-full.ts           wallet-backed providers (dynamic-import only — see DEPLOYMENT.md)
      contracts/                  CompiledContract bindings + witnesses
      auction.ts / registry.ts    deploy/call/read functions
      auction-view.ts             shapes raw ledger state for the UI
      encoding.ts                 Bytes<32>/hex helpers
```

## Privacy model

- **Public** — auction parameters, bid *count*, clearing price and total
  allocation once settled: all real ledger state, on-chain.
- **Private** — individual bid amount and price: supplied as Compact
  witnesses, never disclosed to the ledger — only a commitment hash is.
  Revealed locally, on-device, only to the bidder who submitted it.
- **Verifiable** — the verify page derives its checks from the auction's
  actual on-chain ledger state, not a static fabricated list. It's
  explicit about what it does and doesn't prove — see the note on
  `settle()` in `contracts/README.md`.

## Notes

- Light mode only, grid-line background as the core visual language, no
  gradients/glassmorphism.
- Fonts (Fraunces / IBM Plex Sans / IBM Plex Mono) load via
  `next/font/google` at build time — needs normal internet access to
  `npm run build`/`npm run dev` the first time.
- Mobile-first: bottom tab bar under 768px, responsive down to 360px.
