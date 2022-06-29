import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
// import { ethers, upgrades } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // const func = async function (bre: any) {
  console.log('\n0. DEPLOY TIMELOCK (OwnerLock and AdminLock)\n');

  const { deployments, getNamedAccounts } = hre;
  const {
    deploy,
    // execute, read, log
  } = deployments;

  // https://github.com/ChainShot/MultiSig-Hardhat
  // https://docs.openzeppelin.com/defender/guide-upgrades#transfer-control-of-upgrades-to-a-multisig
  let { deployer, multisig } = await getNamedAccounts();

  console.log('The deployer is ', deployer);

  // false with $yarn deploy and
  // true with $yarn aurora:testnet and it needs multisig?
  console.log('hre.network.live is', hre.network.live);

  console.log('The multisig is ', multisig);

  // https://github.com/wighawag/hardhat-deploy#live
  if (hre.network.live && !multisig) {
    throw new Error('no multisig provided');
  }

  // Test it work first?
  if (!multisig) {
    multisig = deployer;
  }

  // for gov params by owner
  // grace period of 12 hours will be applied -> Fails with "Timelock::constructor: Delay must exceed minimum delay."
  // uint256 public constant MINIMUM_DELAY = 1 days;
  // const ownerDelay = 12 * 60 * 60;
  const ownerDelay = 24 * 60 * 60;
  await deploy('OwnerLock', {
    contract: 'Timelock',
    from: deployer,
    args: [multisig, ownerDelay],
    log: true,
  });

  // for gov params by owner
  // TODO
  // Do we need this while it is unused?
  // const adminDelay = ownerDelay * 3; // grace period of 12 hours will be applied
  // await deploy('AdminLock', {
  //   contract: 'Timelock',
  //   from: deployer,
  //   args: [multisig, adminDelay],
  //   log: true,
  // });

  // how to distinguish 2 contracts?
};
export default func;
func.tags = ['MMInstantiator'];
