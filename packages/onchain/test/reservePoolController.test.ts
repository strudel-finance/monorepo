import {ethers, upgrades} from '@nomiclabs/buidler';
import {Signer, Contract, Wallet, BigNumber} from 'ethers';
import chai from 'chai';
import {deployContract, solidity, MockProvider} from 'ethereum-waffle';
import UniswapV2FactoryArtifact from '@uniswap/v2-core/build/UniswapV2Factory.json';
import IUniswapV2PairArtifact from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import UniswapV2Router02Artifact from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import {ReservePoolController} from '../typechain/ReservePoolController';
import {ReservePoolControllerFactory} from '../typechain/ReservePoolControllerFactory';
import {expandTo18Decimals, getApprovalDigest} from './shared/utilities';
import {BtcPriceOracle} from '../typechain/BtcPriceOracle';
import {BtcPriceOracleFactory} from '../typechain/BtcPriceOracleFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';
import {MockFlashErc20} from '../typechain/MockFlashErc20';
import {MockFlashErc20Factory} from '../typechain/MockFlashErc20Factory';
import {IUniswapV2Router02} from '../typechain/IUniswapV2Router02';
import {IUniswapV2Factory} from '../typechain/IUniswapV2Factory';
import {IUniswapV2Pair} from '../typechain/IUniswapV2Pair';
import {MockBFactory} from '../typechain/MockBFactory';
import {MockBFactoryFactory} from '../typechain/MockBFactoryFactory';
import {BPool} from '../typechain/BPool';
import {BPoolFactory} from '../typechain/BPoolFactory';
import {ecsign} from 'ethereumjs-util';

chai.use(solidity);
const {expect} = chai;
const wEthAmount = expandTo18Decimals(40);
const tBtcAmount = expandTo18Decimals(1);
const MAX = ethers.constants.MaxUint256;

describe('ReservePoolController', async () => {
  let signers: Signer[];
  let wEth: MockFlashErc20;
  let tBtc: MockErc20; // abstract tokenized bitcoin - used for feed
  let vBtc: MockFlashErc20;
  let feedPair: IUniswapV2Pair;
  let spotPair: IUniswapV2Pair;

  let bFactory: MockBFactory;
  let bPool: BPool;
  let factoryV2: IUniswapV2Factory;
  let router: IUniswapV2Router02;

  let oracle: BtcPriceOracle;
  let controller: ReservePoolController;

  before(async () => {
    signers = await ethers.getSigners();
    const devAddr = await signers[0].getAddress();
    // address _wEthAddr,
    wEth = await new MockFlashErc20Factory(signers[0]).deploy(
      'wEth',
      'WETH',
      18,
      expandTo18Decimals(10000)
    );
    // address _wEthAddr,
    tBtc = await new MockErc20Factory(signers[0]).deploy(
      'tokenized BTC',
      'TBTC',
      18,
      expandTo18Decimals(10000)
    );
    // address _vBtcAddr,
    vBtc = await new MockFlashErc20Factory(signers[0]).deploy(
      'Strudel BTC',
      'VBTC',
      expandTo18Decimals(10000)
    );

    // deploy V2
    factoryV2 = (await deployContract(<Wallet>signers[0], UniswapV2FactoryArtifact, [
      devAddr,
    ])) as IUniswapV2Factory;

    // deploy router
    router = (await deployContract(
      <Wallet>signers[0],
      UniswapV2Router02Artifact,
      [factoryV2.address, wEth.address],
      {gasLimit: 5000000}
    )) as IUniswapV2Router02;

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
    const ReservePoolController = await ethers.getContractFactory('ReservePoolController');
    const pendingController = await upgrades.deployProxy(ReservePoolController, [
      vBtc.address,
      wEth.address,
      bFactory.address,
      router.address,
      oracle.address,
    ]);
    await pendingController.deployed();
    controller = pendingController as ReservePoolController;
  });

  it('should deploy', async () => {
    // update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 24]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // initialize
    await wEth.transfer(controller.address, wEthAmount.mul(2));
    await vBtc.transfer(controller.address, tBtcAmount.mul(2));
    const initialTradeFee = expandTo18Decimals(1).div(200); // 0.5%
    await controller.deployPool(initialTradeFee);

    // try initialize again
    await expect(controller.deployPool(initialTradeFee)).to.be.reverted;
    // try some trade
    await expect(controller.resyncWeights()).to.be.reverted;
    // set pool for later
    bPool = new BPoolFactory(signers[0]).attach(await controller.bPool());
  });

  it('should test all governance functions');

  it('should resync when SPOT under FEED', async () => {
    // check prices before trades
    const token0 = await spotPair.token0();
    let reserves = await spotPair.getReserves();
    let wEthBal = await bPool.getBalance(wEth.address);
    let vBtcBal = await bPool.getBalance(vBtc.address);
    let wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    let vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    let priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    let priceUni =
      token0 == wEth.address
        ? reserves.reserve0.div(reserves.reserve1)
        : reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);

    // do some swaps, get pools out of sync
    const devAddr = await signers[0].getAddress();
    const wEthIn = expandTo18Decimals(4);
    await wEth.transfer(spotPair.address, wEthIn);
    if (token0 == wEth.address) {
      let vBtcOut = reserves.reserve1.sub(
        reserves.reserve1.mul(reserves.reserve0).div(reserves.reserve0.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await spotPair.swap(0, vBtcOut, devAddr, '0x');
    } else {
      let vBtcOut = reserves.reserve0.sub(
        reserves.reserve0.mul(reserves.reserve1).div(reserves.reserve1.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await spotPair.swap(vBtcOut, 0, devAddr, '0x');
    }

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
    priceUni =
      token0 == wEth.address
        ? reserves.reserve0.div(reserves.reserve1)
        : reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);
  });

  it('should resync when SPOT over FEED', async () => {
    // check prices before trades
    const token0 = await spotPair.token0();
    let reserves = await spotPair.getReserves();
    let wEthBal = await bPool.getBalance(wEth.address);
    let vBtcBal = await bPool.getBalance(vBtc.address);
    let wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    let vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    let priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    let priceUni =
      token0 == wEth.address
        ? reserves.reserve0.div(reserves.reserve1)
        : reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);

    // do some swaps, get pools out of sync
    const devAddr = await signers[0].getAddress();
    const vBtcIn = BigNumber.from('300000000000000000');
    await vBtc.transfer(spotPair.address, vBtcIn);
    if (token0 == wEth.address) {
      let wEthOut = reserves.reserve0.sub(
        reserves.reserve0.mul(reserves.reserve1).div(reserves.reserve1.add(vBtcIn))
      );
      wEthOut = wEthOut.sub(wEthOut.mul(997).div(1000));
      await spotPair.swap(wEthOut, 0, devAddr, '0x');
    } else {
      let wEthOut = reserves.reserve1.sub(
        reserves.reserve1.mul(reserves.reserve0).div(reserves.reserve0.add(vBtcIn))
      );
      wEthOut = wEthOut.sub(wEthOut.mul(997).div(1000));
      await spotPair.swap(0, wEthOut, devAddr, '0x');
    }

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
    priceUni =
      token0 == wEth.address
        ? reserves.reserve0.div(reserves.reserve1)
        : reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);
  });

  it('should resync when SPOT much over FEED', async () => {
    // check prices before trades
    const token0 = await spotPair.token0();
    let reserves = await spotPair.getReserves();
    let wEthBal = await bPool.getBalance(wEth.address);
    let vBtcBal = await bPool.getBalance(vBtc.address);
    let wEthWeight = await bPool.getNormalizedWeight(wEth.address);
    let vBtcWeight = await bPool.getNormalizedWeight(vBtc.address);
    let priceBPool = wEthWeight.mul(wEthBal).div(vBtcWeight.mul(vBtcBal));
    let priceUni =
      token0 == wEth.address
        ? reserves.reserve0.div(reserves.reserve1)
        : reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);

    // do some swaps, get pools out of sync
    const devAddr = await signers[0].getAddress();
    const wEthIn = expandTo18Decimals(60);
    await wEth.transfer(spotPair.address, wEthIn);
    if (token0 == wEth.address) {
      let vBtcOut = reserves.reserve1.sub(
        reserves.reserve1.mul(reserves.reserve0).div(reserves.reserve0.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await spotPair.swap(0, vBtcOut, devAddr, '0x');
    } else {
      let vBtcOut = reserves.reserve0.sub(
        reserves.reserve0.mul(reserves.reserve1).div(reserves.reserve1.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await spotPair.swap(vBtcOut, 0, devAddr, '0x');
    }

    // try to steal the unicorns
    await expect(controller.resyncWeights()).to.be.revertedWith('hold the unicorns');
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
    priceUni =
      token0 == wEth.address
        ? reserves.reserve0.div(reserves.reserve1)
        : reserves.reserve1.div(reserves.reserve0);
    expect(priceBPool).to.eq(priceUni);

    const remainingBal = await vBtc.balanceOf(controller.address);
    expect(remainingBal).to.eq(0);
  });

  it('should fail resync when MAX_WEIGHT exceeded', async () => {
    const devAddr = await signers[0].getAddress();
    const token0 = await spotPair.token0();
    let reserves = await spotPair.getReserves();
    const wEthIn = expandTo18Decimals(80);
    await wEth.transfer(spotPair.address, wEthIn);
    if (token0 == wEth.address) {
      let vBtcOut = reserves.reserve1.sub(
        reserves.reserve1.mul(reserves.reserve0).div(reserves.reserve0.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await spotPair.swap(0, vBtcOut, devAddr, '0x');
    } else {
      let vBtcOut = reserves.reserve0.sub(
        reserves.reserve0.mul(reserves.reserve1).div(reserves.reserve1.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await spotPair.swap(vBtcOut, 0, devAddr, '0x');
    }

    // try to steal the unicorns

    // update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 24]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();

    // resync pools
    await expect(controller.resyncWeights()).to.be.revertedWith('max weight error');
  });

  describe('standard pool interaction', async () => {
    it('should join pool', async () => {
      const bPoolAddr = await controller.bPool();
      const alice = await signers[0].getAddress();
      let currentPoolBalance = await controller.balanceOf(alice);
      const previousPoolBalance = currentPoolBalance;
      let previousbPoolVbtcBalance = await vBtc.balanceOf(bPoolAddr);
      let previousbPoolWethBalance = await wEth.balanceOf(bPoolAddr);

      const poolAmountOut = expandTo18Decimals(1);
      await wEth.connect(signers[0]).approve(controller.address, MAX);
      await vBtc.connect(signers[0]).approve(controller.address, MAX);
      await controller.connect(signers[0]).joinPool(poolAmountOut, [MAX, MAX]);

      currentPoolBalance = currentPoolBalance.add(poolAmountOut);

      const balance = await controller.balanceOf(alice);
      const bPoolVbtcBalance = await vBtc.balanceOf(bPoolAddr);
      const bPoolWethBalance = await wEth.balanceOf(bPoolAddr);

      // Balances of all tokens increase proportionally to the pool balance
      expect(balance).to.eq(currentPoolBalance);
      let balanceChange = poolAmountOut.mul(previousbPoolWethBalance).div(previousPoolBalance);
      const currentWethBalance = previousbPoolWethBalance.add(balanceChange);
      expect(bPoolWethBalance.div(1000)).to.eq(currentWethBalance.div(1000));
      balanceChange = poolAmountOut.mul(previousbPoolVbtcBalance).div(previousPoolBalance);
      const currentVbtcBalance = previousbPoolVbtcBalance.add(balanceChange);
      expect(bPoolVbtcBalance.div(1000)).to.eq(currentVbtcBalance.div(1000));
    });

    it('should join pool directly', async () => {
      const bPoolAddr = await controller.bPool();
      const alice = await signers[0].getAddress();
      let currentPoolBalance = await controller.balanceOf(alice);
      const previousPoolBalance = currentPoolBalance;
      let previousbPoolVbtcBalance = await vBtc.balanceOf(bPoolAddr);
      let previousbPoolWethBalance = await wEth.balanceOf(bPoolAddr);

      const poolAmountOut = expandTo18Decimals(1);
      // get off-chain approval

      const priv = '0x043a569345b08ead19d1d4ba3462b30632feba623a2a85a3b000eb97f709f09f';
      const provider = new MockProvider({
        ganacheOptions: {
          accounts: [{balance: '100', secretKey: priv}],
        },
      });
      const [wallet] = provider.getWallets();

      const nonce = await vBtc.nonces(wallet.address);
      const deadline = MAX;
      const digest = await getApprovalDigest(
        vBtc,
        {owner: wallet.address, spender: controller.address, value: MAX},
        nonce,
        deadline
      );
      const {v, r, s} = ecsign(
        Buffer.from(digest.slice(2), 'hex'),
        Buffer.from(priv.replace('0x', ''), 'hex')
      );

      const bPool = await controller.bPool();
      const value = poolAmountOut
        .div((await controller.totalSupply()).sub(1))
        .mul((await wEth.balanceOf(bPool)).add(1));
      await controller
        .connect(signers[0])
        .joinPoolDirectly(poolAmountOut, [MAX, MAX], deadline, v, r, s, {value});
      currentPoolBalance = currentPoolBalance.add(poolAmountOut);

      const balance = await controller.balanceOf(alice);
      const bPoolVbtcBalance = await vBtc.balanceOf(bPoolAddr);
      const bPoolWethBalance = await wEth.balanceOf(bPoolAddr);

      // Balances of all tokens increase proportionally to the pool balance
      expect(balance).to.eq(currentPoolBalance);
      let balanceChange = poolAmountOut.mul(previousbPoolWethBalance).div(previousPoolBalance);
      const currentWethBalance = previousbPoolWethBalance.add(balanceChange);
      expect(bPoolWethBalance.div(1000)).to.eq(currentWethBalance.div(1000));
      balanceChange = poolAmountOut.mul(previousbPoolVbtcBalance).div(previousPoolBalance);
      const currentVbtcBalance = previousbPoolVbtcBalance.add(balanceChange);
      expect(bPoolVbtcBalance.div(1000)).to.eq(currentVbtcBalance.div(1000));
    });

    it('should exit pool', async () => {
      const bPoolAddr = await controller.bPool();
      const alice = await signers[0].getAddress();

      let currentPoolBalance = await controller.balanceOf(alice);
      let previousbPoolWethBalance = await wEth.balanceOf(bPoolAddr);
      let previousbPoolVbtcBalance = await vBtc.balanceOf(bPoolAddr);
      const previousPoolBalance = currentPoolBalance;

      const poolAmountIn = expandTo18Decimals(99);
      await controller.exitPool(poolAmountIn, [0, 0]);

      currentPoolBalance = currentPoolBalance.sub(poolAmountIn);

      const poolBalance = await controller.balanceOf(alice);
      const bPoolWethBalance = await wEth.balanceOf(bPoolAddr);
      const bPoolVbtcBalance = await vBtc.balanceOf(bPoolAddr);

      // Balances of all tokens increase proportionally to the pool balance
      expect(poolBalance).to.eq(currentPoolBalance);
      let balanceChange = poolAmountIn.mul(previousbPoolWethBalance).div(previousPoolBalance);
      const currentWethBalance = previousbPoolWethBalance.sub(balanceChange);
      expect(currentWethBalance.div(1000)).to.eq(bPoolWethBalance.div(1000));
      balanceChange = poolAmountIn.mul(previousbPoolVbtcBalance).div(previousPoolBalance);
      const currentVbtcBalance = previousbPoolVbtcBalance.sub(balanceChange);
      expect(currentVbtcBalance.div(1000)).to.eq(bPoolVbtcBalance.div(1000));
    });
  });
});
