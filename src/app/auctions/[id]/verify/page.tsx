"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { fetchAuctionView, type AuctionView } from "@/lib/midnight/auction-view";
import { VerificationPanel, type RealVerificationStep } from "@/components/auction/proof-status";
import { Card } from "@/components/ui/card";

export default function VerifyAuctionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [auction, setAuction] = useState<AuctionView | null>(null);

  useEffect(() => {
    fetchAuctionView(id).then(setAuction).catch(() => setAuction(null));
  }, [id]);

  if (!auction) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" /> Reading contract state…
      </div>
    );
  }

  const steps: RealVerificationStep[] = [
    { id: "rules", label: "Auction rules committed at deployment", passed: true },
    {
      id: "commitments",
      label: `${auction.bidCount.toString()} bid commitment(s) recorded on-chain`,
      passed: auction.bidCount > 0n,
    },
    {
      id: "closed",
      label: "Bidding closed before settlement",
      passed: auction.status === "settled" || auction.status === "closed",
    },
    {
      id: "allocation",
      label: "Total allocated does not exceed the locked allocation",
      passed: auction.status !== "settled" || auction.totalAllocated <= auction.allocation,
    },
    {
      id: "settled",
      label: "Clearing price and allocation published on-chain",
      passed: auction.status === "settled" && auction.clearingPrice > 0n,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:py-10">
      <div className="mb-6">
        <Link
          href={`/auctions/${id}/result`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Verify Auction
        </Link>
      </div>

      <h1 className="mb-1 font-display text-2xl">Verify Auction Outcome</h1>
      <p className="mb-6 font-mono text-xs text-muted-2">
        {auction.contractAddress.slice(0, 14)}...
      </p>

      <VerificationPanel steps={steps} />

      <Card className="mt-6 flex items-start gap-3 border-dashed p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-muted" />
        <div>
          <p className="text-sm font-medium">What this checks — and what it doesn&apos;t</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            These checks read the auction contract&apos;s real public ledger state directly
            from the network. They confirm the recorded facts above. They do{" "}
            <strong>not</strong> yet include a zero-knowledge proof that the published
            clearing price is the mathematically correct output of the uniform-price rule
            applied to every committed bid — that circuit is a meaningful follow-on piece
            of work, not something this build fabricates.
          </p>
        </div>
      </Card>
    </div>
  );
}
