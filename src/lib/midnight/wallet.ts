"use client";

import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { getNetworkConfig } from "./network";

// Ensures window.midnight's global augmentation from the connector API
// package is loaded.
import "@midnight-ntwrk/dapp-connector-api";

export interface WalletConnection {
  api: ConnectedAPI;
  rdns: string;
  name: string;
  shieldedAddress: string;
  unshieldedAddress: string;
}

/**
 * Lists wallets that have injected the DApp Connector API into
 * `window.midnight` (e.g. Lace, once its Midnight-beta build is installed).
 * Returns an empty array outside the browser or if no compatible wallet is
 * present — callers should surface that as "install a Midnight wallet"
 * rather than silently failing.
 */
export function listAvailableWallets(): { key: string; wallet: InitialAPI }[] {
  if (typeof window === "undefined" || !window.midnight) return [];
  return Object.entries(window.midnight).map(([key, wallet]) => ({ key, wallet }));
}

/**
 * Connects to a specific injected wallet by its `window.midnight` key.
 * Mirrors the connection example in the DApp Connector API docs:
 * https://docs.midnight.network/api-reference/dapp-connector
 */
export async function connectMidnightWallet(walletKey: string): Promise<WalletConnection> {
  const wallet = window.midnight?.[walletKey];
  if (!wallet) {
    throw new Error(
      `No wallet found at window.midnight.${walletKey}. Install a Midnight-compatible wallet (e.g. Lace) first.`
    );
  }

  const { networkId } = getNetworkConfig();
  const api = await wallet.connect(networkId);
  const { shieldedAddress } = await api.getShieldedAddresses();
  const { unshieldedAddress } = await api.getUnshieldedAddress();

  return {
    api,
    rdns: wallet.rdns,
    name: wallet.name,
    shieldedAddress,
    unshieldedAddress,
  };
}
