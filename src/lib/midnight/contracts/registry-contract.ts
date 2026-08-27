/**
 * Binds the generated registry contract (src/generated/registry) — it has
 * no witnesses, so this uses withVacantWitnesses. Same type-boundary note
 * as auction-contract.ts: compact-js's internal `Contract` type and the
 * real generated Contract class don't structurally align at the type
 * level, so this composes untyped and returns `unknown` rather than
 * fighting incompatible generics — the runtime shape matches the
 * package's own README example exactly.
 */

import { pipe } from "effect";
import * as CompiledContract from "@midnight-ntwrk/compact-js/effect/CompiledContract";
import { Contract as RegistryContractCtor } from "../../../generated/registry/index.js";

export function getRegistryCompiledContract(): unknown {
  return pipe(
    CompiledContract.make("sealbid-registry-v1", RegistryContractCtor as never),
    (c: unknown) => (CompiledContract.withVacantWitnesses as (c: unknown) => unknown)(c),
    (c: unknown) =>
      (CompiledContract.withCompiledFileAssets as (p: string) => (c: unknown) => unknown)("/managed/registry")(c)
  );
}
