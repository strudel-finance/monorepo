import {ethers, upgrades} from 'hardhat';
import {Signer} from 'ethers';
import chai from 'chai';
import vector from './testVector.json';
import {expandTo18Decimals, advanceTime} from './shared/utilities';
import {MockERC20} from '../typechain/MockERC20';
import {MockPriceOracle} from '../typechain/MockPriceOracle';
import {DutchSwapAuction} from '../typechain/DutchSwapAuction';
import {DutchSwapFactory} from '../typechain/DutchSwapFactory';
import {AuctionManager} from '../typechain/AuctionManager';

const {expect} = chai;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe('AuctionManager', () => {
  let alice: Signer;
  let bob: Signer;
  let auctionTemplate: DutchSwapAuction;
  let factory: DutchSwapFactory;
  let strudel: MockERC20;
  let vBtc: MockERC20;
  let btcPriceOracle: MockPriceOracle;
  let vBtcPriceOracle: MockPriceOracle;
  let strudelPriceOracle: MockPriceOracle;
  let auctionManager: AuctionManager;

  before(async () => {
    [alice, bob] = await ethers.getSigners();
    const MockErc20Factory = await ethers.getContractFactory('MockERC20');
    strudel = (await MockErc20Factory.deploy(
      'Strudel',
      '$TRDL',
      18,
      expandTo18Decimals(200000)
    )) as MockERC20;
    vBtc = (await MockErc20Factory.deploy('VBTC', 'VBTC', 18, expandTo18Decimals(8))) as MockERC20;
    const bobAddr = await bob.getAddress();
    await vBtc.transfer(bobAddr, expandTo18Decimals(8));
    const DutchSwapAuctionFactory = await ethers.getContractFactory('DutchSwapAuction');
    auctionTemplate = (await DutchSwapAuctionFactory.deploy()) as DutchSwapAuction;
    const DutchSwapFactoryFactory = await ethers.getContractFactory('DutchSwapFactory');
    factory = (await DutchSwapFactoryFactory.deploy()) as DutchSwapFactory;
    await factory.initDutchSwapFactory(auctionTemplate.address, 0);
    const MockPriceOracleFactory = await ethers.getContractFactory('MockPriceOracle');
    btcPriceOracle = (await MockPriceOracleFactory.deploy()) as MockPriceOracle;
    vBtcPriceOracle = (await MockPriceOracleFactory.deploy()) as MockPriceOracle;
    strudelPriceOracle = (await MockPriceOracleFactory.deploy()) as MockPriceOracle;
    const AuctionManagerFactory = await ethers.getContractFactory('AuctionManager');
    auctionManager = (await AuctionManagerFactory.deploy(
      strudel.address,
      vBtc.address,
      btcPriceOracle.address,
      vBtcPriceOracle.address,
      strudelPriceOracle.address,
      factory.address
    )) as AuctionManager;
  });

  it('should allow to start auction', async () => {
    // start an auction that buys vBTC
    // BTC price is over vBTC price
    await btcPriceOracle.update('32000000');
    await vBtcPriceOracle.update('20000000');
    await strudelPriceOracle.update('200');
    await auctionManager.rotateAuctions();
    let currentAuctionAddr = await auctionManager.currentAuction();
    const DutchSwapAuctionFactory = await ethers.getContractFactory('DutchSwapAuction');
    const auction = DutchSwapAuctionFactory.attach(currentAuctionAddr);

    // participate in vBTC buy auction
    await advanceTime(60 * 60 * 11 + 60 * 45);
    await vBtc.connect(bob).approve(auction.address, expandTo18Decimals(100));
    await auction.connect(bob).commitTokens('7000000000000000');

    // try to ratate before finished:
    await expect(auctionManager.rotateAuctions()).to.be.revertedWith(
      "previous auction hasn't ended"
    );

    // buy the rest
    await auction.connect(bob).commitTokens('8000000000000000');

    // rotate into an auction that sells vBTC
    await advanceTime(60 * 60 * 12);
    await vBtcPriceOracle.update('40000000');

    // check results of previous auction
    // vBTC Amount: 0.0002 / 20 = 0.00001
    // at about half the time, the price should be ~0.014
    let bal = await vBtc.balanceOf(auction.address);
    expect(bal.div('100000000000000').toString()).to.eq('139');
    await auctionManager.rotateAuctions();
    currentAuctionAddr = await auctionManager.currentAuction();
    const auction2 = DutchSwapAuctionFactory.attach(currentAuctionAddr);

    // check results of buy auction
    await auction.connect(bob).withdrawTokens();
    // outstanding supply: 10 vBTC
    // imbalance in ETH: (32 - 20) * 10 = 120 ETH
    // imbalance in $TRDL: 120 ETH / 0.0002 = 600,000 $TRDL
    // dillution bound: 200,000 * 0.007 = 1,400 $TRDL
    const bobAddr = await bob.getAddress();
    bal = await strudel.balanceOf(bobAddr);
    expect(bal.toString()).to.eq('1400000000000000000000');

    // participate in vBTC sell auction
    await advanceTime(60 * 60 * 11 + 60 * 45);
    // outstanding supply: 10 - 0.014 = 9.986 vBTC
    // imbalance in ETH: (40 - 32) * 9.986 = 79.888 ETH
    // imbalance in $TRDL: 120 ETH / 0.0002 = 399,440 $TRDL
    // dillution bound: 201,400 * 0.007 = 1,409.8 $TRDL
    await strudel.connect(alice).approve(auction2.address, expandTo18Decimals(1410));
    await auction2.connect(alice).commitTokens(expandTo18Decimals(1410));
    bal = await strudel.balanceOf(auction2.address);
    expect(bal.div(expandTo18Decimals(1))).to.eq('1409');

    // rotate into an auction that sells vBTC
    await advanceTime(60 * 60 * 12);
    // manually finalize auction
    await auction2.finaliseAuction();
    // set up prices close to peg, to test dust threshold
    await vBtcPriceOracle.update('31999900');
    // rotate should fail gracefully on finalize and cary on
    await auctionManager.rotateAuctions();

    // check results
    await auction2.connect(alice).withdrawTokens();
    // vBTC Amount: 0.0002 / 40 = 0.000005
    // at about half the time, the price should be
    // 0.000005 * 1410 = ~0.00705
    const aliceAddr = await alice.getAddress();
    bal = await vBtc.balanceOf(aliceAddr);
    expect(bal.div('10000000000000').toString()).to.eq('704');

    const current = await auctionManager.currentAuction();
    expect(current, ZERO_ADDRESS);
  });

  it('should allow only owner to swipe and renounce', async () => {
    await vBtc.connect(bob).transfer(auctionManager.address, '1000000000');

    await expect(auctionManager.connect(bob).swipe(vBtc.address)).to.be.reverted;

    await auctionManager.swipe(vBtc.address);
    const bal = await vBtc.balanceOf(auctionManager.address);
    expect(bal).to.eq(0);

    await expect(auctionManager.connect(bob).renounceMinter()).to.be.reverted;
    await auctionManager.renounceMinter();
  });
});
