import { readAuctionState } from "./auction";
import { listRegisteredAuctions } from "./registry";
import { decodeSymbol } from "./encoding";

export const AUCTION_STATUS = ["created", "active", "closed", "settled"] as const;
export type AuctionStatusLabel = (typeof AUCTION_STATUS)[number];

export interface AuctionView {
  contractAddress: string;
  status: AuctionStatusLabel;
  tokenSymbol: string;
  allocation: bigint;
  settlementAssetCode: string;
  startTime: bigint;
  endTime: bigint;
  minimumBid: bigint;
  minimumBidSize: bigint;
  maxAllocationPerBidder: bigint;
  clearingPrice: bigint;
  totalAllocated: bigint;
  bidCount: bigint;
}

/** Reads one auction's real ledger state and shapes it for display. */
export async function fetchAuctionView(contractAddress: string): Promise<AuctionView> {
  const ledger = await readAuctionState(contractAddress);
  return {
    contractAddress,
    status: AUCTION_STATUS[ledger.status] ?? "created",
    tokenSymbol: decodeSymbol(ledger.tokenSymbol),
    allocation: ledger.allocation,
    settlementAssetCode: decodeSymbol(ledger.settlementAssetCode),
    startTime: ledger.startTime,
    endTime: ledger.endTime,
    minimumBid: ledger.minimumBid,
    minimumBidSize: ledger.minimumBidSize,
    maxAllocationPerBidder: ledger.maxAllocationPerBidder,
    clearingPrice: ledger.clearingPrice,
    totalAllocated: ledger.totalAllocated,
    bidCount: ledger.bidCount,
  };
}

/**
 * Reads every auction registered in the registry contract. Addresses that
 * individually fail to load (e.g. one contract's ledger read fails) are
 * skipped rather than silently faked — callers should treat a short result
 * as "some auctions couldn't be read," not "fewer auctions exist." A
 * missing/unreachable registry itself throws (see listRegisteredAuctions)
 * rather than being folded into an empty list.
 */
export async function listAuctionViews(): Promise<AuctionView[]> {
  const addresses = await listRegisteredAuctions();
  const results = await Promise.allSettled(addresses.map(fetchAuctionView));
  return results
    .filter((r): r is PromiseFulfilledResult<AuctionView> => r.status === "fulfilled")
    .map((r) => r.value);
}
