import {ethers} from '@nomiclabs/buidler';
import {Signer, Contract, Wallet} from 'ethers';
import chai from 'chai';
import {deployContract, solidity} from 'ethereum-waffle';
import UniswapV2FactoryArtefact from '@uniswap/v2-core/build/UniswapV2Factory.json';
import IUniswapV2PairArtefact from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import {expandTo18Decimals, encodePrice, round, normalize} from './shared/utilities';
import {BtcPriceOracle} from '../typechain/BtcPriceOracle';
import {BtcPriceOracleFactory} from '../typechain/BtcPriceOracleFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';
import {UniswapV2Router01} from '../typechain/UniswapV2Router01';
import {UniswapV2Router01Factory} from '../typechain/UniswapV2Router01Factory';
import {IUniswapV2Factory} from '../typechain/IUniswapV2Factory';
import {IUniswapV2Pair} from '../typechain/IUniswapV2Pair';

chai.use(solidity);
const {expect} = chai;

const wethAmount = expandTo18Decimals(400);
const tBtc0Amount = expandTo18Decimals(9);
const tBtc1Amount = expandTo18Decimals(11);

describe('BtcPriceOracle', () => {
  let signers: Signer[];
  let oracle: BtcPriceOracle;
  let tBtc0: MockErc20;
  let tBtc1: MockErc20;
  let weth: MockErc20;
  let pair0: IUniswapV2Pair;
  let pair1: IUniswapV2Pair;
  let factoryV2: IUniswapV2Factory;
  let router: UniswapV2Router01;

  before(async () => {
    signers = await ethers.getSigners();
    const devAddr = await signers[0].getAddress();
    tBtc0 = await new MockErc20Factory(signers[0]).deploy(
      'WBTC',
      'WBTC',
      expandTo18Decimals(10000)
    );
    tBtc1 = await new MockErc20Factory(signers[0]).deploy(
      'TBTC',
      'TBTC',
      expandTo18Decimals(10000)
    );
    weth = await new MockErc20Factory(signers[0]).deploy('wEth', 'WETH', expandTo18Decimals(10000));

    // deploy V2
    factoryV2 = (await deployContract(<Wallet>signers[0], UniswapV2FactoryArtefact, [
      devAddr,
    ])) as IUniswapV2Factory;
    // deploy router
    router = await new UniswapV2Router01Factory(signers[0]).deploy(factoryV2.address, weth.address);

    // create pairs
    await factoryV2.createPair(weth.address, tBtc0.address);
    const pair0Address = await factoryV2.getPair(weth.address, tBtc0.address);
    pair0 = new Contract(
      pair0Address,
      JSON.stringify(IUniswapV2PairArtefact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    await factoryV2.createPair(weth.address, tBtc1.address);
    const pair1Address = await factoryV2.getPair(weth.address, tBtc1.address);
    pair1 = new Contract(
      pair1Address,
      JSON.stringify(IUniswapV2PairArtefact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    // add addLiquidity
    await weth.transfer(pair0.address, wethAmount);
    await tBtc0.transfer(pair0.address, tBtc0Amount);
    await pair0.mint(devAddr);
    await weth.transfer(pair1.address, wethAmount);
    await tBtc1.transfer(pair1.address, tBtc1Amount);
    await pair1.mint(devAddr);

    // deploy oracle
    oracle = await new BtcPriceOracleFactory(signers[0]).deploy(factoryV2.address, weth.address, [
      tBtc0.address,
      tBtc1.address,
    ]);
  });

  it('should test all governance functions');

  it('update', async () => {
    await ethers.provider.send('evm_increaseTime', [60 * 15]);
    await ethers.provider.send('evm_mine', []);
    await expect(oracle.update()).to.be.reverted;
    await ethers.provider.send('evm_increaseTime', [60 * 5 + 1]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    const oracleState = await oracle.priceAverage();
    // ((400 / 9) + (400 / 11)) / 2 = 40.404..
    expect(round(oracleState)).to.eq(40);
    const feedPrice = await oracle.consult(tBtc0Amount);
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
  });

  it('increase BTC price', async () => {
    // do some swaps
    const devAddr = await signers[0].getAddress();
    await weth.transfer(pair0.address, expandTo18Decimals(200));
    await pair0.swap(0, '2991000000000000000', devAddr, '0x');
    await weth.transfer(pair1.address, expandTo18Decimals(480));
    await pair1.swap(0, '5982000000000000000', devAddr, '0x');
    // update the oracle
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 24]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();
    // check result
    const oracleState = await oracle.priceAverage();
    // TODO: should be ((600 / 6) + (880 / 5.019)) / 2 = 137.66686591
    expect(round(oracleState)).to.eq(137);
    const feedPrice = await oracle.consult(tBtc0Amount);
    expect(feedPrice).to.eq(normalize(tBtc0Amount.mul(oracleState)));
  });

  it('add pool', async () => {});

  it('remove pool', async () => {});
});
