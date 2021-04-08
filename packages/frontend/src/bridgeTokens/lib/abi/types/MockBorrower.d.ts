/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface MockBorrowerInterface extends ethers.utils.Interface {
  functions: {
    "executeOnFlashMint(uint256,bytes32)": FunctionFragment;
    "flashMint(uint256,bytes32,bool)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "executeOnFlashMint",
    values: [BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "flashMint",
    values: [BigNumberish, BytesLike, boolean]
  ): string;

  decodeFunctionResult(
    functionFragment: "executeOnFlashMint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "flashMint", data: BytesLike): Result;

  events: {
    "Data(uint256,bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Data"): EventFragment;
}

export class MockBorrower extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: MockBorrowerInterface;

  functions: {
    executeOnFlashMint(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "executeOnFlashMint(uint256,bytes32)"(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    flashMint(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "flashMint(uint256,bytes32,bool)"(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  executeOnFlashMint(
    amount: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "executeOnFlashMint(uint256,bytes32)"(
    amount: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  flashMint(
    amount: BigNumberish,
    data: BytesLike,
    _reentrance: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "flashMint(uint256,bytes32,bool)"(
    amount: BigNumberish,
    data: BytesLike,
    _reentrance: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    executeOnFlashMint(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "executeOnFlashMint(uint256,bytes32)"(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    flashMint(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    "flashMint(uint256,bytes32,bool)"(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    Data(
      amount: null,
      data: null
    ): TypedEventFilter<
      [BigNumber, string],
      { amount: BigNumber; data: string }
    >;
  };

  estimateGas: {
    executeOnFlashMint(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "executeOnFlashMint(uint256,bytes32)"(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    flashMint(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "flashMint(uint256,bytes32,bool)"(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    executeOnFlashMint(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "executeOnFlashMint(uint256,bytes32)"(
      amount: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    flashMint(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "flashMint(uint256,bytes32,bool)"(
      amount: BigNumberish,
      data: BytesLike,
      _reentrance: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}