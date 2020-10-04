import {ethers} from '@nomiclabs/buidler';
import {Signer} from 'ethers';
import {BigNumberish} from 'ethers/utils';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';

import {StrudelToken} from '../typechain/StrudelToken';
import {StrudelTokenFactory} from '../typechain/StrudelTokenFactory';
import {TorchShip} from '../typechain/TorchShip';
import {TorchShipFactory} from '../typechain/TorchShipFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';

chai.use(solidity);
const {expect} = chai;

async function advanceBlock(blocks: number): Promise<StrudelToken> {
  while (blocks > 1) {
    await ethers.provider.send('evm_increaseTime', [1]);
    await ethers.provider.send('evm_mine', []);
    blocks--;
  }
  await ethers.provider.send('evm_increaseTime', [1]);
  return ethers.provider.send('evm_mine', []);
}

async function deployStrudel(signer: Signer): Promise<StrudelToken> {
  let factory = new StrudelTokenFactory(signer);
  return factory.deploy();
}

async function deployChef(
  strudel: string,
  devaddr: string,
  strudelPerBlock: BigNumberish,
  startBlock: BigNumberish,
  bonusEndBlock: BigNumberish,
  signer: Signer
): Promise<TorchShip> {
  let factory = new TorchShipFactory(signer);
  return factory.deploy(strudel, devaddr, strudelPerBlock, startBlock, bonusEndBlock);
}

describe('TorchShip', async () => {
  let instance: StrudelToken;
  let alice: Signer;
  let bob: Signer;
  let carol: Signer;
  let dev: Signer;
  let minter: Signer;

  beforeEach(async () => {
    [alice, bob, carol, dev, minter] = await ethers.signers();
    instance = await deployStrudel(dev);
  });

  it('should set correct state variables', async () => {
    const factory = new TorchShipFactory(alice);
    const devAddr = await dev.getAddress();
    const chef = await factory.deploy(instance.address, devAddr, '1000', '0', '1000');
    await instance.addMinter(chef.address);
    const strudel = await chef.strudel();
    const devaddr = await chef.devaddr();
    expect(strudel.valueOf()).to.eq(instance.address);
    expect(devaddr.valueOf()).to.eq(devAddr);
    expect(await instance.isMinter(chef.address)).to.be.true;
  });

  it('should allow dev and only dev to update dev', async () => {
    const factory = new TorchShipFactory(alice);
    const devAddr = await dev.getAddress();
    const chef = await factory.deploy(instance.address, devAddr, '1000', '0', '1000');
    expect((await chef.devaddr()).valueOf()).to.eq(devAddr);
    const bobAddr = await bob.getAddress();
    await expect(chef.connect(bob).dev(bobAddr)).to.be.revertedWith('dev: wut?');
    await chef.connect(dev).dev(bobAddr);
    expect((await chef.devaddr()).valueOf()).to.eq(bobAddr);
    const aliceAddr = await alice.getAddress();
    await chef.connect(bob).dev(aliceAddr);
    expect((await chef.devaddr()).valueOf()).to.eq(aliceAddr);
  });

  describe('With ERC/LP token added to the field', () => {
    let lp: MockErc20;
    let lp2: MockErc20;
    beforeEach(async () => {
      lp = await new MockErc20Factory(minter).deploy('LPToken', 'LP', '10000000000');
      const aliceAddr = await alice.getAddress();
      await lp.connect(minter).transfer(aliceAddr, '1000');
      const bobAddr = await bob.getAddress();
      await lp.transfer(bobAddr, '1000');
      const carolAddr = await carol.getAddress();
      await lp.transfer(carolAddr, '1000');
      lp2 = await new MockErc20Factory(minter).deploy('LPToken2', 'LP2', '10000000000');
      await lp2.transfer(aliceAddr, '1000');
      await lp2.transfer(bobAddr, '1000');
      await lp2.transfer(carolAddr, '1000');
    });

    it('should allow emergency withdraw', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new TorchShipFactory(alice).deploy(
        instance.address,
        devAddr,
        '100', // $TRDL per block
        '100', // start block
        '1000' // bonus end block
      );
      await chef.add('100', lp.address, true);
      await lp.connect(bob).approve(chef.address, '1000');
      await chef.connect(bob).deposit(0, '100');
      const bobAddr = await bob.getAddress();
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('900');
      await chef.connect(bob).emergencyWithdraw(0);
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('1000');
    });

    it('should give out $TRDL only after farming time', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new TorchShipFactory(alice).deploy(
        instance.address,
        devAddr,
        '100',
        '100',
        '1000'
      );
      await instance.addMinter(chef.address);
      await chef.add('100', lp.address, true);
      await lp.connect(bob).approve(chef.address, '1000');
      await chef.connect(bob).deposit(0, '100');
      await advanceBlock(89 - (await ethers.provider.getBlock('latest')).number);
      await chef.connect(bob).deposit(0, '0'); // block 90
      const bobAddr = await bob.getAddress();
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('0');
      await advanceBlock(4);
      await chef.connect(bob).deposit(0, '0'); // block 95
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('0');
      await advanceBlock(4);
      await chef.connect(bob).deposit(0, '0'); // block 100
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('0');
      await chef.connect(bob).deposit(0, '0'); // block 101
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('1000');
      await advanceBlock(3);
      await chef.connect(bob).deposit(0, '0'); // block 105
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('5000');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('100');
      expect((await instance.totalSupply()).valueOf()).to.eq('5100');
    });

    it('should not distribute $TRDL if no one deposit', async () => {
      // 100 per block farming rate starting at block 200 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new TorchShipFactory(alice).deploy(
        instance.address,
        devAddr,
        '100',
        '200',
        '1000'
      );
      await instance.addMinter(chef.address);
      await chef.add('100', lp.address, true);
      await lp.connect(bob).approve(chef.address, '1000');
      await advanceBlock(199 - (await ethers.provider.getBlock('latest')).number);
      expect((await instance.totalSupply()).valueOf()).to.eq('0');
      await advanceBlock(5);
      expect((await instance.totalSupply()).valueOf()).to.eq('0');
      await advanceBlock(5);
      await chef.connect(bob).deposit(0, '10'); // block 210
      expect((await instance.totalSupply()).valueOf()).to.eq('0');
      const bobAddr = await bob.getAddress();
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('0');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('0');
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('990');
      await advanceBlock(9);
      await chef.connect(bob).withdraw(0, '10'); // block 220
      expect((await instance.totalSupply()).valueOf()).to.eq('10200');
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('10000');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('200');
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('1000');
    });

    it('should distribute $TRDL properly for each staker', async () => {
      // 100 per block farming rate starting at block 300 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new TorchShipFactory(alice).deploy(
        instance.address,
        devAddr,
        '100',
        '300',
        '1000'
      );
      await instance.addMinter(chef.address);
      await chef.add('100', lp.address, true);
      await lp.connect(alice).approve(chef.address, '1000');
      await lp.connect(bob).approve(chef.address, '1000');
      await lp.connect(carol).approve(chef.address, '1000');
      // Alice deposits 10 LPs at block 310
      await advanceBlock(309 - (await ethers.provider.getBlock('latest')).number);
      await chef.connect(alice).deposit(0, '10');
      // Bob deposits 20 LPs at block 314
      await advanceBlock(3);
      await chef.connect(bob).deposit(0, '20');
      // Carol deposits 30 LPs at block 318
      await advanceBlock(3);
      await chef.connect(carol).deposit(0, '30');
      // Alice deposits 10 more LPs at block 320. At this point:
      //   Alice should have: 4*1000 + 4*1/3*1000 + 2*1/6*1000 = 5666
      //   TorchShip should have the remaining: 10000 - 5666 = 4334
      await advanceBlock(1);
      await chef.connect(alice).deposit(0, '10');
      expect((await instance.totalSupply()).valueOf()).to.eq('10200');
      const aliceAddr = await alice.getAddress();
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('5666');
      const bobAddr = await bob.getAddress();
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('0');
      const carolAddr = await carol.getAddress();
      expect((await instance.balanceOf(carolAddr)).valueOf()).to.eq('0');
      expect((await instance.balanceOf(chef.address)).valueOf()).to.eq('4334');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('200');
      // Bob withdraws 5 LPs at block 330. At this point:
      //   Bob should have: 4*2/3*1000 + 2*2/6*1000 + 10*2/7*1000 = 6190
      await advanceBlock(9);
      await chef.connect(bob).withdraw(0, '5');
      expect((await instance.totalSupply()).valueOf()).to.eq('20400');
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('5666');
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('6190');
      expect((await instance.balanceOf(carolAddr)).valueOf()).to.eq('0');
      expect((await instance.balanceOf(chef.address)).valueOf()).to.eq('8144');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('400');
      // Alice withdraws 20 LPs at block 340.
      // Bob withdraws 15 LPs at block 350.
      // Carol withdraws 30 LPs at block 360.
      await advanceBlock(9);
      await chef.connect(alice).withdraw(0, '20');
      await advanceBlock(9);
      await chef.connect(bob).withdraw(0, '15');
      await advanceBlock(9);
      await chef.connect(carol).withdraw(0, '30');
      expect((await instance.totalSupply()).valueOf()).to.eq('51000');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('1000');
      // Alice should have: 5666 + 10*2/7*1000 + 10*2/6.5*1000 = 11600
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('11600');
      // Bob should have: 6190 + 10*1.5/6.5 * 1000 + 10*1.5/4.5*1000 = 11831
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('11831');
      // Carol should have: 2*3/6*1000 + 10*3/7*1000 + 10*3/6.5*1000 + 10*3/4.5*1000 + 10*1000 = 26568
      expect((await instance.balanceOf(carolAddr)).valueOf()).to.eq('26568');
      // All of them should have 1000 LPs back.
      expect((await lp.balanceOf(aliceAddr)).valueOf()).to.eq('1000');
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('1000');
      expect((await lp.balanceOf(carolAddr)).valueOf()).to.eq('1000');
    });

    it('should give proper $TRDL allocation to each pool', async () => {
      // 100 per block farming rate starting at block 400 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new TorchShipFactory(alice).deploy(
        instance.address,
        devAddr,
        '100',
        '400',
        '1000'
      );
      await instance.addMinter(chef.address);
      await lp.connect(alice).approve(chef.address, '1000');
      await lp2.connect(bob).approve(chef.address, '1000');
      // Add first LP to the pool with allocation 1
      await chef.add('10', lp.address, true);
      // Alice deposits 10 LPs at block 410
      await advanceBlock(409 - (await ethers.provider.getBlock('latest')).number);
      await chef.connect(alice).deposit(0, '10');
      // Add LP2 to the pool with allocation 2 at block 420
      await advanceBlock(9);
      await chef.add('20', lp2.address, true);
      // Alice should have 10*1000 pending reward
      const aliceAddr = await alice.getAddress();
      expect((await chef.pendingStrudel(0, aliceAddr)).valueOf()).to.eq('10000');
      // Bob deposits 10 LP2s at block 425
      await advanceBlock(4);
      await chef.connect(bob).deposit(1, '5');
      // Alice should have 10000 + 5*1/3*1000 = 11666 pending reward
      expect((await chef.pendingStrudel(0, aliceAddr)).valueOf()).to.eq('11666');
      await advanceBlock(5);
      // At block 430. Bob should get 5*2/3*1000 = 3333. Alice should get ~1666 more.
      expect((await chef.pendingStrudel(0, aliceAddr)).valueOf()).to.eq('13333');
      const bobAddr = await bob.getAddress();
      expect((await chef.pendingStrudel(1, bobAddr)).valueOf()).to.eq('3333');
    });

    it('should stop giving bonus $TRDL after the bonus period ends', async () => {
      // 100 per block farming rate starting at block 500 with bonus until block 600
      const devAddr = await dev.getAddress();
      const chef = await new TorchShipFactory(alice).deploy(
        instance.address,
        devAddr,
        '100',
        '500',
        '600'
      );
      await instance.addMinter(chef.address);
      await lp.connect(alice).approve(chef.address, '1000');
      await chef.add('1', lp.address, true);
      // Alice deposits 10 LPs at block 590
      await advanceBlock(589 - (await ethers.provider.getBlock('latest')).number);
      await chef.connect(alice).deposit(0, '10');
      // At block 605, she should have 1000*10 + 100*5 = 10500 pending.
      await advanceBlock(15);
      const aliceAddr = await alice.getAddress();
      expect((await chef.pendingStrudel(0, aliceAddr)).valueOf()).to.eq('10500');
      // At block 606, Alice withdraws all pending rewards and should get 10600.
      await chef.connect(alice).deposit(0, '0');
      expect((await chef.pendingStrudel(0, aliceAddr)).valueOf()).to.eq('0');
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('10600');
    });
  });
});
