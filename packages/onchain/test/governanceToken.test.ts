import {ethers, upgrades} from '@nomiclabs/buidler';
import {Signer} from 'ethers';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import vector from './testVector.json';
import {expandTo18Decimals} from './shared/utilities';
import {GovernanceToken} from '../typechain/GovernanceToken';
import {GovernanceTokenFactory} from '../typechain/GovernanceTokenFactory';
import {MockErc20} from '../typechain/MockErc20';
import {MockErc20Factory} from '../typechain/MockErc20Factory';

chai.use(solidity);
const {expect} = chai;

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('GovernanceToken', async () => {
  let signers: Signer[];
  let strudel: MockErc20;
  let gov: GovernanceToken;

  before(async () => {
    signers = await ethers.getSigners();
    strudel = await new MockErc20Factory(signers[0]).deploy(
      'strudel',
      '$TRDL',
      18,
      expandTo18Decimals(100000)
    );
    gov = await new GovernanceTokenFactory(signers[0]).deploy(strudel.address);
  });

  describe('locking', async () => {
    it('should lock', async () => {
      await strudel.approve(gov.address, expandTo18Decimals(100000));
      await gov.lock(expandTo18Decimals(26), 45000 * 52);

      signers = await ethers.getSigners();
      const signerAddr = await signers[0].getAddress();
      const bal = await gov.balanceOf(signerAddr);
      expect(bal).to.eq(expandTo18Decimals(26));
    });
  });
});
