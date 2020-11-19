import {BigNumber, Contract, utils} from 'ethers';
import {ethers} from '@nomiclabs/buidler';
const {keccak256, defaultAbiCoder, toUtf8Bytes, solidityPack} = utils;

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

export async function advanceTime(seconds: number): Promise<any> {
  await ethers.provider.send('evm_increaseTime', [seconds]);
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

export function strip0xPrefix(hexString: string) {
  return hexString.substring(0, 2) === '0x' ? hexString.substring(2) : hexString;
}

export function concatenateHexStrings(strs: string[]) {
  let current = '0x';
  for (let i = 0; i < strs.length; i += 1) {
    current = `${current}${strip0xPrefix(strs[i])}`;
  }
  return current;
}

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
);

function getDomainSeparator(name: string, tokenAddress: string) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(
          toUtf8Bytes(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
          )
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes('1')),
        ethers.provider.network.chainId,
        tokenAddress,
      ]
    )
  );
}

export async function getApprovalDigest(
  token: Contract,
  approve: {
    owner: string;
    spender: string;
    value: BigNumber;
  },
  nonce: BigNumber,
  deadline: BigNumber
): Promise<string> {
  const name = await token.name();
  const DOMAIN_SEPARATOR = getDomainSeparator(name, token.address);
  const msg = defaultAbiCoder.encode(
    ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
    [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
  );
  const pack = solidityPack(
    ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
    ['0x19', '0x01', DOMAIN_SEPARATOR, keccak256(msg)]
  );
  return keccak256(pack);
}
