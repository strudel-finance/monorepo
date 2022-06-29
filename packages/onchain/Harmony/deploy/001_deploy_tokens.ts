import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';

import { abi as vbtc_token_abi } from '../artifacts/contracts/VbtcToken.sol/VbtcToken.json';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log('\n1. DEPLOY TOKENS\n');

  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, read, log, save } = deployments;

  const { deployer, relayer } = await getNamedAccounts();

  console.log('The deployer is ', deployer);
  console.log('The relayer is ', relayer);

  const Strudel = await deploy('StrudelToken', { from: deployer, args: [], log: true });

  const bridgeRelayRewards = '30000000000000000000'; // 30 $TRDL per relay

  const VBTCToken = await ethers.getContractFactory('VbtcToken');
  const VBTC = await upgrades.deployProxy(
    VBTCToken,
    [relayer, Strudel.address, 3, bridgeRelayRewards],
    { unsafeAllowCustomTypes: true }
  );
  await VBTC.deployed();
  console.log('VBTCToken deployed to:', VBTC.address);
};

export default func;
