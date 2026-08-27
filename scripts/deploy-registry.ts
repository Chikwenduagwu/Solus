/**
 * Deploys the registry contract from a terminal — no browser wallet
 * required. Run this once, from wherever you have a funded Midnight
 * seed and network access (a Codespace, CI, your machine).
 *
 * Usage:
 *   MIDNIGHT_SEED=<64-char hex seed> \
 *   NEXT_PUBLIC_MIDNIGHT_INDEXER=... \
 *   NEXT_PUBLIC_MIDNIGHT_INDEXER_WS=... \
 *   NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER=... \
 *   NEXT_PUBLIC_MIDNIGHT_NODE=... \
 *   NEXT_PUBLIC_MIDNIGHT_NETWORK_ID=undeployed \
 *   npx tsx scripts/deploy-registry.ts
 *
 * The seed is a BIP32-compatible mnemonic seed phrase, hex-encoded — see
 * https://docs.midnight.network for how to generate/fund one on your
 * target network. NEVER commit a real seed; pass it as an env var.
 *
 * This has not been run against a live network from the environment this
 * repo was built in (no reachable indexer/proof-server there) — treat
 * this as the first thing to smoke-test, not as pre-verified.
 */

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { NetworkId } from "@midnight-ntwrk/zswap";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import {
  buildHeadlessWalletProvider,
  buildHeadlessMidnightProvider,
} from "../src/lib/midnight/headless-wallet-bridge";
import { getRegistryCompiledContract } from "../src/lib/midnight/contracts/registry-contract";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function main() {
  const seed = requireEnv("MIDNIGHT_SEED");
  const indexer = requireEnv("NEXT_PUBLIC_MIDNIGHT_INDEXER");
  const indexerWs = requireEnv("NEXT_PUBLIC_MIDNIGHT_INDEXER_WS");
  const proofServer = requireEnv("NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER");
  const node = requireEnv("NEXT_PUBLIC_MIDNIGHT_NODE");
  const networkIdStr = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID ?? "undeployed";
  const networkId = networkIdStr === "undeployed" ? NetworkId.Undeployed : NetworkId.DevNet;

  setNetworkId(networkIdStr);

  console.log("Building wallet from seed...");
  const wallet = await WalletBuilder.build(indexer, indexerWs, proofServer, node, seed, networkId);
  wallet.start();

  try {
    console.log("Waiting for wallet sync...");
    // NOTE: a real script should wait for wallet.state()'s syncProgress to
    // reach 100% (or a "isFullySynced"-style condition) before deploying,
    // so it isn't spending against a stale balance. Left as a TODO here —
    // exact sync-completion signal wasn't independently verified.

    const zkConfigProvider = new FetchZkConfigProvider(
      process.env.NEXT_PUBLIC_MIDNIGHT_ZK_ARTIFACTS_URL
        ? `${process.env.NEXT_PUBLIC_MIDNIGHT_ZK_ARTIFACTS_URL}/registry`
        : "./public/managed/registry"
    );

    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStoragePasswordProvider: () => `sealbid-registry-deploy-${seed.slice(0, 8)}`,
        accountId: "registry-deployer",
      }),
      publicDataProvider: indexerPublicDataProvider(indexer, indexerWs),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(proofServer, zkConfigProvider),
      walletProvider: await buildHeadlessWalletProvider(wallet),
      midnightProvider: buildHeadlessMidnightProvider(wallet),
    };

    console.log("Deploying registry contract...");
    const compiledContract = getRegistryCompiledContract();
    const deployed = await deployContract(providers as never, { compiledContract } as never);
    const address = (deployed as { deployTxData: { public: { contractAddress: string } } }).deployTxData
      .public.contractAddress;

    console.log("\nRegistry deployed at:");
    console.log(address);
    console.log("\nSet this in your .env.local / Vercel env vars:");
    console.log(`NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=${address}`);
  } finally {
    await wallet.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
