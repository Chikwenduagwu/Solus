"use client";

import { useEffect, useMemo, useState } from "react";
import { Gavel, Loader2, AlertCircle } from "lucide-react";
import { listAuctionViews, type AuctionView, type AuctionStatusLabel } from "@/lib/midnight/auction-view";
import { RegistryNotConfiguredError } from "@/lib/midnight/registry";
import { AuctionCard } from "@/components/auction/auction-card";
import { EmptyState } from "@/components/auction/empty-state";
import { cn } from "@/lib/utils";

const filters: { key: AuctionStatusLabel; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "created", label: "Upcoming" },
  { key: "settled", label: "Settled" },
];

export default function AuctionsPage() {
  const [filter, setFilter] = useState<AuctionStatusLabel>("active");
  const [auctions, setAuctions] = useState<AuctionView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    listAuctionViews()
      .then(setAuctions)
      .catch((err) => {
        if (err instanceof RegistryNotConfiguredError) {
          setNotConfigured(true);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load auctions.");
        }
      });
  }, []);

  const filtered = useMemo(
    () => (auctions ?? []).filter((a) => a.status === filter),
    [auctions, filter]
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">Private Auctions</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.key ? "bg-foreground text-white" : "text-muted hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {notConfigured && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3.5 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Registry not configured</p>
            <p className="mt-0.5 text-xs opacity-90">
              This deployment hasn&apos;t set NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS yet, so there&apos;s
              no way to enumerate auctions. See DEPLOYMENT.md.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3.5 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Couldn&apos;t reach the Midnight network</p>
            <p className="mt-0.5 text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {notConfigured ? null : auctions === null && !error ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading auctions from the network…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title={`No ${filter} auctions`}
          description={
            (auctions ?? []).length === 0
              ? "No auctions have been registered yet. Deploy one from Create to see it here."
              : "Check back soon, or explore other statuses above."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((auction) => (
            <AuctionCard key={auction.contractAddress} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
