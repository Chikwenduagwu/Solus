import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  bidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  bidMaxPrice(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  bidSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  openAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  commitBid(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>,
         clearingPrice__0: bigint,
         totalAllocated__0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verifyCommitment(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  openAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  commitBid(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>,
         clearingPrice__0: bigint,
         totalAllocated__0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verifyCommitment(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  openAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  commitBid(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>,
         clearingPrice__0: bigint,
         totalAllocated__0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verifyCommitment(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly status: number;
  readonly tokenSymbol: Uint8Array;
  readonly allocation: bigint;
  readonly settlementAssetCode: Uint8Array;
  readonly startTime: bigint;
  readonly endTime: bigint;
  readonly minimumBid: bigint;
  readonly minimumBidSize: bigint;
  readonly maxAllocationPerBidder: bigint;
  readonly clearingPrice: bigint;
  readonly totalAllocated: bigint;
  bidCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly bidCount: bigint;
  readonly round: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               tokenSymbol__0: Uint8Array,
               allocation__0: bigint,
               settlementAssetCode__0: Uint8Array,
               startTime__0: bigint,
               endTime__0: bigint,
               minimumBid__0: bigint,
               minimumBidSize__0: bigint,
               maxAllocationPerBidder__0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
