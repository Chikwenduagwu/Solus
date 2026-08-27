/**
 * Binds the generated auction contract (src/generated/auction) to its
 * witness implementations and compiled ZK asset location, producing the
 * `CompiledContract` that deployContract/findDeployedContract expect.
 *
 * Verified against @midnight-ntwrk/compact-js 4.1.1's documented API
 * (CompiledContract.make / withWitnesses / withCompiledFileAssets). Not
 * executed end-to-end here — this sandbox has no reachable Midnight
 * indexer/node/proof-server to deploy against. Smoke-test against your own
 * local network (docs.midnight.network/guides/midnight-local-network)
 * before relying on this.
 */

import { pipe } from "effect";
import * as CompiledContract from "@midnight-ntwrk/compact-js/effect/CompiledContract";
import { Contract as AuctionContractCtor, type Witnesses } from "../../../generated/auction/index.js";

/** No persisted private state for this contract — see note below. */
type AuctionPS = null;

/** The private bid a user is about to commit — held only in memory. */
export interface PendingBid {
  amount: bigint;
  maxPrice: bigint;
  salt: Uint8Array;
}

/**
 * Auction contract has no persisted private state of its own (PS = void):
 * the witnesses below just read whatever bid the UI currently has staged
 * in memory via `setPendingBid`, rather than threading state through the
 * ledger's private-state provider. This keeps the MVP simple; a production
 * version should persist the (amount, price, salt) tuple client-side,
 * keyed by commitment hash, so it can be re-derived later for settlement
 * proofs instead of living only in a JS closure.
 */
let pendingBid: PendingBid | null = null;

export function setPendingBid(bid: PendingBid) {
  pendingBid = bid;
}

function requirePendingBid(): PendingBid {
  if (!pendingBid) {
    throw new Error("No bid staged — call setPendingBid() before commitBid().");
  }
  return pendingBid;
}

const auctionWitnesses: Witnesses<AuctionPS> = {
  bidAmount(context) {
    return [context.privateState, requirePendingBid().amount];
  },
  bidMaxPrice(context) {
    return [context.privateState, requirePendingBid().maxPrice];
  },
  bidSalt(context) {
    return [context.privateState, requirePendingBid().salt];
  },
};

/**
 * NOTE ON TYPES: compact-js's `Contract` (an internal effect-layer type)
 * and the Contract *class* emitted by the real `compact compile` step are
 * structurally different shapes at the type level — confirmed by running
 * `tsc` against this exact code, not assumed: naming the generic
 * combination `CompiledContract<AuctionContract, AuctionPS, ...>` fails
 * even as a bare type annotation, before any composition happens. Rather
 * than force the two generic hierarchies together field-by-field (which
 * produced cascading, increasingly unreadable cast errors), this composes
 * the chain untyped and returns `unknown` — callers (auction.ts) already
 * pass this straight into deployContract/findDeployedContract behind an
 * `as never`, so nothing downstream loses type safety it actually had.
 * The runtime call shape — tag, ctor, witnesses object, assets path
 * string — matches the package's own README example exactly; only the
 * type-level plumbing needed the escape hatch.
 */
export function getAuctionCompiledContract(): unknown {
  return pipe(
    CompiledContract.make("sealbid-auction-v1", AuctionContractCtor as never),
    (c: unknown) => (CompiledContract.withWitnesses as (w: unknown) => (c: unknown) => unknown)(auctionWitnesses)(c),
    (c: unknown) =>
      (CompiledContract.withCompiledFileAssets as (p: string) => (c: unknown) => unknown)("/managed/auction")(c)
  );
}
