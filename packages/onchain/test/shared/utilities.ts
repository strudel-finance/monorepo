import {BigNumber, bigNumberify} from 'ethers/utils';

export function expandTo18Decimals(n: number): BigNumber {
  return bigNumberify(n).mul(bigNumberify(10).pow(18));
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return [
    reserve1.mul(bigNumberify(2).pow(112)).div(reserve0),
    reserve0.mul(bigNumberify(2).pow(112)).div(reserve1),
  ];
}
