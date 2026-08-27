"use client";

import { useState } from "react";
import { Eye, Lock } from "lucide-react";
import type { LocalBidRecord } from "@/lib/local-bids";
import type { AuctionView } from "@/lib/midnight/auction-view";
import { Badge } from "@/components/ui/badge";
import { DataRow } from "./data-row";
import { formatToken, formatUsd } from "@/lib/utils";

export function BidCard({ bid, auction }: { bid: LocalBidRecord; auction: AuctionView | null }) {
  const [revealed, setRevealed] = useState(false);
  const amount = BigInt(bid.amount);
  const maxPriceCents = BigInt(bid.maxPrice);

  const won = auction?.status === "settled" && auction.clearingPrice > 0n && auction.clearingPrice <= maxPriceCents;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-medium">{auction?.tokenSymbol ?? "Unknown"}</p>
          <p className="text-xs text-muted">
            {bid.auctionContractAddress.slice(0, 10)}...{bid.auctionContractAddress.slice(-6)}
          </p>
        </div>
        <Badge variant={won ? "won" : auction?.status === "settled" ? "settled" : "active"} dotted>
          {auction?.status === "settled" ? (won ? "won" : "not filled") : "committed"}
        </Badge>
      </div>

      {auction?.status === "settled" ? (
        <div className="border-t border-border pt-1">
          <DataRow
            label="Clearing Price"
            value={auction.clearingPrice > 0n ? formatUsd(Number(auction.clearingPrice) / 100) : "—"}
          />
          {won && (
            <DataRow
              label="Settlement"
              value={formatUsd((Number(amount) * Number(auction.clearingPrice)) / 100)}
            />
          )}
        </div>
      ) : (
        <div>
          <p className="mb-1 text-sm font-medium">Bid committed</p>
          <p className="mb-4 text-xs text-muted">Private terms protected</p>
          <div className="border-t border-border pt-1">
            <DataRow
              label="Submitted"
              value={new Date(bid.submittedAt).toLocaleDateString()}
              mono={false}
            />
          </div>
        </div>
      )}

      <div className="mt-3">
        {revealed ? (
          <div className="rounded-lg border border-border bg-[#F7F7F4] p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Lock size={11} /> Visible only to you, on this device
              </p>
              <button onClick={() => setRevealed(false)} className="cursor-pointer text-xs text-accent">
                Hide
              </button>
            </div>
            <DataRow label="Amount" value={`${formatToken(Number(amount))} ${auction?.tokenSymbol ?? ""}`} />
            <DataRow label="Max Price" value={formatUsd(Number(maxPriceCents) / 100)} />
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border-strong py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Eye size={14} />
            View Private Bid
          </button>
        )}
      </div>
    </div>
  );
}
