import {ethers} from "@nomiclabs/buidler";
import {Signer} from "ethers";
import { BigNumberish } from "ethers/utils";
import chai from "chai";
import {solidity} from "ethereum-waffle";

import { StrudelToken } from '../typechain/StrudelToken';
import { StrudelTokenFactory } from '../typechain/StrudelTokenFactory';
import { MasterChef } from '../typechain/MasterChef';
import { MasterChefFactory } from '../typechain/MasterChefFactory';
import { MockERC20 } from '../typechain/MockERC20';
import { MockERC20Factory } from '../typechain/MockERC20Factory';

chai.use(solidity);
const {expect} = chai;

async function advanceBlock(blocks: number): Promise<StrudelToken> {
  while(blocks > 1) {
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
// interface deployChefProps {
//     strudel: StrudelToken,
//     devaddr: Signer,
//     strudelPerBlock: string,
//     startBlock: string,
//     bonusEndBlock: string,
//     signer: Signer  
// };

// props: deployChefProps <- use in function


async function deployChef(
    strudel: string,
    devaddr: string,
    strudelPerBlock: BigNumberish,
    startBlock: BigNumberish,
    bonusEndBlock: BigNumberish,
    signer: Signer
  ): Promise<MasterChef> {
  let factory = new MasterChefFactory(signer);
  return factory.deploy(strudel, devaddr, strudelPerBlock, startBlock, bonusEndBlock);
}


describe('MasterChef', async () => {
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
    const factory = new MasterChefFactory(alice);
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
    const factory = new MasterChefFactory(alice);
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
  })

  describe('With ERC/LP token added to the field', () => {
    let lp: MockERC20;
    let lp2: MockERC20;
    beforeEach(async () => {
      lp = await new MockERC20Factory(minter).deploy('LPToken', 'LP', '10000000000');
      const aliceAddr = await alice.getAddress();
      await lp.connect(minter).transfer(aliceAddr, '1000');
      const bobAddr = await bob.getAddress();
      await lp.transfer(bobAddr, '1000');
      const carolAddr = await carol.getAddress();
      await lp.transfer(carolAddr, '1000');
      lp2 = await new MockERC20Factory(minter).deploy('LPToken2', 'LP2', '10000000000');
      await lp2.transfer(aliceAddr, '1000');
      await lp2.transfer(bobAddr, '1000');
      await lp2.transfer(carolAddr, '1000');
    });

    it('should allow emergency withdraw', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new MasterChefFactory(alice).deploy(instance.address, devAddr, '100', '100', '1000');
      await chef.add('100', lp.address, true);
      await lp.connect(bob).approve(chef.address, '1000');
      await chef.connect(bob).deposit(0, '100');
      const bobAddr = await bob.getAddress();
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('900');
      await chef.connect(bob).emergencyWithdraw(0);
      expect((await lp.balanceOf(bobAddr)).valueOf(), '1000');
    });

    it('should give out SUSHIs only after farming time', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const chef = await new MasterChefFactory(alice).deploy(instance.address, devAddr, '100', '100', '1000');
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
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('980');
      await advanceBlock(3);
      await chef.connect(bob).deposit(0, '0'); // block 105
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('4900');
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq('100');
      expect((await instance.totalSupply()).valueOf()).to.eq('5000');
    });

  //   it('should not distribute SUSHIs if no one deposit', async () => {
  //     // 100 per block farming rate starting at block 200 with bonus until block 1000
  //     const factory = new MasterChefFactory(alice);
  //     this.chef = await MasterChef.new(this.sushi.address, dev, '100', '200', '1000', { from: alice });
  //     await this.sushi.transferOwnership(this.chef.address, { from: alice });
  //     await this.chef.add('100', this.lp.address, true);
  //     await this.lp.approve(this.chef.address, '1000', { from: bob });
  //     await time.advanceBlockTo('199');
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '0');
  //     await time.advanceBlockTo('204');
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '0');
  //     await time.advanceBlockTo('209');
  //     await this.chef.deposit(0, '10', { from: bob }); // block 210
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '0');
  //     assert.equal((await this.sushi.balanceOf(bob)).valueOf(), '0');
  //     assert.equal((await this.sushi.balanceOf(dev)).valueOf(), '0');
  //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '990');
  //     await time.advanceBlockTo('219');
  //     await this.chef.withdraw(0, '10', { from: bob }); // block 220
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '11000');
  //     assert.equal((await this.sushi.balanceOf(bob)).valueOf(), '10000');
  //     assert.equal((await this.sushi.balanceOf(dev)).valueOf(), '1000');
  //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000');
  //   });

  //   it('should distribute SUSHIs properly for each staker', async () => {
  //     // 100 per block farming rate starting at block 300 with bonus until block 1000
  //     const factory = new MasterChefFactory(alice);
  //     this.chef = await MasterChef.new(this.sushi.address, dev, '100', '300', '1000', { from: alice });
  //     await this.sushi.transferOwnership(this.chef.address, { from: alice });
  //     await this.chef.add('100', this.lp.address, true);
  //     await this.lp.approve(this.chef.address, '1000', { from: alice });
  //     await this.lp.approve(this.chef.address, '1000', { from: bob });
  //     await this.lp.approve(this.chef.address, '1000', { from: carol });
  //     // Alice deposits 10 LPs at block 310
  //     await time.advanceBlockTo('309');
  //     await this.chef.deposit(0, '10', { from: alice });
  //     // Bob deposits 20 LPs at block 314
  //     await time.advanceBlockTo('313');
  //     await this.chef.deposit(0, '20', { from: bob });
  //     // Carol deposits 30 LPs at block 318
  //     await time.advanceBlockTo('317');
  //     await this.chef.deposit(0, '30', { from: carol });
  //     // Alice deposits 10 more LPs at block 320. At this point:
  //     //   Alice should have: 4*1000 + 4*1/3*1000 + 2*1/6*1000 = 5666
  //     //   MasterChef should have the remaining: 10000 - 5666 = 4334
  //     await time.advanceBlockTo('319')
  //     await this.chef.deposit(0, '10', { from: alice });
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '11000');
  //     assert.equal((await this.sushi.balanceOf(alice)).valueOf(), '5666');
  //     assert.equal((await this.sushi.balanceOf(bob)).valueOf(), '0');
  //     assert.equal((await this.sushi.balanceOf(carol)).valueOf(), '0');
  //     assert.equal((await this.sushi.balanceOf(this.chef.address)).valueOf(), '4334');
  //     assert.equal((await this.sushi.balanceOf(dev)).valueOf(), '1000');
  //     // Bob withdraws 5 LPs at block 330. At this point:
  //     //   Bob should have: 4*2/3*1000 + 2*2/6*1000 + 10*2/7*1000 = 6190
  //     await time.advanceBlockTo('329')
  //     await this.chef.withdraw(0, '5', { from: bob });
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '22000');
  //     assert.equal((await this.sushi.balanceOf(alice)).valueOf(), '5666');
  //     assert.equal((await this.sushi.balanceOf(bob)).valueOf(), '6190');
  //     assert.equal((await this.sushi.balanceOf(carol)).valueOf(), '0');
  //     assert.equal((await this.sushi.balanceOf(this.chef.address)).valueOf(), '8144');
  //     assert.equal((await this.sushi.balanceOf(dev)).valueOf(), '2000');
  //     // Alice withdraws 20 LPs at block 340.
  //     // Bob withdraws 15 LPs at block 350.
  //     // Carol withdraws 30 LPs at block 360.
  //     await time.advanceBlockTo('339')
  //     await this.chef.withdraw(0, '20', { from: alice });
  //     await time.advanceBlockTo('349')
  //     await this.chef.withdraw(0, '15', { from: bob });
  //     await time.advanceBlockTo('359')
  //     await this.chef.withdraw(0, '30', { from: carol });
  //     assert.equal((await this.sushi.totalSupply()).valueOf(), '55000');
  //     assert.equal((await this.sushi.balanceOf(dev)).valueOf(), '5000');
  //     // Alice should have: 5666 + 10*2/7*1000 + 10*2/6.5*1000 = 11600
  //     assert.equal((await this.sushi.balanceOf(alice)).valueOf(), '11600');
  //     // Bob should have: 6190 + 10*1.5/6.5 * 1000 + 10*1.5/4.5*1000 = 11831
  //     assert.equal((await this.sushi.balanceOf(bob)).valueOf(), '11831');
  //     // Carol should have: 2*3/6*1000 + 10*3/7*1000 + 10*3/6.5*1000 + 10*3/4.5*1000 + 10*1000 = 26568
  //     assert.equal((await this.sushi.balanceOf(carol)).valueOf(), '26568');
  //     // All of them should have 1000 LPs back.
  //     assert.equal((await this.lp.balanceOf(alice)).valueOf(), '1000');
  //     assert.equal((await this.lp.balanceOf(bob)).valueOf(), '1000');
  //     assert.equal((await this.lp.balanceOf(carol)).valueOf(), '1000');
  //   });

  //   it('should give proper SUSHIs allocation to each pool', async () => {
  //     // 100 per block farming rate starting at block 400 with bonus until block 1000
  //     const factory = new MasterChefFactory(alice);
  //     this.chef = await MasterChef.new(this.sushi.address, dev, '100', '400', '1000', { from: alice });
  //     await this.sushi.transferOwnership(this.chef.address, { from: alice });
  //     await this.lp.approve(this.chef.address, '1000', { from: alice });
  //     await this.lp2.approve(this.chef.address, '1000', { from: bob });
  //     // Add first LP to the pool with allocation 1
  //     await this.chef.add('10', this.lp.address, true);
  //     // Alice deposits 10 LPs at block 410
  //     await time.advanceBlockTo('409');
  //     await this.chef.deposit(0, '10', { from: alice });
  //     // Add LP2 to the pool with allocation 2 at block 420
  //     await time.advanceBlockTo('419');
  //     await this.chef.add('20', this.lp2.address, true);
  //     // Alice should have 10*1000 pending reward
  //     assert.equal((await this.chef.pendingSushi(0, alice)).valueOf(), '10000');
  //     // Bob deposits 10 LP2s at block 425
  //     await time.advanceBlockTo('424');
  //     await this.chef.deposit(1, '5', { from: bob });
  //     // Alice should have 10000 + 5*1/3*1000 = 11666 pending reward
  //     assert.equal((await this.chef.pendingSushi(0, alice)).valueOf(), '11666');
  //     await time.advanceBlockTo('430');
  //     // At block 430. Bob should get 5*2/3*1000 = 3333. Alice should get ~1666 more.
  //     assert.equal((await this.chef.pendingSushi(0, alice)).valueOf(), '13333');
  //     assert.equal((await this.chef.pendingSushi(1, bob)).valueOf(), '3333');
  //   });

  //   it('should stop giving bonus SUSHIs after the bonus period ends', async () => {
  //     // 100 per block farming rate starting at block 500 with bonus until block 600
  //     const factory = new MasterChefFactory(alice);
  //     this.chef = await MasterChef.new(this.sushi.address, dev, '100', '500', '600', { from: alice });
  //     await this.sushi.transferOwnership(this.chef.address, { from: alice });
  //     await this.lp.approve(this.chef.address, '1000', { from: alice });
  //     await this.chef.add('1', this.lp.address, true);
  //     // Alice deposits 10 LPs at block 590
  //     await time.advanceBlockTo('589');
  //     await this.chef.deposit(0, '10', { from: alice });
  //     // At block 605, she should have 1000*10 + 100*5 = 10500 pending.
  //     await time.advanceBlockTo('605');
  //     assert.equal((await this.chef.pendingSushi(0, alice)).valueOf(), '10500');
  //     // At block 606, Alice withdraws all pending rewards and should get 10600.
  //     await this.chef.deposit(0, '0', { from: alice });
  //     assert.equal((await this.chef.pendingSushi(0, alice)).valueOf(), '0');
  //     assert.equal((await this.sushi.balanceOf(alice)).valueOf(), '10600');
  //   });
  });
});