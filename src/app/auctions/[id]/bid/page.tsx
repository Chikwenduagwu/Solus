"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Loader2, AlertCircle } from "lucide-react";
import { fetchAuctionView, type AuctionView } from "@/lib/midnight/auction-view";
import { commitBid } from "@/lib/midnight/auction";
import { randomSalt, toHex } from "@/lib/midnight/encoding";
import { recordLocalBid } from "@/lib/local-bids";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataRow } from "@/components/auction/data-row";
import { useWallet } from "@/components/wallet/wallet-context";

export default function SubmitBidPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { wallet, openConnectModal } = useWallet();

  const [auction, setAuction] = useState<AuctionView | null>(null);
  const [amount, setAmount] = useState("250000");
  const [maxPrice, setMaxPrice] = useState("1.83");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ saltHex: string; submittedAt: string } | null>(null);

  useEffect(() => {
    fetchAuctionView(id).then(setAuction).catch(() => setAuction(null));
  }, [id]);

  async function handleSubmit() {
    if (!wallet) {
      openConnectModal();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const salt = randomSalt();
      const bid = {
        amount: BigInt(amount),
        maxPrice: BigInt(Math.round(Number(maxPrice) * 100)), // stored as integer cents
        salt,
      };
      await commitBid(wallet, id, bid);

      const submittedAt = new Date().toISOString();
      const saltHex = toHex(salt);
      recordLocalBid(wallet.unshieldedAddress, {
        auctionContractAddress: id,
        amount: bid.amount.toString(),
        maxPrice: bid.maxPrice.toString(),
        salt: saltHex,
        submittedAt,
      });
      setReceipt({ saltHex, submittedAt });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to commit bid. Check that the network and proof server are reachable."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-md px-5 py-8 sm:py-12">
        <div className="mb-6 flex items-center">
          <Link
            href={`/auctions/${id}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Bid Committed
          </Link>
        </div>

        <div className="flex flex-col items-center py-6 text-center">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Check size={28} />
          </span>
          <h1 className="font-display text-2xl">Your bid has been committed privately.</h1>
        </div>

        <Card className="mb-6 p-5">
          <p className="mb-1 text-sm font-medium">Commitment Receipt</p>
          <div className="border-t border-border pt-1">
            <DataRow label="Commitment Salt" value={receipt.saltHex.slice(0, 12) + "..."} />
            <DataRow label="Auction Contract" value={`${id.slice(0, 10)}...`} />
            <DataRow
              label="Submitted At"
              value={new Date(receipt.submittedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              mono={false}
            />
            <DataRow
              label="Status"
              value={
                <Badge variant="active" dotted>
                  committed
                </Badge>
              }
              mono={false}
            />
          </div>
        </Card>

        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-border bg-accent-soft/40 p-3.5 text-xs text-muted">
          <Lock size={14} className="mt-0.5 shrink-0 text-accent" />
          Your bid terms are stored only on this device and encrypted on-chain as a
          commitment hash — no one else can see them until you choose to reveal.
        </div>

        <Button size="lg" className="w-full" onClick={() => router.push("/bids")}>
          View My Bids
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6 sm:py-10">
      <div className="mb-6">
        <Link
          href={`/auctions/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Submit Private Bid
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-medium">{auction?.tokenSymbol ?? "…"}</p>
          <p className="font-mono text-xs text-muted">{id.slice(0, 10)}...</p>
        </div>
        <Badge variant="active" dotted>
          Active
        </Badge>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3.5 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium">Amount</label>
        <div className="flex items-center rounded-lg border border-border-strong focus-within:border-accent">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent px-3.5 py-3 font-mono text-sm outline-none"
          />
          <span className="pr-3.5 font-mono text-xs text-muted-2">
            {auction?.tokenSymbol ?? ""}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium">Maximum Price</label>
        <div className="flex items-center rounded-lg border border-border-strong focus-within:border-accent">
          <input
            type="number"
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-transparent px-3.5 py-3 font-mono text-sm outline-none"
          />
          <span className="pr-3.5 font-mono text-xs text-muted-2">
            {auction?.settlementAssetCode ?? ""}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium">From Wallet</label>
        <div className="flex items-center justify-between rounded-lg border border-border-strong px-3.5 py-3 text-sm">
          {wallet ? (
            <span className="font-mono text-xs">
              {wallet.unshieldedAddress.slice(0, 10)}...{wallet.unshieldedAddress.slice(-6)}
            </span>
          ) : (
            <button onClick={openConnectModal} className="cursor-pointer text-sm text-accent">
              Connect wallet to continue
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-border bg-accent-soft/40 p-3.5 text-xs text-muted">
        <Lock size={14} className="mt-0.5 shrink-0 text-accent" />
        Your bid amount and price are proven against the auction&apos;s rules inside a
        zero-knowledge circuit and never leave this device in the clear.
      </div>

      <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Proving and committing bid…
          </>
        ) : (
          "Commit Bid"
        )}
      </Button>
    </div>
  );
}
