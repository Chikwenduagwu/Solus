/**
 * Auction registry: deploy once, then every created auction registers its
 * address here so the marketplace page can enumerate auctions without a
 * centralized backend. Same real-SDK caveats as auction.ts, and the same
 * static-vs-dynamic-import split — see providers-full.ts for why write
 * operations must dynamically import it instead of importing it at the
 * top of this file.
 */

import { deployContract, findDeployedContract, getPublicStates } from "@midnight-ntwrk/midnight-js-contracts";
import { getRegistryCompiledContract } from "./contracts/registry-contract";
import { buildPublicDataProvider } from "./providers-public";
import { getRegistryAddress } from "./network";
import { withTimeout } from "./with-timeout";
import { toHex } from "./encoding";
import { ledger } from "../../generated/registry/index.js";
import type { WalletConnection } from "./wallet";

/** Deploys the registry contract once. Run this yourself; store the
 * resulting address in NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS. */
export async function deployRegistry(wallet: WalletConnection) {
  const { buildContractProviders } = await import("./providers-full");
  const providers = buildContractProviders("registry", wallet);
  const compiledContract = getRegistryCompiledContract();
  const deployed = await deployContract(providers as never, { compiledContract } as never);
  return (deployed as { deployTxData: { public: { contractAddress: string } } }).deployTxData.public
    .contractAddress;
}

async function loadRegistry(wallet: WalletConnection) {
  const address = getRegistryAddress();
  if (!address) {
    throw new Error(
      "No registry deployed yet. Deploy contracts/registry and set NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS."
    );
  }
  const { buildContractProviders } = await import("./providers-full");
  const providers = buildContractProviders("registry", wallet);
  const compiledContract = getRegistryCompiledContract();
  return findDeployedContract(providers as never, {
    compiledContract,
    contractAddress: address,
  } as never);
}

/** Registers a newly deployed auction's address in the registry. */
export async function registerAuction(wallet: WalletConnection, auctionContractAddress: Uint8Array) {
  const registry = await loadRegistry(wallet);
  return registry.callTx.registerAuction(auctionContractAddress);
}

/** Thrown by listRegisteredAuctions when no registry address is configured,
 * so callers can distinguish "not set up yet" from "reachable registry with
 * zero auctions in it" instead of treating both as an empty list. */
export class RegistryNotConfiguredError extends Error {
  constructor() {
    super(
      "No registry contract address configured. Set NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS " +
        "once contracts/registry has been deployed (see DEPLOYMENT.md)."
    );
    this.name = "RegistryNotConfiguredError";
  }
}

/** Reads every registered auction address — wallet-free, safe to call from
 * anywhere including SSR/prerender. Throws RegistryNotConfiguredError rather
 * than returning [] when no registry address is set, since those are two
 * different situations for a caller to show the user. */
export async function listRegisteredAuctions(): Promise<string[]> {
  const address = getRegistryAddress();
  if (!address) throw new RegistryNotConfiguredError();
  const publicDataProvider = buildPublicDataProvider();
  const { contractState } = await withTimeout(
    getPublicStates(publicDataProvider, address),
    6000,
    "Timed out reaching the Midnight indexer. Check that it's running and reachable."
  );
  const state = ledger(contractState.data);
  const addresses: string[] = [];
  for (const [, addr] of state.auctionAddresses) {
    addresses.push(toHex(addr));
  }
  return addresses;
}
