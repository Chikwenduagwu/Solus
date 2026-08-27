/**
 * Adapts @midnight-ntwrk/wallet's `Wallet` (built from a seed, for
 * scripts/CI — no browser required) to the WalletProvider/MidnightProvider
 * interfaces midnight-js-contracts expects. This is a cleaner, more direct
 * mapping than src/lib/midnight/wallet-provider-bridge.ts (the browser
 * DApp Connector version), because this Wallet's balanceTransaction /
 * proveTransaction / submitTransaction already operate on typed
 * Transaction objects — no hex-string round trip needed.
 *
 * Verified against the installed @midnight-ntwrk/wallet-api's real Wallet
 * interface (balanceTransaction returns a ProvingRecipe, which
 * proveTransaction turns into a proven Transaction).
 */

import { firstValueFrom } from "rxjs";
import type { Wallet } from "@midnight-ntwrk/wallet-api";

export async function buildHeadlessWalletProvider(wallet: Wallet) {
  const state = await firstValueFrom(wallet.state());

  return {
    getCoinPublicKey: () => state.coinPublicKey,
    getEncryptionPublicKey: () => state.encryptionPublicKey,
    async balanceTx(tx: Parameters<Wallet["balanceTransaction"]>[0], _ttl?: Date) {
      const recipe = await wallet.balanceTransaction(tx, []);
      const proven = await wallet.proveTransaction(recipe as never);
      return proven as never; // FinalizedTransaction — see file header
    },
  };
}

export function buildHeadlessMidnightProvider(wallet: Wallet) {
  return {
    async submitTx(tx: Parameters<Wallet["submitTransaction"]>[0]) {
      return wallet.submitTransaction(tx);
    },
  };
}
