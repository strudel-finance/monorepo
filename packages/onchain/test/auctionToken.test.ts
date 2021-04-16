import { ethers, upgrades } from 'hardhat';
import { Signer } from 'ethers';

import chai from 'chai';
import { expandTo18Decimals, advanceTime } from './shared/utilities';

import { MockERC20 } from '../typechain/MockERC20';
import { MockAuctionManager } from '../typechain/MockAuctionManager';
import { AuctionToken } from '../typechain/AuctionToken';
import { GovernanceToken } from '../typechain/GovernanceToken';

const { expect } = chai;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe('AuctionToken', () => {
  // params
  let minInterval = 6;

  // signers
  let alice: Signer;
  let bob: Signer;

  // contracts
  let auctionManager: MockAuctionManager;
  let govToken: GovernanceToken;
  let strudel: MockERC20;
  let auctionToken: AuctionToken;

  before(async () => {
    [alice, bob] = await ethers.getSigners();

    const MockAuctionManagerFactory = await ethers.getContractFactory('MockAuctionManager');
    auctionManager = (await MockAuctionManagerFactory.deploy()) as MockAuctionManager;

    const MockErc20Factory = await ethers.getContractFactory('MockERC20');
    strudel = (await MockErc20Factory.deploy(
      'TRDL',
      'TRDL',
      18,
      expandTo18Decimals(8)
    )) as MockERC20;

    const GovernanceTokenFactory = await ethers.getContractFactory('GovernanceToken');
    govToken = (await upgrades.deployProxy(GovernanceTokenFactory, [
      strudel.address,
      strudel.address,
      minInterval,
    ])) as GovernanceToken;
    await govToken.deployed();

    // should AuctionToken be upradable????
    const AuctionTokenFactory = await ethers.getContractFactory('AuctionToken');
    auctionToken = (await upgrades.deployProxy(AuctionTokenFactory, [
      govToken.address,
      strudel.address,
      auctionManager.address,
    ])) as AuctionToken;
  });

  it('should fail if not called from auctionManager', async () => {});
});
