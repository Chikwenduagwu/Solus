/**
 * publicDataProvider only — no privateStateProvider, no `level`/native
 * bindings. Safe to import from anywhere, including code that Next.js
 * server-renders or statically prerenders, unlike providers-full.ts.
 */

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { getNetworkConfig } from "./network";

export function buildPublicDataProvider() {
  const network = getNetworkConfig();
  setNetworkId(network.networkId);
  return indexerPublicDataProvider(network.indexer, network.indexerWS);
}
