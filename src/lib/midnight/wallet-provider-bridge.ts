/**
 * midnight-js-contracts needs a `WalletProvider` (balances a transaction)
 * and a `MidnightProvider` (submits a transaction) — see its README's
 * `ContractProviders` shape. The DApp Connector API a browser wallet
 * injects operates on hex-encoded, serialized transaction strings instead
 * (`balanceUnsealedTransaction`, `submitTransaction`) — see wallet.ts.
 *
 * This bridges the two using @midnight-ntwrk/ledger's own
 * `Transaction.serialize`/`Transaction.deserialize`/`.toString()` methods
 * (confirmed present in the installed ledger package's type declarations).
 * This exact bridge has not been exercised against a real wallet from this
 * sandbox — treat it as the piece most in need of a smoke test on your end
 * before trusting it with real funds.
 */

import type { WalletConnection } from "./wallet";

// Minimal structural typing for the ledger Transaction methods we call,
// since the concrete UnboundTransaction/FinalizedTransaction types from
// @midnight-ntwrk/midnight-js-types are branded wrappers around it.
interface LedgerLikeTransaction {
  serialize(networkId: string): Uint8Array;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function buildWalletProvider(wallet: WalletConnection, networkId: string) {
  return {
    getCoinPublicKey: () => {
      // TODO(midnight): getShieldedAddresses() also returns
      // shieldedCoinPublicKey — wire that through WalletConnection if a
      // circuit needs it synchronously; connect() already fetches it once.
      throw new Error("getCoinPublicKey: wire shieldedCoinPublicKey through WalletConnection.");
    },
    getEncryptionPublicKey: () => {
      throw new Error("getEncryptionPublicKey: wire shieldedEncryptionPublicKey through WalletConnection.");
    },
    async balanceTx(tx: LedgerLikeTransaction) {
      const hex = bytesToHex(tx.serialize(networkId));
      const { tx: balancedHex } = await wallet.api.balanceUnsealedTransaction(hex);
      return hexToBytes(balancedHex);
    },
  };
}

export function buildMidnightProvider(wallet: WalletConnection, networkId: string) {
  return {
    async submitTx(tx: LedgerLikeTransaction) {
      const hex = bytesToHex(tx.serialize(networkId));
      await wallet.api.submitTransaction(hex);
      // TODO(midnight): return the real TransactionId — derive it from
      // `tx.identifiers()` (see @midnight-ntwrk/ledger's Transaction class)
      // once this is wired against a live wallet and its exact shape can
      // be confirmed against what midnight-js-contracts expects back.
      return hex;
    },
  };
}
