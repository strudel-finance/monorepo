import {BigNumber} from 'ethers';
import {ethers} from '@nomiclabs/buidler';

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18));
}

export async function advanceBlock(height: number): Promise<any> {
  const currentHeight = (await ethers.provider.getBlock('latest')).number;
  let pos = height - currentHeight;
  while (pos > 1) {
    await ethers.provider.send('evm_increaseTime', [1]);
    await ethers.provider.send('evm_mine', []);
    pos--;
  }
  await ethers.provider.send('evm_increaseTime', [1]);
  return ethers.provider.send('evm_mine', []);
}

export function encodePrice(reserve0: BigNumber, reserve1: BigNumber) {
  return reserve0.mul(BigNumber.from(2).pow(112)).div(reserve1);
}

export function round(val: BigNumber) {
  return val.div(BigNumber.from(2).pow(112));
}

export function normalize(val: BigNumber) {
  return val.div(BigNumber.from(2).pow(112));
}
