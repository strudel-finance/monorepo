import {ethers} from '@nomiclabs/buidler';
import {Signer, Contract, Wallet} from 'ethers';
import chai from 'chai';
import {deployContract, solidity} from 'ethereum-waffle';
import UniswapV2FactoryArtefact from '@uniswap/v2-core/build/UniswapV2Factory.json';
import IUniswapV2PairArtefact from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import {expandTo18Decimals, encodePrice} from './shared/utilities';
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

const token0Amount = expandTo18Decimals(5);
const token1Amount = expandTo18Decimals(10);

describe('ExampleOracleSimple', () => {
  let signers: Signer[];
  let oracle: BtcPriceOracle;
  let token0: MockErc20;
  let token1: MockErc20;
  let weth: MockErc20;
  let pair: IUniswapV2Pair;
  let factoryV2: IUniswapV2Factory;
  let router: UniswapV2Router01;

  before(async () => {
    signers = await ethers.signers();
    const devAddr = await signers[0].getAddress();
    token0 = await new MockErc20Factory(signers[0]).deploy(
      'WBTC',
      'WBTC',
      expandTo18Decimals(10000)
    );
    token1 = await new MockErc20Factory(signers[0]).deploy(
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
    // create pair
    await factoryV2.createPair(token0.address, token1.address);
    const pairAddress = await factoryV2.getPair(token0.address, token1.address);
    pair = new Contract(
      pairAddress,
      JSON.stringify(IUniswapV2PairArtefact.abi),
      ethers.provider
    ).connect(signers[0]) as IUniswapV2Pair;

    // add addLiquidity
    await token0.transfer(pair.address, token0Amount);
    await token1.transfer(pair.address, token1Amount);
    await pair.mint(devAddr);

    // deploy oracle
    oracle = await new BtcPriceOracleFactory(signers[0]).deploy(
      factoryV2.address,
      token0.address,
      token1.address
    );
  });

  it('update', async () => {
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 23]);
    await ethers.provider.send('evm_mine', []);
    await expect(oracle.update()).to.be.reverted;
    await ethers.provider.send('evm_increaseTime', [60 * 60 * 1]);
    await ethers.provider.send('evm_mine', []);
    await oracle.update();

    const expectedPrice = encodePrice(token0Amount, token1Amount);

    expect(await oracle.price0Average()).to.eq(expectedPrice[0]);
    expect(await oracle.price1Average()).to.eq(expectedPrice[1]);

    expect(await oracle.consult(token0.address, token0Amount)).to.eq(token1Amount);
    expect(await oracle.consult(token1.address, token1Amount)).to.eq(token0Amount);
  });
});
