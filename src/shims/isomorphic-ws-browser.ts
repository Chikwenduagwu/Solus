/**
 * isomorphic-ws's browser build only default-exports the WebSocket
 * constructor; graphql-ws (a dependency of
 * @midnight-ntwrk/midnight-js-indexer-public-data-provider, used for
 * indexer subscriptions) does `import * as ws from 'isomorphic-ws'` and
 * then reads `ws.WebSocket` — a named export isomorphic-ws's Node build
 * has (via `ws` package's dual export) but its browser build does not.
 * Turbopack's static ESM analysis catches this real mismatch at build
 * time (confirmed by running `next build` against this exact dependency
 * graph, not assumed). Aliased in next.config.ts via
 * `turbopack.resolveAlias` for client bundles only.
 */
const browserWebSocket = typeof window !== "undefined" ? window.WebSocket : undefined;

export const WebSocket = browserWebSocket;
export default browserWebSocket;
