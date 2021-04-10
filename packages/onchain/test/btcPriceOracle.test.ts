import { ethers } from '@nomiclabs/buidler';
import { Signer, Contract, Wallet, BigNumber } from 'ethers';
import chai from 'chai';
import { deployContract, solidity } from 'ethereum-waffle';
import UniswapV2FactoryArtifact from '@uniswap/v2-core/build/UniswapV2Factory.json';
import IUniswapV2PairArtifact from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import UniswapV2Router02Artifact from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { expandTo18Decimals, encodePrice, round, normalize } from './shared/utilities';
import { BtcPriceOracle } from '../typechain/BtcPriceOracle';
import { BtcPriceOracleFactory } from '../typechain/BtcPriceOracleFactory';
import { MockErc20 } from '../typechain/MockErc20';
import { MockErc20Factory } from '../typechain/MockErc20Factory';
import { IUniswapV2Router02 } from '../typechain/IUniswapV2Router02';
import { IUniswapV2Factory } from '../typechain/IUniswapV2Factory';
import { IUniswapV2Pair } from '../typechain/IUniswapV2Pair';

chai.use(solidity);
const { expect } = chai;

const wEthAmount = expandTo18Decimals(400);

const tBtc0Amount = BigNumber.from('900000000'); // 9 BTC
const tBtc1Amount = BigNumber.from('1100000000'); // 11 BTC
const DEC_FAC = BigNumber.from('10000000000'); // 10 ^ 10

describe('BtcPriceOracle', () => {
  let signers: Signer[];
  let oracle: BtcPriceOracle;
  let tBtc0: MockErc20;
  let tBtc1: MockErc20;
  let wEth: MockErc20;
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
    wEth = await new MockErc20Factory(signers[0]).deploy(
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
      [factoryV2.address, wEth.address],
      { gasLimit: 5000000 }
    )) as IUniswapV2Router02;

    // create pair
    await factoryV2.createPair(wEth.address, tBtc0.address);
    const pair0Address = await factoryV2.getPair(wEth.address, tBtc0.address);
    pair0 = new Contract(
      pair0Address,
      JSON.stringify(IUniswapV2PairArtifact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    // add addLiquidity
    await wEth.transfer(pair0.address, wEthAmount);
    await tBtc0.transfer(pair0.address, tBtc0Amount);
    await pair0.mint(devAddr);

    // deploy oracle
    oracle = await new BtcPriceOracleFactory(signers[0]).deploy(factoryV2.address, wEth.address, [
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
    // (400 / 0.0000000009) = 444444444444.4..
    expect(round(oracleState)).to.eq('444444444444');
    const feedPrice = await oracle.consult(tBtc0Amount.mul(DEC_FAC));
    // (400 / 9) * 9 = 39.999
    expect(feedPrice).to.eq('399999999999999999999');
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
  });

  it('increase BTC price', async () => {
    // do some swaps
    const devAddr = await signers[0].getAddress();
    const wEthIn = expandTo18Decimals(200);
    await wEth.transfer(pair0.address, wEthIn);

    const token0 = await pair0.token0();
    let reserves = await pair0.getReserves();
    if (token0 == wEth.address) {
      let vBtcOut = reserves.reserve1.sub(
        reserves.reserve1.mul(reserves.reserve0).div(reserves.reserve0.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await pair0.swap(0, vBtcOut, devAddr, '0x');
    } else {
      let vBtcOut = reserves.reserve0.sub(
        reserves.reserve0.mul(reserves.reserve1).div(reserves.reserve1.add(wEthIn))
      );
      vBtcOut = vBtcOut.sub(vBtcOut.mul(997).div(1000));
      await pair0.swap(vBtcOut, 0, devAddr, '0x');
    }

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // check result
    const feedPrice = await oracle.consult(expandTo18Decimals(1));
    // (600 / 6 ) = 100h
    expect(feedPrice.div(DEC_FAC).div(100)).to.eq('66733400');
  });

  it('add pool', async () => {
    // try adding existing
    await expect(oracle.addPair(tBtc0.address)).to.be.revertedWith('already known');
    // try adding without registered pair
    await expect(oracle.addPair(tBtc1.address)).to.be.revertedWith(
      'function call to a non-contract account' // expect "no pair" here actually
    );
    // create pair and add liquidity
    await factoryV2.createPair(tBtc1.address, wEth.address);
    const pairAddress = await factoryV2.getPair(wEth.address, tBtc1.address);
    pair1 = new Contract(
      pairAddress,
      JSON.stringify(IUniswapV2PairArtifact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;
    // try adding without liquidity
    await expect(oracle.addPair(tBtc1.address)).to.be.revertedWith('BtcOracle: NO_RESERVES');
    // add liquidity
    const devAddr = await signers[0].getAddress();
    await wEth.transfer(pair1.address, wEthAmount);
    await tBtc1.transfer(pair1.address, tBtc1Amount);
    await pair1.mint(devAddr);

    // add to oracle
    await oracle.addPair(tBtc1.address);
    // try
    await ethers.provider.send('evm_increaseTime', [60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();

    // check result
    // should be ((600 / 6 ) + (400 / 11)) / 2 = 68.1818181818
    let feedPrice = await oracle.consult(expandTo18Decimals(1));
    expect(feedPrice).to.eq('51488213677268403636');

    // do some swap
    await wEth.transfer(pair1.address, expandTo18Decimals(480));
    await pair1.swap(0, '598200000', devAddr, '0x');
    //update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 20]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();

    // check result
    // should be ((600 / 6.009) + (880 / 5.02)) / 2 = 137.57
    feedPrice = await oracle.consult(expandTo18Decimals(1));
    expect(feedPrice).to.eq('120935487763667745492');
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

    // check result
    // should be (880 / 5.02) = 175.29
    const feedPrice = await oracle.consult(expandTo18Decimals(1));
    expect(feedPrice).to.eq('175368672777999202869');
    // destroy
    await oracle.removePair(tBtc1.address);
    await expect(oracle.consult(tBtc0Amount)).to.be.revertedWith('nothing to track');
  });
});
