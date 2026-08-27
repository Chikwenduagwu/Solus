# Review notes — changes made in this pass

Scope: cloned the repo fresh, installed deps, ran `next build` + `eslint`,
drove the app with a headless browser (all pages, mobile viewport, the
wallet-connect flow), read through the wallet/contract/registry code paths,
then fixed what was found. Everything below was verified against a real
`npm run build` + `npx eslint .` (both clean) and a live `npm run start`
session after each change.

## Real bugs fixed

1. **Registry-unconfigured state was indistinguishable from "zero
   auctions."** `listRegisteredAuctions()` silently returned `[]` when
   `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` wasn't set — the exact state
   this repo is in out of the box. The marketplace showed "No auctions
   have been registered yet. Deploy one from Create to see it here," which
   is actively misleading: creating one wouldn't help, because the
   registry isn't configured at all. Added `RegistryNotConfiguredError`
   and a distinct banner ("Registry not configured... see DEPLOYMENT.md").
   — `src/lib/midnight/registry.ts`, `src/lib/midnight/auction-view.ts`,
   `src/app/auctions/page.tsx`

2. **Create flow could burn a real on-chain deploy before discovering
   registration would fail.** `handleLaunch()` called `deployAuction()`
   (a real, fee-costing transaction) *before* `registerAuction()`, and
   the latter throws immediately if no registry is configured. That
   ordering meant a user could pay to deploy an auction contract that
   then silently fails to register — an orphaned, undiscoverable auction.
   Added a pre-flight check that fails fast, before any deploy call, if
   the registry isn't configured. — `src/app/create/page.tsx`

3. **Network reads could hang ~12s on a spinner with zero feedback.**
   `readAuctionState` / `listRegisteredAuctions` had no client-side
   timeout, so an unreachable indexer left users staring at "Loading
   auction from the network…" for 10+ seconds (the SDK's own internal
   retry/backoff) before anything happened. Added a 6s timeout with a
   clear message. — `src/lib/midnight/with-timeout.ts` (new),
   `src/lib/midnight/auction.ts`, `src/lib/midnight/registry.ts`

4. **Misleadingly-named field that duplicated a private value.**
   `LocalBidRecord.commitmentHex` held the exact same value as `salt`
   (confirmed by the code's own comment: "the on-chain value is the
   hash, not the salt") — but the name implies it's the public
   commitment hash. A field named like public on-chain data that's
   actually the private salt is a real footgun for anyone extending this
   later. Removed the redundant field; call sites now use `salt`
   directly. — `src/lib/local-bids.ts`, `src/app/auctions/[id]/bid/page.tsx`,
   `src/app/bids/page.tsx`

5. **Misleading error message on invalid form input.** The "Create
   Auction" launch handler wrapped everything in one try/catch, so a bad
   number in any field (e.g. empty allocation) surfaced as "Failed to
   deploy auction. Check that the network and proof server are
   reachable" — blaming infrastructure for a client-side input problem.
   Added real validation with accurate, field-specific messages before
   attempting anything. — `src/app/create/page.tsx`

6. **`setState` called synchronously inside a `useEffect` body**
   (`src/app/bids/page.tsx`), the kind of pattern that causes extra
   cascading renders. `wallet` is always `null` during server
   rendering/first paint (it's only set from a user click), so the local
   bid list is now derived with `useMemo` instead of copied into state
   via an effect — same behavior, no unnecessary render.

7. **Full page reload instead of client navigation.** `create/page.tsx`
   used `window.location.href = "/auctions"` after a successful launch.
   Swapped for `useRouter().push()`.

8. **Missing token avatar on the auction detail page.** `TokenAvatar` was
   imported but never rendered (an unused-import lint error), while the
   auction list cards did show it. Extracted the color-per-symbol logic
   into `src/lib/utils.ts` so both places share it, and rendered the
   avatar in the detail header for visual consistency.

9. **ESLint was linting its own generated output.** The Compact-compiler
   output checked into `contracts/**/managed/` and `src/generated/` isn't
   hand-written, but wasn't excluded, so `npx eslint .` failed on files
   nobody should be editing directly. Added proper ignores, plus a
   project-wide `argsIgnorePattern`/`varsIgnorePattern: "^_"` so the
   existing underscore-prefix convention for intentionally-unused
   params (already used in the code, e.g. `_ttl`) is actually honored.

## Verified, not changed

- `npm run build` — passes clean (as the README claims).
- Wallet connection code (`wallet.ts`) — the `getShieldedAddresses()` /
  `getUnshieldedAddress()` destructuring matches the real
  `@midnight-ntwrk/dapp-connector-api` type declarations exactly, despite
  the plural method name being easy to second-guess.
- Mobile bottom tab bar — looked broken in a full-page screenshot
  (appeared mid-page instead of pinned to the bottom), but that's a
  known Playwright full-page-screenshot artifact with `position: fixed`
  elements, not an app bug. Confirmed correct with a viewport-only
  screenshot and a `getComputedStyle` check.

## What I could not test

There is no browser-extension wallet (Lace or otherwise) available in
this sandbox, and no reachable Midnight indexer/node/proof server. So:

- The "Connect Wallet" flow was exercised and correctly shows a
  "No Midnight wallet detected" state — but a real wallet-extension
  connection, signing, and submission was never exercised, matching
  exactly what the repo's own README and DEPLOYMENT.md already disclose.
- No real `deployAuction` / `commitBid` / `settle` call was made against
  a live network, since none was reachable. All fixes for these paths
  were verified through code review, `next build`/TypeScript checking,
  and by simulating the "unreachable network" failure state end-to-end
  (confirmed the new timeout and error messaging actually fire).

Before treating this as production-ready, the one thing to do that I
couldn't do here: a real smoke test against a live Testnet/Preprod
Midnight network with an actual Lace wallet installed — deploy the
registry, set `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS`, connect a real
wallet, deploy an auction, commit a bid, settle it.
