"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { fetchAuctionView, type AuctionView } from "@/lib/midnight/auction-view";
import { getLocalBids } from "@/lib/local-bids";
import { useWallet } from "@/components/wallet/wallet-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatToken, formatUsd } from "@/lib/utils";

const journey = [
  "Private during auction",
  "Bids committed",
  "Auction closed",
  "Rules executed",
  "Public result",
];

export default function AuctionResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { wallet } = useWallet();
  const [auction, setAuction] = useState<AuctionView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuctionView(id)
      .then(setAuction)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load auction."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <AlertCircle size={28} className="mx-auto mb-3 text-warning" />
        <p className="font-medium">Couldn&apos;t load this auction</p>
        <p className="mt-1.5 text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> Loading result from the network…
      </div>
    );
  }

  const myBid = wallet
    ? getLocalBids(wallet.unshieldedAddress).find((b) => b.auctionContractAddress === id)
    : undefined;
  const myPriceCents = myBid ? BigInt(myBid.maxPrice) : null;
  const won = myPriceCents !== null && auction.clearingPrice > 0n && auction.clearingPrice <= myPriceCents;

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/auctions/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Auction Result
        </Link>
        <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-accent-soft">
          <Share2 size={15} />
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <CheckCircle2 size={18} className="text-success" />
        <p className="font-medium">Auction Settled</p>
      </div>

      <Card className="mb-6 grid grid-cols-2 divide-x divide-border overflow-hidden p-0">
        <div className="p-5">
          <p className="text-xs text-muted-2">Clearing Price</p>
          <p className="mt-1 font-display text-2xl">
            {auction.clearingPrice > 0n ? formatUsd(Number(auction.clearingPrice) / 100) : "—"}{" "}
            <span className="text-sm text-muted">{auction.settlementAssetCode}</span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-2">Total Allocated</p>
          <p className="mt-1 font-display text-2xl">
            {formatToken(Number(auction.totalAllocated))}{" "}
            <span className="text-sm text-muted">{auction.tokenSymbol}</span>
          </p>
        </div>
        <div className="border-t border-border p-5">
          <p className="text-xs text-muted-2">Bid Commitments</p>
          <p className="mt-1 font-mono text-lg">{auction.bidCount.toString()}</p>
        </div>
        <div className="border-t border-border p-5">
          <p className="text-xs text-muted-2">On-chain Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 size={14} /> Settled
          </p>
        </div>
      </Card>

      {myBid && (
        <Card className="mb-6 p-5">
          <p className="mb-4 text-sm font-medium">Your Result</p>
          {won ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-2">Your Allocation</p>
                <p className="mt-1 font-mono text-lg">
                  {formatToken(Number(BigInt(myBid.amount)))} {auction.tokenSymbol}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-2">Settlement</p>
                <p className="mt-1 font-mono text-lg">
                  {formatUsd((Number(BigInt(myBid.amount)) * Number(auction.clearingPrice)) / 100)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Your bid&apos;s maximum price was below the clearing price — it wasn&apos;t filled.
            </p>
          )}
        </Card>
      )}

      <Card className="mb-6 p-5">
        <p className="mb-4 text-sm font-medium">What happened</p>
        <ol className="flex flex-col gap-3">
          {journey.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border-strong font-mono text-[10px] text-muted">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Button size="lg" className="w-full" asChild>
        <Link href={`/auctions/${id}/verify`}>Verify Auction</Link>
      </Button>
    </div>
  );
}
