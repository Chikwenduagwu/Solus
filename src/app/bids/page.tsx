"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Wallet } from "lucide-react";
import { getLocalBids } from "@/lib/local-bids";
import { fetchAuctionView, type AuctionView } from "@/lib/midnight/auction-view";
import { BidCard } from "@/components/auction/bid-card";
import { EmptyState } from "@/components/auction/empty-state";
import { useWallet } from "@/components/wallet/wallet-context";
import { Button } from "@/components/ui/button";

export default function MyBidsPage() {
  const { wallet, openConnectModal } = useWallet();
  const [auctions, setAuctions] = useState<Record<string, AuctionView | null>>({});

  // `wallet` is always null during server rendering and on first paint (it's
  // only set from a user-triggered connect action), so this never touches
  // localStorage outside the browser — safe to derive during render instead
  // of stashing a copy in state via an effect.
  const bids = useMemo(
    () => (wallet ? getLocalBids(wallet.unshieldedAddress) : []),
    [wallet]
  );

  useEffect(() => {
    const uniqueAddresses = Array.from(new Set(bids.map((b) => b.auctionContractAddress)));
    uniqueAddresses.forEach((address) => {
      fetchAuctionView(address)
        .then((view) => setAuctions((prev) => ({ ...prev, [address]: view })))
        .catch(() => setAuctions((prev) => ({ ...prev, [address]: null })));
    });
  }, [bids]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <h1 className="mb-6 font-display text-3xl">My Bids</h1>

      {!wallet ? (
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Bids you commit are recorded locally on the device you used to submit them."
          action={
            <Button className="mt-2" onClick={openConnectModal}>
              Connect Wallet
            </Button>
          }
        />
      ) : bids.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No bids yet"
          description="Bids you commit to an auction from this device will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {bids.map((bid) => (
            <BidCard
              key={bid.salt}
              bid={bid}
              auction={auctions[bid.auctionContractAddress] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
