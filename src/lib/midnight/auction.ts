/**
 * Auction contract lifecycle: deploy, commit, close, settle, verify.
 *
 * Every call here goes through deployContract / findDeployedContract from
 * @midnight-ntwrk/midnight-js-contracts against the real compiled contract
 * in src/generated/auction. There is no mocked delay and no fabricated
 * response — each function either returns real data read from the
 * contract's public ledger, or throws, because there is no live Midnight
 * indexer/node/proof-server reachable from the environment this scaffold
 * was built in to test against.
 *
 * Read functions (readAuctionState) import providers-public.ts statically
 * — safe anywhere. Write functions dynamically import providers-full.ts
 * instead, since it pulls in a native Node dependency that must never
 * load during Next.js's server render — see providers-full.ts for why.
 *
 * Before this works end-to-end you need (see README.md):
 *   1. A running Midnight network (local devnet or Testnet/Preprod) and a
 *      running proof server — see contracts/README.md.
 *   2. Full contract compilation (not --skip-zk) so real proving/verifier
 *      keys exist, served from /managed/auction.
 *   3. A connected wallet (see wallet.ts) — see wallet-provider-bridge.ts
 *      for the one part of this chain not yet smoke-tested against a real
 *      wallet.
 */

import { deployContract, findDeployedContract, getPublicStates } from "@midnight-ntwrk/midnight-js-contracts";
import { getAuctionCompiledContract, setPendingBid, type PendingBid } from "./contracts/auction-contract";
import { buildPublicDataProvider } from "./providers-public";
import { withTimeout } from "./with-timeout";
import { ledger } from "../../generated/auction/index.js";
import type { WalletConnection } from "./wallet";

export interface CreateAuctionParams {
  tokenSymbol: Uint8Array; // 32 bytes, ASCII symbol padded with zeros
  allocation: bigint;
  settlementAssetCode: Uint8Array; // 32 bytes
  startTime: bigint; // unix seconds
  endTime: bigint;
  minimumBid: bigint;
  minimumBidSize: bigint;
  maxAllocationPerBidder: bigint;
}

/** Deploys a new auction contract instance and returns its address. */
export async function deployAuction(wallet: WalletConnection, params: CreateAuctionParams) {
  const { buildContractProviders } = await import("./providers-full");
  const providers = buildContractProviders("auction", wallet);
  const compiledContract = getAuctionCompiledContract();

  const deployed = await deployContract(providers as never, {
    compiledContract,
    args: [
      params.tokenSymbol,
      params.allocation,
      params.settlementAssetCode,
      params.startTime,
      params.endTime,
      params.minimumBid,
      params.minimumBidSize,
      params.maxAllocationPerBidder,
    ],
  } as never);

  return {
    contractAddress: (deployed as { deployTxData: { public: { contractAddress: string } } }).deployTxData
      .public.contractAddress,
    deployed,
  };
}

async function loadAuction(wallet: WalletConnection, contractAddress: string) {
  const { buildContractProviders } = await import("./providers-full");
  const providers = buildContractProviders("auction", wallet);
  const compiledContract = getAuctionCompiledContract();
  return findDeployedContract(providers as never, { compiledContract, contractAddress } as never);
}

export async function openAuction(wallet: WalletConnection, contractAddress: string) {
  const auction = await loadAuction(wallet, contractAddress);
  return auction.callTx.openAuction();
}

export async function commitBid(wallet: WalletConnection, contractAddress: string, bid: PendingBid) {
  setPendingBid(bid);
  const auction = await loadAuction(wallet, contractAddress);
  return auction.callTx.commitBid();
}

export async function closeAuction(wallet: WalletConnection, contractAddress: string) {
  const auction = await loadAuction(wallet, contractAddress);
  return auction.callTx.closeAuction();
}

export async function settle(
  wallet: WalletConnection,
  contractAddress: string,
  clearingPrice: bigint,
  totalAllocated: bigint
) {
  const auction = await loadAuction(wallet, contractAddress);
  return auction.callTx.settle(clearingPrice, totalAllocated);
}

export async function verifyCommitment(
  wallet: WalletConnection,
  contractAddress: string,
  commitment: Uint8Array
) {
  const auction = await loadAuction(wallet, contractAddress);
  return auction.callTx.verifyCommitment(commitment);
}

/** Reads the auction's current public ledger state — no wallet required,
 * safe to call from anywhere including SSR/prerender. Fails after 6s if the
 * indexer is unreachable, rather than hanging on the SDK's own retries. */
export async function readAuctionState(contractAddress: string) {
  const publicDataProvider = buildPublicDataProvider();
  const { contractState } = await withTimeout(
    getPublicStates(publicDataProvider, contractAddress),
    6000,
    "Timed out reaching the Midnight indexer. Check that it's running and reachable."
  );
  return ledger(contractState.data);
}
