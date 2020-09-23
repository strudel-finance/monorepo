import {ethers} from "@nomiclabs/buidler";
import {Signer} from "ethers";
import chai from "chai";
import {solidity} from "ethereum-waffle";
import constants from './onDemandSPVHelpers.json';
import { VBTCToken } from '../typechain/VBTCToken';
import { VBTCTokenFactory } from '../typechain/VBTCTokenFactory';
import { Strudel } from '../typechain/Strudel';
import { StrudelFactory } from '../typechain/StrudelFactory';
import { MockRelay } from '../typechain/MockRelay';
import { MockRelayFactory } from '../typechain/MockRelayFactory';

chai.use(solidity);
const {expect} = chai;

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000';

async function deploy(signer: Signer): Promise<VBTCToken> {
  let relayFactory = new MockRelayFactory(signer);
  let relay = await relayFactory.deploy(BYTES32_0, 0, BYTES32_0, 0);
  let strudelFactory = new StrudelFactory(signer);
  let strudel = await strudelFactory.deploy();
  let factory = new VBTCTokenFactory(signer);
  let vbtc = await factory.deploy(relay.address, strudel.address, 0);
  await strudel.addMinter(vbtc.address);
  return vbtc;
}

describe('OnDemandSPV', async () => {
  let signers: Signer[];
  let instance: VBTCToken;

  beforeEach(async () => {
    signers = await ethers.signers();
    instance = await deploy(signers[0]);
  });

  describe('#provideProof', async () => {

    it('runs succesfully, and sets validatedTxns and latestValidatedTx', async () => {
      await instance.proofOpReturnAndMint(
        constants.OP_RETURN_HEADER,
        constants.OP_RETURN_PROOF,
        constants.OP_RETURN_VERSION,
        constants.OP_RETURN_LOCKTIME,
        constants.OP_RETURN_INDEX,
        '0x0001', // requestIndices
        constants.OP_RETURN_VIN,
        constants.OP_RETURN_VOUT
      );
    });

    it('shortcuts inclusion validatins for already-seen txns', async () => {
      await instance.proofOpReturnAndMint(
        '0x',
        '0x',
        constants.OP_RETURN_VERSION,
        constants.OP_RETURN_LOCKTIME,
        0,
        '0x0001', // requestIndices
        constants.OP_RETURN_VIN,
        constants.OP_RETURN_VOUT
      );
    });
  });

});