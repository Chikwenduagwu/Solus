import Link from "next/link";
import { Users } from "lucide-react";
import type { AuctionView } from "@/lib/midnight/auction-view";
import { TokenAvatar } from "./token-avatar";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "./countdown";
import { PrivacyIndicator } from "./privacy-indicator";
import { colorForSymbol, formatToken, formatUsd } from "@/lib/utils";

const statusLabel: Record<AuctionView["status"], string> = {
  created: "Upcoming",
  active: "Active",
  closed: "Closing",
  settled: "Settled",
};

const statusVariant: Record<AuctionView["status"], "active" | "upcoming" | "settled"> = {
  created: "upcoming",
  active: "active",
  closed: "upcoming",
  settled: "settled",
};

export function AuctionCard({ auction }: { auction: AuctionView }) {
  const endDate = new Date(Number(auction.endTime) * 1000).toISOString();
  const startDate = new Date(Number(auction.startTime) * 1000).toISOString();

  return (
    <Link
      href={`/auctions/${auction.contractAddress}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <TokenAvatar symbol={auction.tokenSymbol} color={colorForSymbol(auction.tokenSymbol)} />
          <div>
            <p className="font-mono text-sm font-medium">{auction.tokenSymbol}</p>
            <p className="text-xs text-muted">
              {auction.contractAddress.slice(0, 8)}...{auction.contractAddress.slice(-6)}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[auction.status]} dotted>
          {statusLabel[auction.status]}
        </Badge>
      </div>

      <div>
        <p className="font-display text-2xl">
          {formatToken(Number(auction.allocation))}{" "}
          <span className="text-lg text-muted">{auction.tokenSymbol}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted">Private sealed auction</p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
        {auction.status === "active" || auction.status === "created" ? (
          <div>
            <p className="text-muted-2">{auction.status === "active" ? "Ends in" : "Starts in"}</p>
            <Countdown
              target={auction.status === "active" ? endDate : startDate}
              className="text-sm text-foreground"
            />
          </div>
        ) : (
          <div>
            <p className="text-muted-2">Clearing price</p>
            <p className="font-mono text-sm">
              {auction.clearingPrice > 0n ? formatUsd(Number(auction.clearingPrice)) : "—"}
            </p>
          </div>
        )}

        {auction.bidCount > 0n && (
          <div className="flex items-center gap-1.5 text-muted">
            <Users size={13} />
            <span className="font-mono">{auction.bidCount.toString()}</span>
          </div>
        )}

        <PrivacyIndicator />
      </div>
    </Link>
  );
}
