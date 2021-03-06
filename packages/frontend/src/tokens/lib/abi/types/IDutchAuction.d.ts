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

interface IDutchAuctionInterface extends ethers.utils.Interface {
  functions: {
    "auctionEnded()": FunctionFragment;
    "auctionToken()": FunctionFragment;
    "clearingPrice()": FunctionFragment;
    "endDate()": FunctionFragment;
    "finaliseAuction()": FunctionFragment;
    "initDutchAuction(address,address,uint256,uint256,uint256,address,uint256,uint256,address)": FunctionFragment;
    "minimumPrice()": FunctionFragment;
    "paymentCurrency()": FunctionFragment;
    "tokenSupply()": FunctionFragment;
    "tokensClaimed(address)": FunctionFragment;
    "wallet()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "auctionEnded",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "auctionToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "clearingPrice",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "endDate", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "finaliseAuction",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initDutchAuction",
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      string
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "minimumPrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "paymentCurrency",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokenSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokensClaimed",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "wallet", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "auctionEnded",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "auctionToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "clearingPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "endDate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "finaliseAuction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "initDutchAuction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minimumPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "paymentCurrency",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokensClaimed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wallet", data: BytesLike): Result;

  events: {};
}

export class IDutchAuction extends Contract {
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

  interface: IDutchAuctionInterface;

  functions: {
    auctionEnded(overrides?: CallOverrides): Promise<[boolean]>;

    "auctionEnded()"(overrides?: CallOverrides): Promise<[boolean]>;

    auctionToken(overrides?: CallOverrides): Promise<[string]>;

    "auctionToken()"(overrides?: CallOverrides): Promise<[string]>;

    clearingPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    "clearingPrice()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    endDate(overrides?: CallOverrides): Promise<[BigNumber]>;

    "endDate()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    finaliseAuction(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "finaliseAuction()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    initDutchAuction(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "initDutchAuction(address,address,uint256,uint256,uint256,address,uint256,uint256,address)"(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    minimumPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    "minimumPrice()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    paymentCurrency(overrides?: CallOverrides): Promise<[string]>;

    "paymentCurrency()"(overrides?: CallOverrides): Promise<[string]>;

    tokenSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    "tokenSupply()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokensClaimed(
      user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "tokensClaimed(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    wallet(overrides?: CallOverrides): Promise<[string]>;

    "wallet()"(overrides?: CallOverrides): Promise<[string]>;
  };

  auctionEnded(overrides?: CallOverrides): Promise<boolean>;

  "auctionEnded()"(overrides?: CallOverrides): Promise<boolean>;

  auctionToken(overrides?: CallOverrides): Promise<string>;

  "auctionToken()"(overrides?: CallOverrides): Promise<string>;

  clearingPrice(overrides?: CallOverrides): Promise<BigNumber>;

  "clearingPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

  endDate(overrides?: CallOverrides): Promise<BigNumber>;

  "endDate()"(overrides?: CallOverrides): Promise<BigNumber>;

  finaliseAuction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "finaliseAuction()"(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  initDutchAuction(
    _funder: string,
    _token: string,
    _tokenSupply: BigNumberish,
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _paymentCurrency: string,
    _startPrice: BigNumberish,
    _minimumPrice: BigNumberish,
    _wallet: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "initDutchAuction(address,address,uint256,uint256,uint256,address,uint256,uint256,address)"(
    _funder: string,
    _token: string,
    _tokenSupply: BigNumberish,
    _startDate: BigNumberish,
    _endDate: BigNumberish,
    _paymentCurrency: string,
    _startPrice: BigNumberish,
    _minimumPrice: BigNumberish,
    _wallet: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  minimumPrice(overrides?: CallOverrides): Promise<BigNumber>;

  "minimumPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

  paymentCurrency(overrides?: CallOverrides): Promise<string>;

  "paymentCurrency()"(overrides?: CallOverrides): Promise<string>;

  tokenSupply(overrides?: CallOverrides): Promise<BigNumber>;

  "tokenSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

  tokensClaimed(user: string, overrides?: CallOverrides): Promise<BigNumber>;

  "tokensClaimed(address)"(
    user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  wallet(overrides?: CallOverrides): Promise<string>;

  "wallet()"(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    auctionEnded(overrides?: CallOverrides): Promise<boolean>;

    "auctionEnded()"(overrides?: CallOverrides): Promise<boolean>;

    auctionToken(overrides?: CallOverrides): Promise<string>;

    "auctionToken()"(overrides?: CallOverrides): Promise<string>;

    clearingPrice(overrides?: CallOverrides): Promise<BigNumber>;

    "clearingPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

    endDate(overrides?: CallOverrides): Promise<BigNumber>;

    "endDate()"(overrides?: CallOverrides): Promise<BigNumber>;

    finaliseAuction(overrides?: CallOverrides): Promise<void>;

    "finaliseAuction()"(overrides?: CallOverrides): Promise<void>;

    initDutchAuction(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "initDutchAuction(address,address,uint256,uint256,uint256,address,uint256,uint256,address)"(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: CallOverrides
    ): Promise<void>;

    minimumPrice(overrides?: CallOverrides): Promise<BigNumber>;

    "minimumPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

    paymentCurrency(overrides?: CallOverrides): Promise<string>;

    "paymentCurrency()"(overrides?: CallOverrides): Promise<string>;

    tokenSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "tokenSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensClaimed(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    "tokensClaimed(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    wallet(overrides?: CallOverrides): Promise<string>;

    "wallet()"(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    auctionEnded(overrides?: CallOverrides): Promise<BigNumber>;

    "auctionEnded()"(overrides?: CallOverrides): Promise<BigNumber>;

    auctionToken(overrides?: CallOverrides): Promise<BigNumber>;

    "auctionToken()"(overrides?: CallOverrides): Promise<BigNumber>;

    clearingPrice(overrides?: CallOverrides): Promise<BigNumber>;

    "clearingPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

    endDate(overrides?: CallOverrides): Promise<BigNumber>;

    "endDate()"(overrides?: CallOverrides): Promise<BigNumber>;

    finaliseAuction(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "finaliseAuction()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    initDutchAuction(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "initDutchAuction(address,address,uint256,uint256,uint256,address,uint256,uint256,address)"(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    minimumPrice(overrides?: CallOverrides): Promise<BigNumber>;

    "minimumPrice()"(overrides?: CallOverrides): Promise<BigNumber>;

    paymentCurrency(overrides?: CallOverrides): Promise<BigNumber>;

    "paymentCurrency()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokenSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "tokenSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    tokensClaimed(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    "tokensClaimed(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    wallet(overrides?: CallOverrides): Promise<BigNumber>;

    "wallet()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    auctionEnded(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "auctionEnded()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    auctionToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "auctionToken()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    clearingPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "clearingPrice()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    endDate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "endDate()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    finaliseAuction(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "finaliseAuction()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    initDutchAuction(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "initDutchAuction(address,address,uint256,uint256,uint256,address,uint256,uint256,address)"(
      _funder: string,
      _token: string,
      _tokenSupply: BigNumberish,
      _startDate: BigNumberish,
      _endDate: BigNumberish,
      _paymentCurrency: string,
      _startPrice: BigNumberish,
      _minimumPrice: BigNumberish,
      _wallet: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    minimumPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "minimumPrice()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    paymentCurrency(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "paymentCurrency()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "tokenSupply()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokensClaimed(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tokensClaimed(address)"(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    wallet(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "wallet()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
