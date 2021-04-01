import { BuidlerRuntimeEnvironment, DeployFunction } from '@nomiclabs/buidler/types';
const { ethers, upgrades } = require('@nomiclabs/buidler');

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = bre;
  const { deploy, execute, read, log } = deployments;

  let { deployer, multisig } = await getNamedAccounts();

  if (bre.network.live && !multisig) {
    throw new Error('no multisig provided');
  }

  if (!multisig) {
    multisig = deployer;
  }

  // for gov params by owner
  const ownerDelay = 12 * 60 * 60; // grace period of 12 hours will be applied
  await deploy('OwnerLock', {
    contract: 'Timelock',
    from: deployer,
    args: [multisig, ownerDelay],
    log: true,
  });

  // for gov params by owner
  const adminDelay = ownerDelay * 3; // grace period of 12 hours will be applied
  await deploy('AdminLock', {
    contract: 'Timelock',
    from: deployer,
    args: [multisig, adminDelay],
    log: true,
  });

  // how to distinguish 2 contracts?
};
export default func;
func.tags = ['MMInstantiator'];
