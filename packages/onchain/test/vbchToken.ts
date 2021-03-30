import {ethers, upgrades} from 'hardhat';
import {Signer, Contract} from 'ethers';
import {getAdminAddress} from '@openzeppelin/upgrades-core';
import chai from 'chai';
import {expandTo18Decimals, concatenateHexStrings} from './shared/utilities';
import {BchMainnetToken} from '../typechain/BchMainnetToken';

const {expect} = chai;


describe('VBCH', async () => {
  let bob: Signer;
  let owner: Signer;
  let admin: Signer;
  let bchToken: BchMainnetToken;

  before(async () => {
    [bob, owner, admin] = await ethers.getSigners();

    // deploy contract
    const BchMainnetTokenFactory = await ethers.getContractFactory("BchMainnetToken");
    bchToken = await BchMainnetTokenFactory.deploy(BYTES32_0, 210, BYTES32_0, 211) as MockRelay;

    // add minting rights
    const ownerAddr = await owner.getAddress();
    await strudel.addMinter(ownerAddr);
  });

  describe('#totalSupply', async () => {
    it('should allow to report new supply', async () => {

    });
  });
});
