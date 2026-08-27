"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Stepper } from "@/components/auction/stepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataRow } from "@/components/auction/data-row";
import { deployAuction } from "@/lib/midnight/auction";
import { registerAuction } from "@/lib/midnight/registry";
import { getRegistryAddress } from "@/lib/midnight/network";
import { encodeSymbol, fromHex } from "@/lib/midnight/encoding";
import { useWallet } from "@/components/wallet/wallet-context";
import { cn } from "@/lib/utils";

const steps = ["Token", "Allocation", "Mechanism", "Duration", "Rules", "Review"];

export default function CreateAuctionPage() {
  const router = useRouter();
  const { wallet, openConnectModal } = useWallet();
  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launched, setLaunched] = useState<string | null>(null);

  const [tokenSymbol, setTokenSymbol] = useState("NOVA");
  const [allocation, setAllocation] = useState("1000000");
  const [settlementAsset, setSettlementAsset] = useState<"USDC" | "USDT">("USDC");
  const [durationHours, setDurationHours] = useState("48");
  const [minimumBid, setMinimumBid] = useState("0.50");
  const [minimumBidSize, setMinimumBidSize] = useState("1000");
  const [maxAllocationPerBidder, setMaxAllocationPerBidder] = useState("250000");

  function validationError(): string | null {
    if (!tokenSymbol.trim()) return "Token symbol is required.";
    if (!Number.isFinite(Number(allocation)) || Number(allocation) <= 0)
      return "Allocation must be a positive number.";
    if (!Number.isFinite(Number(durationHours)) || Number(durationHours) <= 0)
      return "Duration must be a positive number of hours.";
    if (!Number.isFinite(Number(minimumBid)) || Number(minimumBid) < 0)
      return "Minimum bid must be zero or a positive number.";
    if (!Number.isFinite(Number(minimumBidSize)) || Number(minimumBidSize) <= 0)
      return "Minimum bid size must be a positive number.";
    if (!Number.isFinite(Number(maxAllocationPerBidder)) || Number(maxAllocationPerBidder) <= 0)
      return "Max allocation per bidder must be a positive number.";
    return null;
  }

  async function handleLaunch() {
    if (!wallet) {
      openConnectModal();
      return;
    }
    const invalid = validationError();
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!getRegistryAddress()) {
      setError(
        "This deployment has no registry configured (NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS is unset), " +
          "so a launched auction couldn't be registered for the marketplace to find. Not deploying — see DEPLOYMENT.md."
      );
      return;
    }
    setLaunching(true);
    setError(null);
    try {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const { contractAddress } = await deployAuction(wallet, {
        tokenSymbol: encodeSymbol(tokenSymbol),
        allocation: BigInt(allocation),
        settlementAssetCode: encodeSymbol(settlementAsset),
        startTime: now,
        endTime: now + BigInt(Number(durationHours) * 3600),
        minimumBid: BigInt(Math.round(Number(minimumBid) * 100)),
        minimumBidSize: BigInt(minimumBidSize),
        maxAllocationPerBidder: BigInt(maxAllocationPerBidder),
      });
      await registerAuction(wallet, fromHex(contractAddress));
      setLaunched(contractAddress);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deploy auction. Check that the network and proof server are reachable."
      );
    } finally {
      setLaunching(false);
    }
  }

  if (launched) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="font-display text-2xl">Auction launched</h1>
        <p className="mt-2 break-all text-sm text-muted">
          {tokenSymbol} auction deployed at {launched} and is now locked and accepting
          private bids.
        </p>
        <Button className="mt-6" onClick={() => router.push("/auctions")}>
          View Auctions
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:py-10">
      <h1 className="mb-6 font-display text-3xl">Create Auction</h1>

      <Stepper steps={steps} currentStep={step} />

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3.5 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <Card className="my-8 p-5 sm:p-6">
        {step === 0 && (
          <div>
            <p className="mb-4 font-medium">Token symbol</p>
            <input
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0, 12))}
              className="w-full rounded-lg border border-border-strong bg-transparent px-3.5 py-3 font-mono text-sm outline-none focus:border-accent"
              placeholder="NOVA"
            />
            <p className="mt-2 text-xs text-muted">
              Recorded on-chain as the auction&apos;s token symbol. Up to 12 characters.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-4 font-medium">Define allocation</p>
            <label className="mb-1.5 block text-sm text-muted">Amount for sale</label>
            <div className="mb-4 flex items-center rounded-lg border border-border-strong focus-within:border-accent">
              <input
                type="number"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                className="w-full bg-transparent px-3.5 py-3 font-mono text-sm outline-none"
              />
              <span className="pr-3.5 font-mono text-xs text-muted-2">{tokenSymbol}</span>
            </div>
            <label className="mb-1.5 block text-sm text-muted">Settlement asset</label>
            <div className="flex gap-2">
              {(["USDC", "USDT"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setSettlementAsset(a)}
                  className={cn(
                    "cursor-pointer rounded-lg border px-4 py-2 font-mono text-sm transition-colors",
                    settlementAsset === a ? "border-accent bg-accent-soft" : "border-border"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 font-medium">Choose auction mechanism</p>
            <div className="rounded-lg border border-accent bg-accent-soft p-4">
              <p className="font-mono text-sm">Uniform-price sealed bid</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Eligible winning bidders receive allocation at the clearing
                price determined by the auction rules.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-4 font-medium">Set duration</p>
            <label className="mb-1.5 block text-sm text-muted">Auction length (hours)</label>
            <input
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-transparent px-3.5 py-3 font-mono text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className="font-medium">Define rules</p>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Minimum bid ({settlementAsset})</label>
              <input
                type="number"
                step="0.01"
                value={minimumBid}
                onChange={(e) => setMinimumBid(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-transparent px-3.5 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Minimum bid size ({tokenSymbol})</label>
              <input
                type="number"
                value={minimumBidSize}
                onChange={(e) => setMinimumBidSize(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-transparent px-3.5 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">
                Max allocation per bidder ({tokenSymbol})
              </label>
              <input
                type="number"
                value={maxAllocationPerBidder}
                onChange={(e) => setMaxAllocationPerBidder(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-transparent px-3.5 py-3 font-mono text-sm outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="mb-4 font-medium">Review</p>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-2">Public</p>
            <div className="mb-5 border-t border-border pt-1">
              <DataRow label="Token" value={tokenSymbol} />
              <DataRow label="Allocation" value={`${allocation} ${tokenSymbol}`} />
              <DataRow label="Auction duration" value={`${durationHours}h`} />
              <DataRow label="Settlement asset" value={settlementAsset} />
              <DataRow label="Auction mechanism" value="Uniform-price" mono={false} />
            </div>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-2">Private</p>
            <div className="border-t border-border pt-1">
              <DataRow label="Individual bid prices" value="Hidden" mono={false} />
              <DataRow label="Individual bid sizes" value="Hidden" mono={false} />
              <DataRow label="Bidder-specific information" value="Hidden" mono={false} />
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft size={16} /> Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button size="lg" className="flex-1" onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight size={16} />
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={handleLaunch} disabled={launching}>
            {launching ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Deploying contract…
              </>
            ) : (
              "Lock Allocation & Launch Auction"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
