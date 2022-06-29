import { ethers, upgrades } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import chai from 'chai';
import vector from './testVector.json';
import { expandTo18Decimals, advanceBlock } from './shared/utilities';
import { GovernanceToken } from '../typechain/GovernanceToken';
import { StrudelToken } from '../typechain/StrudelToken';
import { MockGovBridge } from '../typechain/MockGovBridge';

const { expect } = chai;
const minInterval = 6;
const maxInterval = minInterval * 52;

describe('GovernanceToken', async () => {
  let signers: Signer[];
  let strudel: StrudelToken;
  let gov: GovernanceToken;
  let bridge: MockGovBridge;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    const StrudelTokenFactory = await ethers.getContractFactory('StrudelToken');
    strudel = (await StrudelTokenFactory.deploy()) as StrudelToken;
    const minterAddr = await signers[0].getAddress();
    await strudel.addMinter(minterAddr);
    await strudel.mint(minterAddr, expandTo18Decimals(100000));
    const MockGovBridgeFactory = await ethers.getContractFactory('MockGovBridge');
    bridge = (await MockGovBridgeFactory.deploy()) as MockGovBridge;

    const GovernanceToken = (await ethers.getContractFactory('GovernanceToken')).connect(
      signers[0]
    );
    const govToken = await upgrades.deployProxy(GovernanceToken, [
      strudel.address,
      bridge.address,
      minInterval,
    ]);
    await govToken.deployed();
    gov = govToken as GovernanceToken;
  });

  describe('locking', async () => {
    it('should lock', async () => {
      const signerAddr = await signers[0].getAddress();
      await strudel.approve(gov.address, expandTo18Decimals(100000));
      await gov.lock(signerAddr, expandTo18Decimals(26), maxInterval, false);

      const bal = await gov.balanceOf(signerAddr);
      expect(bal).to.eq(expandTo18Decimals(26));
    });

    it('should lock with approve', async () => {
      const signerAddr = await signers[0].getAddress();
      await strudel.approveAndCall(
        gov.address,
        expandTo18Decimals(26),
        `0x0000000000000000000000000000000000000000000000000000000000000${maxInterval.toString(16)}`
      );

      const bal = await gov.balanceOf(signerAddr);
      expect(bal).to.eq(expandTo18Decimals(26));
    });

    it('should allow to unlock', async () => {
      const signerAddr = await signers[0].getAddress();
      await strudel.approve(gov.address, expandTo18Decimals(100000));

      // use the lock
      await gov.lock(signerAddr, expandTo18Decimals(26), minInterval, false);
      let currentHeight = (await ethers.provider.getBlock('latest')).number;

      // wait a bit
      await advanceBlock(currentHeight + minInterval);

      // unlock
      await gov.approve(gov.address, expandTo18Decimals(100000));
      await gov.unlock();

      // check
      let lock = await gov.getLock(signerAddr);
      expect(lock.endBlock).to.eq(0);
      expect(lock.mintTotal).to.eq(0);
      expect(lock.lockTotal).to.eq(0);
    });

    it('should allow to pay lock for others', async () => {
      const alice = await signers[0].getAddress();
      const bob = await signers[1].getAddress();
      await strudel.approve(gov.address, expandTo18Decimals(100000));
      await gov.lock(bob, expandTo18Decimals(26), maxInterval, false);

      let bal = await gov.balanceOf(alice);
      expect(bal).to.eq(0);
      bal = await gov.balanceOf(bob);
      expect(bal).to.eq(expandTo18Decimals(26));

      let lock = await gov.getLock(alice);
      expect(lock.mintTotal).to.eq(0);
      lock = await gov.getLock(bob);
      expect(lock.mintTotal).to.eq(expandTo18Decimals(26));
    });

    it('should average multiple locks', async () => {
      const signerAddr = await signers[0].getAddress();
      await strudel.approve(gov.address, expandTo18Decimals(100000));

      // use the lock
      await gov.lock(signerAddr, expandTo18Decimals(26), minInterval, false);
      let currentHeight = (await ethers.provider.getBlock('latest')).number;

      // check results
      let lock = await gov.getLock(signerAddr);
      // ~1
      expect(lock.mintTotal).to.eq('990384615384615384');
      expect(lock.endBlock.sub(currentHeight)).to.eq(minInterval);

      // have half the lock time pass
      await advanceBlock(currentHeight + 2);

      // use the lock again
      await gov.lock(signerAddr, expandTo18Decimals(26), maxInterval, false);
      currentHeight = (await ethers.provider.getBlock('latest')).number;

      // check results
      lock = await gov.getLock(signerAddr);
      // 25 + 1 = 27
      expect(lock.mintTotal).to.eq('26990384615384615384');
      // 26 + 26
      expect(lock.lockTotal).to.eq(expandTo18Decimals(52));
      // (3 * 26 + 6 * 52 * 26) / 52 = 157
      expect(lock.endBlock.sub(currentHeight)).to.eq(157);
    });

    it('should unlock while locking', async () => {
      const signerAddr = await signers[0].getAddress();
      await strudel.approve(gov.address, expandTo18Decimals(100000));

      // use the lock
      await gov.lock(signerAddr, expandTo18Decimals(26), minInterval, false);
      let currentHeight = (await ethers.provider.getBlock('latest')).number;

      // wait a bit
      await advanceBlock(currentHeight + minInterval);

      // lock more
      await gov.approve(gov.address, expandTo18Decimals(100000));
      await gov.lock(signerAddr, expandTo18Decimals(26), minInterval, false);
      currentHeight = (await ethers.provider.getBlock('latest')).number;

      // check
      let lock = await gov.getLock(signerAddr);
      expect(lock.endBlock.sub(currentHeight)).to.eq(minInterval);
      // ~1
      expect(lock.mintTotal).to.eq('990384615384615384');
      expect(lock.lockTotal).to.eq(expandTo18Decimals(26));
      const bal = await strudel.balanceOf(signerAddr);
      expect(bal).to.eq(expandTo18Decimals(100000 - 26));
    });
  });

  it('should allow owner and only owner to transfer ownership', async () => {
    const alice = await signers[0].getAddress();
    const bob = await signers[1].getAddress();

    expect((await gov.owner()).valueOf()).to.eq(alice);
    await expect(gov.connect(signers[1]).transferOwnership(bob)).to.be.revertedWith(
      'caller is not the owner'
    );
    await gov.connect(signers[0]).transferOwnership(bob);
    expect((await gov.owner()).valueOf()).to.eq(bob);
    await gov.connect(signers[1]).functions.transferOwnership(alice);
    expect((await gov.owner()).valueOf()).to.eq(alice);
  });
});
