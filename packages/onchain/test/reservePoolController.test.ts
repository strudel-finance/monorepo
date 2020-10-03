import {ethers} from '@nomiclabs/buidler';
import {Signer} from 'ethers';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import {ReservePoolController} from '../typechain/ReservePoolController';
import {ReservePoolControllerFactory} from '../typechain/ReservePoolControllerFactory';
import {MockERC20} from '../typechain/MockERC20';
import {MockERC20Factory} from '../typechain/MockERC20Factory';
import {MockBFactory} from '../typechain/MockBFactory';
import {MockBFactoryFactory} from '../typechain/MockBFactoryFactory';
import {BPool} from '../typechain/BPool';
import {BPoolFactory} from '../typechain/BPoolFactory';
import {MockUniRouter} from '../typechain/MockUniRouter';
import {MockUniRouterFactory} from '../typechain/MockUniRouterFactory';
import {BtcPriceOracle} from '../typechain/BtcPriceOracle';
import {BtcPriceOracleFactory} from '../typechain/BtcPriceOracleFactory';

chai.use(solidity);
const {expect} = chai;
const wBtcAddr = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const pBtcAddr = '0x5228a22e72ccC52d415EcFd199F99D0665E7733b';

describe('ReservePoolController', async () => {
  let signers: Signer[];
  let vBtc: MockERC20;
  let wEth: MockERC20;
  let bFactory: MockBFactory;
  let uniRouter: MockUniRouter;
  let btcOracle: BtcPriceOracle;
  let controller: ReservePoolController;

  before(async () => {
    signers = await ethers.signers();
    // address _vBtcAddr,
    vBtc = await new MockERC20Factory(signers[0]).deploy('vBTC', 'VBTC', '10000000000');
    // address _wEthAddr,
    wEth = await new MockERC20Factory(signers[0]).deploy('wEth', 'WETH', '10000000000');
    // address _bPoolFactory,
    bFactory = await new MockBFactoryFactory(signers[0]).deploy();
    // IUniswapV2Router01 _uniRouter,
    uniRouter = await new MockUniRouterFactory(signers[0]).deploy();
    // address _oracle
    btcOracle = await new BtcPriceOracleFactory(signers[0]).deploy(
      await uniRouter.factory(),
      wBtcAddr,
      pBtcAddr
    );
    // create the controller
    controller = await new ReservePoolControllerFactory(signers[0]).deploy(
      vBtc.address,
      wEth.address,
      bFactory.address,
      uniRouter.address,
      btcOracle.address
    );
  });

  it('should deploy', async () => {
    const maxWeight = await controller.maxVbtcWeight();
    expect(maxWeight).to.eq('95000000000000000000');
  });
});
