import {BigNumber, bigNumberify} from 'ethers/utils';

export function expandTo18Decimals(n: number): BigNumber {
  return bigNumberify(n).mul(bigNumberify(10).pow(18));
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return reserve0.mul(bigNumberify(2).pow(112)).div(reserve1);
}

export function round(val: BigNumber) {
  return val.div(bigNumberify(2).pow(112));
}

export function normalize(val: BigNumber) {
  return val.div(bigNumberify(2).pow(112));
}
