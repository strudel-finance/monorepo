import {BuidlerRuntimeEnvironment, DeployFunction} from '@nomiclabs/buidler/types';
const {ethers, upgrades} = require('@nomiclabs/buidler');

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = bre;
  const {deploy, execute, read, log} = deployments;

  const {deployer, relayer} = await getNamedAccounts();

  // for upgrades
  const AdminLock = await deployments.get('AdminLock');
  // for gov params
  const OwnerLock = await deployments.get('OwnerLock');

  const Strudel = await deploy('StrudelToken', {from: deployer, args: [], log: true});

  const bridgeRelayRewards = '30000000000000000000'; // 30 $TRDL per relay

  const VBTCToken = await ethers.getContractFactory('VBTCToken');
  const VBTC = await upgrades.deployProxy(
    VBTCToken,
    [relayer, Strudel.address, 3, bridgeRelayRewards],
    {unsafeAllowCustomTypes: true}
  );
  await VBTC.deployed();
  save('VBTCToken', VBTC);

  const factory = await ethers.getContractFactory('');

  // const VBTC = await deploy("VBTCToken", {
  //   from: deployer,
  //   proxy: true,
  //   args: [
  //     relayer,
  //     Strudel.address,
  //     3,
  //     bridgeRelayRewards
  //   ],
  //   log: true,
  // });

  await execute('VBTCToken_Proxy', {from: deployer, log: true}, 'changeAdmin', AdminLock.address);

  await execute('VBTCToken', {from: deployer, log: true}, 'transferOwnership', OwnerLock.address);

  await execute('StrudelToken', {from: deployer, log: true}, 'addMinter', VBTC.address);

  await execute(
    'StrudelToken',
    {from: deployer, log: true},
    'transferOwnership',
    OwnerLock.address
  );
};
export default func;
