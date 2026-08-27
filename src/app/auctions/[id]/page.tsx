"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, AlertCircle, Loader2 } from "lucide-react";
import { fetchAuctionView, type AuctionView } from "@/lib/midnight/auction-view";
import { TokenAvatar } from "@/components/auction/token-avatar";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/auction/countdown";
import { DataRow } from "@/components/auction/data-row";
import { Button } from "@/components/ui/button";
import { GridCard, Card } from "@/components/ui/card";
import { colorForSymbol, formatToken } from "@/lib/utils";

const statusVariant = {
  created: "upcoming",
  active: "active",
  closed: "upcoming",
  settled: "settled",
} as const;

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
        <Link href="/auctions" className="mt-5 inline-block text-sm text-accent">
          Back to Auctions
        </Link>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> Loading auction from the network…
      </div>
    );
  }

  const isSettled = auction.status === "settled";

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/auctions"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Auction Detail
        </Link>
        <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-accent-soft">
          <Share2 size={15} />
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TokenAvatar symbol={auction.tokenSymbol} color={colorForSymbol(auction.tokenSymbol)} />
          <div>
            <p className="font-medium">{auction.tokenSymbol}</p>
            <p className="font-mono text-xs text-muted">
              {auction.contractAddress.slice(0, 10)}...{auction.contractAddress.slice(-8)}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[auction.status]} dotted>
          {auction.status}
        </Badge>
      </div>

      <Card className="mb-6 p-5">
        <p className="font-display text-3xl">
          {formatToken(Number(auction.allocation))}{" "}
          <span className="text-xl text-muted">{auction.tokenSymbol}</span>
        </p>
        <p className="mt-1 text-sm text-muted">Private sealed-bid auction</p>

        <div className="mt-5 border-t border-border pt-1">
          <DataRow
            label="Contract Address"
            value={`${auction.contractAddress.slice(0, 10)}...`}
          />
          <DataRow
            label={isSettled ? "Closed" : "Closes in"}
            value={
              isSettled ? (
                new Date(Number(auction.endTime) * 1000).toLocaleDateString()
              ) : (
                <Countdown target={new Date(Number(auction.endTime) * 1000).toISOString()} />
              )
            }
          />
          <DataRow label="Settlement Asset" value={auction.settlementAssetCode} />
          <DataRow label="Mechanism" value="Uniform-price" mono={false} />
          <DataRow label="Bid count" value={auction.bidCount.toString()} />
        </div>
      </Card>

      {isSettled ? (
        <GridCard className="mb-6 p-6 text-center">
          <p className="text-sm text-muted">This auction has settled.</p>
          <Button className="mt-4" asChild>
            <Link href={`/auctions/${auction.contractAddress}/result`}>View Result</Link>
          </Button>
        </GridCard>
      ) : (
        <>
          <Card className="mb-6 p-5">
            <div className="mb-4">
              <p className="font-medium">Bid activity</p>
              <p className="text-sm text-muted">Bid values remain private until settlement.</p>
            </div>
            <p className="text-2xl font-mono">{auction.bidCount.toString()}</p>
            <p className="mt-1 text-xs text-muted-2">sealed bid commitments recorded on-chain</p>
            <p className="mt-4 text-xs leading-relaxed text-muted-2">
              Individual bid prices and sizes are not visible during the auction — only
              the commitment count is public.
            </p>
          </Card>

          <Button size="lg" className="w-full" asChild>
            <Link href={`/auctions/${auction.contractAddress}/bid`}>Submit Private Bid</Link>
          </Button>
        </>
      )}
    </div>
  );
}
