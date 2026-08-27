import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // See src/shims/isomorphic-ws-browser.ts for why this is needed.
      "isomorphic-ws": "./src/shims/isomorphic-ws-browser.ts",
    },
  },
};

export default nextConfig;
