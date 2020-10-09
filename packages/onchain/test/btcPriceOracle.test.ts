import {ethers} from '@nomiclabs/buidler';
import {Signer, Contract, Wallet, BigNumber} from 'ethers';
import chai from 'chai';
import {deployContract, solidity} from 'ethereum-waffle';
import UniswapV2FactoryArtifact from '@uniswap/v2-core/build/UniswapV2Factory.json';
import IUniswapV2PairArtifact from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import UniswapV2Router02Artifact from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import {expandTo18Decimals, encodePrice, round, normalize} from './shared/utilities';
import {BtcPriceOracle} from '../typechain/BtcPriceOracle';
import {BtcPriceOracleFactory} from '../typechain/BtcPriceOracleFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';
import {IUniswapV2Router02} from '../typechain/IUniswapV2Router02';
import {IUniswapV2Factory} from '../typechain/IUniswapV2Factory';
import {IUniswapV2Pair} from '../typechain/IUniswapV2Pair';

chai.use(solidity);
const {expect} = chai;

const wethAmount = expandTo18Decimals(400);

const tBtc0Amount = BigNumber.from('1000000000');
const tBtc1Amount = BigNumber.from('1000000000');
console.log(tBtc1Amount);

describe('BtcPriceOracle', () => {
  let signers: Signer[];
  let oracle: BtcPriceOracle;
  let tBtc0: MockErc20;
  let tBtc1: MockErc20;
  let weth: MockErc20;
  let pair0: IUniswapV2Pair;
  let pair1: IUniswapV2Pair;
  let factoryV2: IUniswapV2Factory;
  let router: IUniswapV2Router02;

  before(async () => {
    signers = await ethers.getSigners();
    const devAddr = await signers[0].getAddress();
    tBtc0 = await new MockErc20Factory(signers[0]).deploy(
      'WBTC',
      'WBTC',
      8,
      expandTo18Decimals(10000)
    );
    tBtc1 = await new MockErc20Factory(signers[0]).deploy(
      'TBTC',
      'TBTC',
      8,
      expandTo18Decimals(10000)
    );
    weth = await new MockErc20Factory(signers[0]).deploy(
      'wEth',
      'WETH',
      18,
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
      [factoryV2.address, weth.address],
      {gasLimit: 5000000}
    )) as IUniswapV2Router02;

    // create pair
    await factoryV2.createPair(weth.address, tBtc0.address);
    const pair0Address = await factoryV2.getPair(weth.address, tBtc0.address);
    pair0 = new Contract(
      pair0Address,
      JSON.stringify(IUniswapV2PairArtifact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    // add addLiquidity
    await weth.transfer(pair0.address, wethAmount);
    await tBtc0.transfer(pair0.address, tBtc0Amount);
    await pair0.mint(devAddr);

    // deploy oracle
    oracle = await new BtcPriceOracleFactory(signers[0]).deploy(factoryV2.address, weth.address, [
      tBtc0.address,
    ]);
  });

  it('update', async () => {
    await oracle.update();
    await ethers.provider.send('evm_increaseTime', [60 * 15]);
    await ethers.provider.send('evm_mine', []);
    await expect(oracle.update()).to.be.reverted;
    await ethers.provider.send('evm_increaseTime', [60 * 5 + 1]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    const oracleState = await oracle.priceAverage();
    // (400 / 0.0000000009) = 44.4..
    //expect(round(oracleState)).to.eq(44);
    const feedPrice = await oracle.consult(expandTo18Decimals(1));
    console.log(feedPrice);
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
  });

  it('increase BTC price', async () => {
    // do some swaps
    const devAddr = await signers[0].getAddress();
    await weth.transfer(pair0.address, expandTo18Decimals(200));
    await pair0.swap(0, '299100000', devAddr, '0x');
    await ethers.provider.send('evm_increaseTime', [60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // check result
    const oracleState = await oracle.priceAverage();
    // should be (600 / 6.009) = 99.99
    //expect(round(oracleState)).to.eq(99);
    console.log('here');
    const feedPrice = await oracle.consult(tBtc0Amount.mul(10 ^ 10));
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
  });

  it('add pool', async () => {
    // try adding existing
    await expect(oracle.addPair(tBtc0.address)).to.be.revertedWith('already known');
    // try adding without registered pair
    await expect(oracle.addPair(tBtc1.address)).to.be.revertedWith(
      'function call to a non-contract account' // expect "no pair" here actually
    );
    // create pair and add liquidity
    await factoryV2.createPair(tBtc1.address, weth.address);
    const pairAddress = await factoryV2.getPair(weth.address, tBtc1.address);
    pair1 = new Contract(
      pairAddress,
      JSON.stringify(IUniswapV2PairArtifact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;
    // try adding without liquidity
    await expect(oracle.addPair(tBtc1.address)).to.be.revertedWith('BtcOracle: NO_RESERVES');
    // add liquidity
    const devAddr = await signers[0].getAddress();
    await weth.transfer(pair1.address, wethAmount);
    await tBtc1.transfer(pair1.address, tBtc1Amount);
    await pair1.mint(devAddr);

    // add to oracle
    await oracle.addPair(tBtc1.address);
    // try
    await ethers.provider.send('evm_increaseTime', [60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // check result
    let oracleState = await oracle.priceAverage();
    // should be ((600 / 6.009) + (400 / 11)) / 2 = 68.1
    //expect(round(oracleState)).to.eq(68);
    let feedPrice = await oracle.consult(tBtc0Amount.mul(10 ^ 10));
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));

    // do some swap
    await weth.transfer(pair1.address, expandTo18Decimals(480));
    await pair1.swap(0, '598200000', devAddr, '0x');
    //update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    oracleState = await oracle.priceAverage();
    // should be ((600 / 6.009) + (880 / 5.02)) / 2 = 137.57
    //expect(round(oracleState)).to.eq(137);
    feedPrice = await oracle.consult(tBtc0Amount.mul(10 ^ 10));
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
  });

  it('remove pool', async () => {
    // try non existing
    await expect(oracle.removePair(router.address)).to.be.revertedWith('remove not found');
    // remove
    await oracle.removePair(tBtc0.address);
    //update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // check price
    const oracleState = await oracle.priceAverage();
    // should be (880 / 5.02) = 175.29
    //expect(round(oracleState)).to.eq(175);
    const feedPrice = await oracle.consult(tBtc0Amount.mul(10 ^ 10));
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
    // destroy
    await oracle.removePair(tBtc1.address);
    await expect(oracle.consult(tBtc0Amount)).to.be.revertedWith('nothing to track');
  });
});
