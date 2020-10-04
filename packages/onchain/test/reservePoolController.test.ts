import {ethers} from '@nomiclabs/buidler';
import {Signer, Contract, Wallet} from 'ethers';
import chai from 'chai';
import {deployContract, solidity} from 'ethereum-waffle';
import UniswapV2FactoryArtifact from '@uniswap/v2-core/build/UniswapV2Factory.json';
import IUniswapV2PairArtifact from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import {ReservePoolController} from '../typechain/ReservePoolController';
import {ReservePoolControllerFactory} from '../typechain/ReservePoolControllerFactory';
import {expandTo18Decimals} from './shared/utilities';
import {BtcPriceOracle} from '../typechain/BtcPriceOracle';
import {BtcPriceOracleFactory} from '../typechain/BtcPriceOracleFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';
import {MockFlashErc20} from '../typechain/MockFlashErc20';
import {MockFlashErc20Factory} from '../typechain/MockFlashErc20Factory';
import {UniswapV2Router01} from '../typechain/UniswapV2Router01';
import {UniswapV2Router01Factory} from '../typechain/UniswapV2Router01Factory';
import {IUniswapV2Factory} from '../typechain/IUniswapV2Factory';
import {IUniswapV2Pair} from '../typechain/IUniswapV2Pair';
import {MockBFactory} from '../typechain/MockBFactory';
import {MockBFactoryFactory} from '../typechain/MockBFactoryFactory';
import {BPool} from '../typechain/BPool';
import {BPoolFactory} from '../typechain/BPoolFactory';

chai.use(solidity);
const {expect} = chai;
const wEthAmount = expandTo18Decimals(40);
const tBtcAmount = expandTo18Decimals(1);

describe('ReservePoolController', async () => {
  let signers: Signer[];
  let wEth: MockErc20;
  let tBtc: MockErc20; // abstract tokenized bitcoin - used for feed
  let vBtc: MockErc20;
  let feedPair: IUniswapV2Pair;
  let spotPair: IUniswapV2Pair;

  let bFactory: MockBFactory;
  let bPool: BPool;
  let factoryV2: IUniswapV2Factory;
  let router: UniswapV2Router01;

  let oracle: BtcPriceOracle;
  let controller: ReservePoolController;

  before(async () => {
    signers = await ethers.signers();
    const devAddr = await signers[0].getAddress();
    // address _wEthAddr,
    wEth = await new MockErc20Factory(signers[0]).deploy('wEth', 'WETH', expandTo18Decimals(10000));
    // address _wEthAddr,
    tBtc = await new MockErc20Factory(signers[0]).deploy(
      'tokenized BTC',
      'TBTC',
      expandTo18Decimals(10000)
    );
    // address _vBtcAddr,
    vBtc = await new MockFlashErc20Factory(signers[0]).deploy(
      'vBTC',
      'VBTC',
      expandTo18Decimals(10000)
    );

    // deploy V2
    factoryV2 = (await deployContract(<Wallet>signers[0], UniswapV2FactoryArtifact, [
      devAddr,
    ])) as IUniswapV2Factory;
    // deploy router
    router = await new UniswapV2Router01Factory(signers[0]).deploy(factoryV2.address, wEth.address);

    // create FEED - WETH/tBTC pair
    await factoryV2.createPair(wEth.address, tBtc.address);
    const feedPairAddress = await factoryV2.getPair(wEth.address, tBtc.address);
    feedPair = new Contract(
      feedPairAddress,
      JSON.stringify(IUniswapV2PairArtifact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    // create SPOT - WETH/vBTC pair
    await factoryV2.createPair(wEth.address, vBtc.address);
    const spotPairAddress = await factoryV2.getPair(wEth.address, vBtc.address);
    spotPair = new Contract(
      spotPairAddress,
      JSON.stringify(IUniswapV2PairArtifact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    // add addLiquidity
    await wEth.transfer(feedPair.address, wEthAmount);
    await tBtc.transfer(feedPair.address, tBtcAmount);
    await feedPair.mint(devAddr);
    await wEth.transfer(spotPair.address, wEthAmount);
    await vBtc.transfer(spotPair.address, tBtcAmount);
    await spotPair.mint(devAddr);

    // deploy oracle
    oracle = await new BtcPriceOracleFactory(signers[0]).deploy(factoryV2.address, wEth.address, [
      tBtc.address,
    ]);

    // address _bPoolFactory,
    bFactory = await new MockBFactoryFactory(signers[0]).deploy();

    // create the controller
    controller = await new ReservePoolControllerFactory(signers[0]).deploy(
      vBtc.address,
      wEth.address,
      bFactory.address,
      router.address,
      oracle.address
    );
  });

  it('should deploy', async () => {
    // update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 24]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // initialize
    await wEth.transfer(controller.address, wEthAmount.mul(10));
    await vBtc.transfer(controller.address, tBtcAmount.mul(10));
    const initialTradeFee = expandTo18Decimals(1).div(200); // 0.5%
    await controller.initialize(initialTradeFee);
    // try initialize again
    await expect(controller.initialize(initialTradeFee)).to.be.reverted;
    // try some trade
    await expect(controller.resyncWeights()).to.be.reverted;
    // set pool for later
    bPool = new BPoolFactory(signers[0]).attach(await controller.bPool());
  });

  it('should resync when SPOT under FEED', async () => {
    // check prices before trades
    let reserves = await spotPair.getReserves();
    let wEthBal = await bPool.getBalance(wEth.address);
    let vBtcBal = await bPool.getBalance(vBtc.address);
    let wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    let vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    let priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    let priceUni = reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);

    // do some swaps, get pools out of sync
    const devAddr = await signers[0].getAddress();
    await wEth.transfer(spotPair.address, expandTo18Decimals(4));
    await spotPair.swap(0, '90636363636363636', devAddr, '0x');

    // update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 24]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();

    // resync pools
    await controller.resyncWeights();

    // check price after trade
    reserves = await spotPair.getReserves();
    wEthBal = await bPool.getBalance(wEth.address);
    vBtcBal = await bPool.getBalance(vBtc.address);
    wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    priceUni = reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);
  });

  it('should resync when SPOT over FEED', async () => {
    // check prices before trades
    let reserves = await spotPair.getReserves();
    let wEthBal = await bPool.getBalance(wEth.address);
    let vBtcBal = await bPool.getBalance(vBtc.address);
    let wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    let vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    let priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    let priceUni = reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);

    // do some swaps, get pools out of sync
    const devAddr = await signers[0].getAddress();
    await vBtc.transfer(spotPair.address, '300000000000000000');
    await spotPair.swap(0, '7976000000000000000', devAddr, '0x');
    // update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 24]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();

    // resync pools
    const rsp = await controller.resyncWeights();
    const tx = await rsp.wait(1);

    // check price after trade
    reserves = await spotPair.getReserves();
    wEthBal = await bPool.getBalance(wEth.address);
    vBtcBal = await bPool.getBalance(vBtc.address);
    wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    priceUni = reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);
  });
});
