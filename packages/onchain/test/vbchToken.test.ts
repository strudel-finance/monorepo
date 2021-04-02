import {ethers, upgrades} from 'hardhat';
import {Signer, Contract} from 'ethers';
import {getAdminAddress} from '@openzeppelin/upgrades-core';
import chai from 'chai';
import {expandTo18Decimals, concatenateHexStrings} from './shared/utilities';
import {BchMainnetToken} from '../typechain/BchMainnetToken';

const {expect} = chai;
const MAX_SUPPLY = expandTo18Decimals(21000000);

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
  });

  describe('#totalSupply', async () => {
    it('should allow to report new supply', async () => {
      //#check supply
      let totalSupply = await bchToken.totalSupply();
      expect(totalSupply).to.eq(0);
      const balance = await bchToken.balanceOf(await (await ethers.getSigners())[0].getAddress());
      expect(balance).to.eq(MAX_SUPPLY);

      // try to report supply from non-owner account
      await expect(
        bchToken.connect((await ethers.getSigners())[1]).reportSupply(100000)
      ).to.be.revertedWith('caller is not the owner');

      //report new supply
      await bchToken.reportSupply(100000);
      totalSupply = await bchToken.totalSupply();
      expect(totalSupply).to.eq(100000);
    });

    it('should allow to burn', async () => {
      let balance = await bchToken.balanceOf(await (await ethers.getSigners())[0].getAddress());
      expect(balance).to.eq(MAX_SUPPLY);

      await expect(bchToken.burn(MAX_SUPPLY)).to.be.revertedWith('subtraction overflow');

      await bchToken.burn(100000);

      let totalSupply = await bchToken.totalSupply();
      expect(totalSupply).to.eq(0);

      balance = await bchToken.balanceOf(await (await ethers.getSigners())[0].getAddress());
      expect(balance).to.eq(MAX_SUPPLY.sub('100000'));
    });
  });
});
