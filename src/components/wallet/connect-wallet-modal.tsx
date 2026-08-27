"use client";

import { X, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

interface ConnectWalletModalProps {
  open: boolean;
  connecting: boolean;
  error: string | null;
  availableWallets: { key: string; wallet: InitialAPI }[];
  onClose: () => void;
  onConnect: (key: string) => void;
}

export function ConnectWalletModal({
  open,
  connecting,
  error,
  availableWallets,
  onClose,
  onConnect,
}: ConnectWalletModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e0f12]/40 backdrop-blur-[2px] md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl border border-border bg-surface p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:rounded-2xl md:shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl">Connect wallet</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-4 rounded-lg border border-border bg-grid bg-[length:16px_16px] py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-surface">
            <ShieldCheck size={26} className="text-accent" />
          </div>
          <p className="max-w-[220px] text-center text-sm text-muted">
            Your wallet is used to commit bids and receive settlement.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {availableWallets.length === 0 ? (
          <div className="mb-2 rounded-lg border border-border-strong px-4 py-3.5 text-center text-sm text-muted">
            No Midnight wallet detected. Install a Midnight-compatible
            wallet (e.g. Lace, Midnight beta build) and reload this page.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {availableWallets.map(({ key, wallet }) => (
              <button
                key={key}
                onClick={() => onConnect(key)}
                disabled={connecting}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border-strong px-4 py-3.5 text-sm font-medium transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-70"
                )}
              >
                <span>{wallet.name}</span>
                {connecting ? <Loader2 size={16} className="animate-spin" /> : null}
              </button>
            ))}
          </div>
        )}

        <p className="mt-5 text-center text-xs text-muted-2">
          We never store your private keys. Your data stays private.
        </p>
      </div>
    </div>
  );
}
