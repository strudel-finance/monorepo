import { ethers, upgrades } from 'hardhat';
import { Signer, Contract } from 'ethers';
import { getAdminAddress } from '@openzeppelin/upgrades-core';
import chai from 'chai';
import { expandTo18Decimals, concatenateHexStrings } from './shared/utilities';
import { BchMainnetToken } from '../typechain/BchMainnetToken';

const { expect } = chai;

describe('VBCH', async () => {
  let bob: Signer;
  let owner: Signer;
  let admin: Signer;
  let bchToken: BchMainnetToken;

  before(async () => {
    [bob, owner, admin] = await ethers.getSigners();

    // deploy contract
    const BchMainnetTokenFactory = await ethers.getContractFactory('BchMainnetToken');
    bchToken = (await BchMainnetTokenFactory.deploy()) as BchMainnetToken;

    // add minting rights
    const ownerAddr = await owner.getAddress();
    await bchToken.addMinter(ownerAddr);
  });

  describe('#totalSupply', async () => {
    it('should allow to report new supply', async () => {
      await bchToken._(100);
      const ttSupply = await bchToken.totalSupplyV2();
      console.log(ttSupply.toString());

      // await bchToken.reportSupply(100);
      // const ttSupply = await bchToken.totalSupplyV2();
      // console.log(ttSupply.toString());
    });
  });
});
