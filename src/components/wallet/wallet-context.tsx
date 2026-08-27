"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  connectMidnightWallet,
  listAvailableWallets,
  type WalletConnection,
} from "@/lib/midnight/wallet";
import { ConnectWalletModal } from "./connect-wallet-modal";

interface WalletContextValue {
  wallet: WalletConnection | null;
  connecting: boolean;
  error: string | null;
  openConnectModal: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openConnectModal = useCallback(() => {
    if (wallet) return;
    setError(null);
    setModalOpen(true);
  }, [wallet]);

  const handleConnect = useCallback(async (key: string) => {
    setConnecting(true);
    setError(null);
    try {
      const conn = await connectMidnightWallet(key);
      setWallet(conn);
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // The DApp Connector API has no explicit disconnect call — a wallet
    // connection is scoped to the page session. We just drop our reference.
    setWallet(null);
  }, []);

  const value = useMemo(
    () => ({ wallet, connecting, error, openConnectModal, disconnect }),
    [wallet, connecting, error, openConnectModal, disconnect]
  );

  const availableWallets: { key: string; wallet: InitialAPI }[] =
    modalOpen ? listAvailableWallets() : [];

  return (
    <WalletContext.Provider value={value}>
      {children}
      <ConnectWalletModal
        open={modalOpen}
        connecting={connecting}
        error={error}
        availableWallets={availableWallets}
        onClose={() => setModalOpen(false)}
        onConnect={handleConnect}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
