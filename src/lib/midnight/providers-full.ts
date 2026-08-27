/**
 * Full provider set for wallet-backed operations (deploy, commitBid,
 * closeAuction, settle, registerAuction) — everything callTx needs.
 *
 * IMPORTANT: this file statically imports
 * @midnight-ntwrk/midnight-js-level-private-state-provider, which pulls in
 * `level`'s Node backend (`classic-level`, a native addon). Confirmed by
 * running `next build`: if this module is imported anywhere Next.js
 * server-renders or statically prerenders (including the SSR pass of a
 * "use client" page), the build crashes looking for a native binary for
 * the build machine's exact Node ABI. In the browser, `level`'s bundler
 * "browser" condition swaps in an IndexedDB backend instead — so this
 * must only ever be reached via a dynamic `import()` inside a
 * client-triggered handler (a click, not component render), never a
 * static top-level import from a page or a component's module scope. See
 * auction.ts / registry.ts for the pattern.
 */

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { getNetworkConfig } from "./network";
import { buildWalletProvider, buildMidnightProvider } from "./wallet-provider-bridge";
import type { WalletConnection } from "./wallet";

/**
 * Base URL where each compiled contract's zkir/proving/verifier keys are
 * served from. In dev, point this at the `managed/<contract>` output
 * directory (e.g. via a static file server or Next.js public/ folder,
 * matching the layout `contracts/compile.sh` produces). This requires a
 * *full* compile (not --skip-zk) to have real keys to serve.
 */
function zkArtifactBaseUrl(contractName: "auction" | "registry"): string {
  const base = process.env.NEXT_PUBLIC_MIDNIGHT_ZK_ARTIFACTS_URL ?? "/managed";
  return `${base}/${contractName}`;
}

/**
 * NOTE ON PASSWORDS: levelPrivateStateProvider encrypts private state at
 * rest and requires a password provider + accountId. In this scaffold the
 * password is derived from the connected wallet's address purely so the
 * app runs end-to-end locally — replace this with a real user-supplied
 * passphrase (or a wallet-backed key-derivation flow) before handling real
 * funds. levelPrivateStateProvider has no recovery mechanism: losing this
 * storage loses the private bid data it protects.
 */
export function buildContractProviders(contractName: "auction" | "registry", wallet: WalletConnection) {
  const network = getNetworkConfig();
  setNetworkId(network.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(zkArtifactBaseUrl(contractName));
  const accountId = wallet.unshieldedAddress;

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStoragePasswordProvider: () => derivePrivateStatePassword(accountId),
      accountId,
    }),
    publicDataProvider: indexerPublicDataProvider(network.indexer, network.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(network.proofServer, zkConfigProvider),
    walletProvider: buildWalletProvider(wallet, network.networkId),
    midnightProvider: buildMidnightProvider(wallet, network.networkId),
  };
}

// TODO(midnight): replace with a real passphrase flow (user-entered,
// or derived via the wallet's own key-derivation) before going beyond
// local development. Every account currently shares a deterministic
// "password" derived only from its own address, which is not a secret.
function derivePrivateStatePassword(accountId: string): string {
  return `sealbid-dev-${accountId}-do-not-use-in-production`;
}
