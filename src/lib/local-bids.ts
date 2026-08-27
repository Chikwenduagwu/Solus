/**
 * The auction contract deliberately never reveals bid amount/price — that's
 * the point. So the only place a bidder's own bid history can come from is
 * their own device. This stores the bid terms and the salt used to commit
 * them, keyed by wallet address, in localStorage. Nothing here is sample
 * data — it's populated only after a real commitBid() call.
 *
 * Note: `salt` is private — it's what lets the bidder later prove their
 * commitment preimage. Don't add a field here that duplicates it under a
 * name like "commitmentHex"; that reads as safe-to-share on-chain data
 * when it isn't.
 */

export interface LocalBidRecord {
  auctionContractAddress: string;
  amount: string; // bigint serialized as string
  maxPrice: string;
  salt: string; // hex — private, do not treat as a public commitment hash
  submittedAt: string; // ISO
}

function storageKey(walletAddress: string) {
  return `sealbid:bids:${walletAddress}`;
}

export function recordLocalBid(walletAddress: string, record: LocalBidRecord) {
  if (typeof window === "undefined") return;
  const existing = getLocalBids(walletAddress);
  existing.push(record);
  window.localStorage.setItem(storageKey(walletAddress), JSON.stringify(existing));
}

export function getLocalBids(walletAddress: string): LocalBidRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey(walletAddress));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalBidRecord[];
  } catch {
    return [];
  }
}
