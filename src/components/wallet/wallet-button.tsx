"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "./wallet-context";
import { Button } from "@/components/ui/button";

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const { wallet, openConnectModal, disconnect } = useWallet();

  if (wallet) {
    return (
      <button
        onClick={disconnect}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-strong px-3.5 py-2 font-mono text-xs transition-colors hover:border-accent"
        title="Disconnect wallet"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {truncate(wallet.unshieldedAddress)}
      </button>
    );
  }

  return (
    <Button variant="dark" size="sm" onClick={openConnectModal} className="gap-1.5">
      <Wallet size={14} />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </Button>
  );
}
