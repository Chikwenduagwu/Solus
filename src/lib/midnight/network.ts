/**
 * Network configuration for the Midnight providers.
 *
 * Matches the endpoint shape documented at
 * https://docs.midnight.network/guides/midnight-local-network for the
 * local devnet, and is overridable via env vars for Testnet/Preprod.
 *
 * TODO(midnight): as of writing, Midnight has no mainnet — only Testnet /
 * Preprod and local devnet exist (see
 * https://docs.midnight.network/relnotes for the current network status).
 * There is no "production" network to point this at yet; treat these values
 * as pointing at whichever pre-mainnet network you're integrating against.
 */

export interface MidnightNetworkConfig {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  networkId: string;
}

const LOCAL_NETWORK: MidnightNetworkConfig = {
  indexer: "http://127.0.0.1:8088/api/v3/graphql",
  indexerWS: "ws://127.0.0.1:8088/api/v3/graphql/ws",
  node: "http://127.0.0.1:9944",
  proofServer: "http://127.0.0.1:6300",
  networkId: "undeployed",
};

/**
 * Reads network config from NEXT_PUBLIC_MIDNIGHT_* env vars, falling back
 * to the local devnet endpoints above. Set these in `.env.local` once you
 * have a local network (`docker compose` per the Midnight docs) or a
 * Testnet/Preprod indexer + proof server to point at.
 */
export function getNetworkConfig(): MidnightNetworkConfig {
  return {
    indexer: process.env.NEXT_PUBLIC_MIDNIGHT_INDEXER ?? LOCAL_NETWORK.indexer,
    indexerWS: process.env.NEXT_PUBLIC_MIDNIGHT_INDEXER_WS ?? LOCAL_NETWORK.indexerWS,
    node: process.env.NEXT_PUBLIC_MIDNIGHT_NODE ?? LOCAL_NETWORK.node,
    proofServer: process.env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER ?? LOCAL_NETWORK.proofServer,
    networkId: process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID ?? LOCAL_NETWORK.networkId,
  };
}

/** Registry contract address, set once you've deployed contracts/registry. */
export function getRegistryAddress(): string | undefined {
  return process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS;
}
