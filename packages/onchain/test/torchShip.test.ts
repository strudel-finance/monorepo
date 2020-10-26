import {ethers, upgrades} from '@nomiclabs/buidler';
import {Signer, Contract} from 'ethers';
import {getAdminAddress} from '@openzeppelin/upgrades-core';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import {expandTo18Decimals, advanceBlock} from './shared/utilities';
import {StrudelToken} from '../typechain/StrudelToken';
import {StrudelTokenFactory} from '../typechain/StrudelTokenFactory';
import ProxyAdminArtifact from '@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json';
import AdminUpgradeabilityProxy from '@openzeppelin/upgrades-core/artifacts/AdminUpgradeabilityProxy.json';
import {V1TorchShip} from '../typechain/V1TorchShip';
import {V1TorchShipFactory} from '../typechain/V1TorchShipFactory';
import {TorchShip} from '../typechain/TorchShip';
import {TorchShipFactory} from '../typechain/TorchShipFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';

chai.use(solidity);
const {expect} = chai;

async function deployStrudel(signer: Signer): Promise<StrudelToken> {
  let factory = new StrudelTokenFactory(signer);
  return factory.deploy();
}

async function deployShip(
  dev: Signer,
  strudel: StrudelToken,
  strudelPerBlock: number,
  startBlock: number,
  bonusEndBlock: number,
  bonusMultiplier: number
): Promise<TorchShip> {
  let [alice] = await ethers.getSigners();

  // deploy the thing
  const TorchShip = (await ethers.getContractFactory('V1TorchShip')).connect(dev);
  const torchShip = await upgrades.deployProxy(
    TorchShip,
    [
      strudel.address,
      expandTo18Decimals(strudelPerBlock),
      startBlock,
      bonusEndBlock,
      bonusMultiplier,
    ],
    {unsafeAllowCustomTypes: true}
  );
  await torchShip.deployed();

  // prepare strudel
  await strudel.addMinter(torchShip.address);
  return torchShip as TorchShip;
}

describe('TorchShip', async () => {
  let instance: StrudelToken;
  let alice: Signer;
  let bob: Signer;
  let carol: Signer;
  let dev: Signer;
  let minter: Signer;

  beforeEach(async () => {
    [alice, bob, carol, dev, minter] = await ethers.getSigners();
    instance = await deployStrudel(dev);
  });

  it('should set correct state variables', async () => {
    const torchShip = await deployShip(dev, instance, 1000, 0, 1000, 4);

    // check params
    const devFundDivRate = await torchShip.connect(alice).devFundDivRate();
    expect(devFundDivRate).to.eq(17);
    const strudelPerBlock = await torchShip.strudelPerBlock();
    expect(strudelPerBlock).to.eq(expandTo18Decimals(1000));
    expect(await instance.isMinter(torchShip.address)).to.be.true;
  });

  it('should test governance functions');

  it('should allow owner and only owner to transfer ownership', async () => {
    const torchShip = await deployShip(dev, instance, 1000, 0, 1000, 1);
    const aliceAddr = await alice.getAddress();
    const bobAddr = await bob.getAddress();

    const proxy = new Contract(
      await torchShip.address,
      JSON.stringify(AdminUpgradeabilityProxy.abi),
      ethers.provider
    );
    const devAddr = await dev.getAddress();
    expect((await torchShip.connect(alice).owner()).valueOf()).to.eq(devAddr);
    await expect(torchShip.connect(bob).transferOwnership(devAddr)).to.be.revertedWith(
      'caller is not the owner'
    );
    await torchShip.connect(dev).functions.transferOwnership(bobAddr);
    expect((await torchShip.owner()).valueOf()).to.eq(bobAddr);
    await torchShip.connect(bob).functions.transferOwnership(aliceAddr);
    expect((await torchShip.owner()).valueOf()).to.eq(aliceAddr);
  });

  describe('With ERC/LP token added to the field', () => {
    let lp: MockErc20;
    let lp2: MockErc20;
    beforeEach(async () => {
      lp = await new MockErc20Factory(minter).deploy('LPToken', 'LP', 18, '10000000000');
      const aliceAddr = await alice.getAddress();
      await lp.connect(minter).transfer(aliceAddr, '1000');
      const bobAddr = await bob.getAddress();
      await lp.transfer(bobAddr, '1000');
      const carolAddr = await carol.getAddress();
      await lp.transfer(carolAddr, '1000');
      lp2 = await new MockErc20Factory(minter).deploy('LPToken2', 'LP2', 18, '10000000000');
      await lp2.transfer(aliceAddr, '1000');
      await lp2.transfer(bobAddr, '1000');
      await lp2.transfer(carolAddr, '1000');
    });

    it('should allow emergency withdraw', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const torchShip = await deployShip(
        dev,
        instance,
        100, // $TRDL per block
        100, // start block
        1000, // bonus end block
        1
      );
      await torchShip.connect(dev).add('100', lp.address, true);
      await lp.connect(bob).approve(torchShip.address, '1000');
      await torchShip.connect(bob).deposit(0, '100');
      const bobAddr = await bob.getAddress();
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('900');
      await torchShip.connect(bob).emergencyWithdraw(0);
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq('1000');
    });

    it('should give out $TRDL only after farming start time', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const torchShip = await deployShip(
        dev,
        instance,
        100, // $TRDL per block
        150, // start block
        1000, // reward end block
        10
      );
      await torchShip.connect(dev).setDevFundDivRate(50);
      await torchShip.connect(dev).add('100', lp.address, true);
      await lp.connect(bob).approve(torchShip.address, '1000');
      await torchShip.connect(bob).deposit(0, '100');
      await advanceBlock(139);
      await torchShip.connect(bob).deposit(0, '0'); // block 140
      const bobAddr = await bob.getAddress();
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      await advanceBlock(144);
      await torchShip.connect(bob).deposit(0, '0'); // block 145
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      await advanceBlock(149);
      await torchShip.connect(bob).deposit(0, '0'); // block 150
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      await torchShip.connect(bob).deposit(0, '0'); // block 151
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(1000));
      await advanceBlock(154);
      await torchShip.connect(bob).deposit(0, '0'); // block 155
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(5000));
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq(expandTo18Decimals(100));
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(5100));
    });

    it('should not distribute $TRDL if no one deposit', async () => {
      // 100 per block farming rate starting at block 200 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const torchShip = await deployShip(dev, instance, 100, 200, 1000, 10);
      await torchShip.connect(dev).setDevFundDivRate(50);
      await torchShip.connect(dev).add('100', lp.address, true);
      await lp.connect(bob).approve(torchShip.address, '1000');
      await advanceBlock(199);
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(0));
      await advanceBlock(205);
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(0));
      await advanceBlock(209);
      await torchShip.connect(bob).deposit(0, '10'); // block 210
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(0));
      const bobAddr = await bob.getAddress();
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq(990);
      await advanceBlock(219);
      await torchShip.connect(bob).withdraw(0, '10'); // block 220
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(10200));
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(10000));
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq(expandTo18Decimals(200));
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq(1000);
    });

    it('should distribute $TRDL properly for each staker with upgrade in between', async () => {
      // 100 per block farming rate starting at block 300 with bonus until block 1000
      const devAddr = await dev.getAddress();
      let torchShip = await deployShip(dev, instance, 100, 300, 1000, 10);
      await torchShip.connect(dev).setDevFundDivRate(50);
      await torchShip.connect(dev).add('100', lp.address, true);
      await lp.connect(alice).approve(torchShip.address, '1000');
      await lp.connect(bob).approve(torchShip.address, '1000');
      await lp.connect(carol).approve(torchShip.address, '1000');
      // Alice deposits 10 LPs at block 310
      await advanceBlock(309);
      await torchShip.connect(alice).deposit(0, '10');
      // Bob deposits 20 LPs at block 314
      await advanceBlock(313);
      await torchShip.connect(bob).deposit(0, '20');
      // Carol deposits 30 LPs at block 318
      await advanceBlock(317);
      await torchShip.connect(carol).deposit(0, '30');
      // Alice deposits 10 more LPs at block 320. At this point:
      //   Alice should have: 4*1000 + 4*1/3*1000 + 2*1/6*1000 = 5666
      //   TorchShip should have the remaining: 10000 - 5666 = 4334
      await advanceBlock(319);
      await torchShip.connect(alice).deposit(0, '10');
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(10200));
      const aliceAddr = await alice.getAddress();
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('5666666666666666666666');
      const bobAddr = await bob.getAddress();
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      const carolAddr = await carol.getAddress();
      expect((await instance.balanceOf(carolAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      expect((await instance.balanceOf(torchShip.address)).valueOf()).to.eq(
        '4333333333333333333334'
      );
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq(expandTo18Decimals(200));
      // Bob withdraws 5 LPs at block 330. At this point:
      // Bob should have: 4*2/3*1000 + 2*2/6*1000 + 10*2/7*1000 = 6190
      await advanceBlock(329);
      await torchShip.connect(bob).withdraw(0, '5');
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(20400));
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('5666666666666666666666');
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('6190476190476190476190');
      expect((await instance.balanceOf(carolAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      expect((await instance.balanceOf(torchShip.address)).valueOf()).to.eq(
        '8142857142857142857144'
      );
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq(expandTo18Decimals(400));

      // do a contract upgrade
      const TorchShip = (await ethers.getContractFactory('TorchShip')).connect(dev);
      torchShip = (await upgrades.upgradeProxy(
        torchShip.address,
        TorchShip,
        {unsafeAllowCustomTypes: true}
      )) as TorchShip;

      // check variables
      let lastBlockHeight = await torchShip.lastBlockHeight();
      expect(lastBlockHeight).to.eq(1000);
      let windowSize = await torchShip.windowSize();
      expect(windowSize).to.eq(10);

      // activate variance
      const refToken = await new MockErc20Factory(minter).deploy('VBTC', 'VBTC', 18, '10000000000');
      await torchShip.initVariance(refToken.address, 63, 7);
      let multiplier = await torchShip.getMultiplier(0,1);
      console.log(multiplier.toString());

      // check variables again
      lastBlockHeight = await torchShip.lastBlockHeight();
      expect(lastBlockHeight).to.eq(325); // 332 - 7
      windowSize = await torchShip.windowSize();
      expect(windowSize).to.eq(63);
   


      // Alice withdraws 20 LPs at block 340.
      // Bob withdraws 15 LPs at block 350.
      // Carol withdraws 30 LPs at block 360.
      await advanceBlock(339);
      let ui = await torchShip.userInfo(0, aliceAddr);
      console.log(ui);
      let sps = await torchShip.poolInfo(0);
      console.log(sps);
      await torchShip.connect(alice).withdraw(0, '20');
      ui = await torchShip.userInfo(0, aliceAddr);
      console.log(ui);
      sps = await torchShip.poolInfo(0);
      console.log(sps);
      await advanceBlock(349);
      await torchShip.connect(bob).withdraw(0, '15');
      await advanceBlock(359);
      const exp = await torchShip.pendingStrudel(0, carolAddr);
      console.log('expected: ', exp);
      await torchShip.connect(carol).withdraw(0, '30');

      multiplier = await torchShip.getMultiplier(0,1);
      console.log(multiplier.toString());
      expect((await instance.totalSupply()).valueOf()).to.eq(expandTo18Decimals(24786));
      expect((await instance.balanceOf(devAddr)).valueOf()).to.eq(expandTo18Decimals(486));
      // Alice should have: 5666 + 10*2/7*1000 + 4*2/6.5*1000 + 6*2/6.5*100 = 9938.52747253
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq('9785347985347985347985');
      // Bob should have: 6190 + 4*1.5/6.5 * 1000 + 6*1.5/6.5 * 100 + 10*1.5/4.5*100 = 7584.87179487
      expect((await instance.balanceOf(bobAddr)).valueOf()).to.eq('7169963369963369963370');
      // Carol should have: 2*3/6*1000 + 10*3/7*1000 + 10*3/6.5*1000 + 10*3/4.5*1000 + 10*1000 = 26568
      // Carol should have: 2*3/6*1000 + 10*3/7*1000 + 4*3/6.5*1000 + 6*3/6.5*100 + 10*3/4.5*100 + 10*100 = 9075.45787546
      expect((await instance.balanceOf(carolAddr)).valueOf()).to.eq('26567765567765567765568');
      const rs = await instance.balanceOf(torchShip.address);
      console.log(rs);
      // All of them should have 1000 LPs back.
      expect((await lp.balanceOf(aliceAddr)).valueOf()).to.eq(1000);
      expect((await lp.balanceOf(bobAddr)).valueOf()).to.eq(1000);
      expect((await lp.balanceOf(carolAddr)).valueOf()).to.eq(1000);
    });

    it('should give proper $TRDL allocation to each pool', async () => {
      // 100 per block farming rate starting at block 400 with bonus until block 1000
      const devAddr = await dev.getAddress();
      const torchShip = await deployShip(dev, instance, 100, 400, 1000, 10);
      await torchShip.connect(dev).setDevFundDivRate(50);
      await lp.connect(alice).approve(torchShip.address, '1000');
      await lp2.connect(bob).approve(torchShip.address, '1000');
      // Add first LP to the pool with allocation 1
      await torchShip.connect(dev).add('10', lp.address, true);
      // Alice deposits 10 LPs at block 410
      await advanceBlock(409);
      await torchShip.connect(alice).deposit(0, '10');
      // Add LP2 to the pool with allocation 2 at block 420
      await advanceBlock(419);
      await torchShip.connect(dev).add('20', lp2.address, true);
      // Alice should have 10*1000 pending reward
      const aliceAddr = await alice.getAddress();
      expect((await torchShip.pendingStrudel(0, aliceAddr)).valueOf()).to.eq(
        expandTo18Decimals(10000)
      );
      // Bob deposits 10 LP2s at block 425
      await advanceBlock(424);
      await torchShip.connect(bob).deposit(1, '5');
      // Alice should have 10000 + 5*1/3*1000 = 11666 pending reward
      expect((await torchShip.pendingStrudel(0, aliceAddr)).valueOf()).to.eq(
        '11666666666666666666666'
      );
      await advanceBlock(430);
      // At block 430. Bob should get 5*2/3*1000 = 3333. Alice should get ~1666 more.
      expect((await torchShip.pendingStrudel(0, aliceAddr)).valueOf()).to.eq(
        '13333333333333333333333'
      );
      const bobAddr = await bob.getAddress();
      expect((await torchShip.pendingStrudel(1, bobAddr)).valueOf()).to.eq(
        '3333333333333333333333'
      );
    });

    it('should stop giving bonus $TRDL after the bonus period ends', async () => {
      // 100 per block farming rate starting at block 500 with bonus until block 600
      const devAddr = await dev.getAddress();
      const torchShip = await deployShip(dev, instance, 100, 500, 600, 10);
      await torchShip.connect(dev).setDevFundDivRate(50);
      await lp.connect(alice).approve(torchShip.address, '1000');
      await torchShip.connect(dev).add('1', lp.address, true);
      // Alice deposits 10 LPs at block 590
      await advanceBlock(589);
      await torchShip.connect(alice).deposit(0, '10');
      // At block 605, she should have 1000*10 + 100*5 = 10500 pending.
      await advanceBlock(605);
      const aliceAddr = await alice.getAddress();
      expect((await torchShip.pendingStrudel(0, aliceAddr)).valueOf()).to.eq(
        expandTo18Decimals(10500)
      );
      // At block 606, Alice withdraws all pending rewards and should get 10600.
      await torchShip.connect(alice).deposit(0, '0');
      expect((await torchShip.pendingStrudel(0, aliceAddr)).valueOf()).to.eq(expandTo18Decimals(0));
      expect((await instance.balanceOf(aliceAddr)).valueOf()).to.eq(expandTo18Decimals(10600));
    });
  });
});
