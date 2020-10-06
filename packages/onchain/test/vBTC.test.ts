import {ethers, upgrades } from '@nomiclabs/buidler';
import {Signer} from 'ethers';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import vector from './testVector.json';
import {VbtcToken} from '../typechain/VbtcToken';
import {StrudelToken} from '../typechain/StrudelToken';
import {StrudelTokenFactory} from '../typechain/StrudelTokenFactory';
import {MockRelay} from '../typechain/MockRelay';
import {MockRelayFactory} from '../typechain/MockRelayFactory';

chai.use(solidity);
const {expect} = chai;

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000';

function reverse(hash: string): string {
  return `0x${hash.replace('0x', '').match(/.{2}/g)!.reverse().join('')}`;
}

function makeCompressedOutpoint(hash: string, index: number): string {
  const hashBuf = Buffer.from(hash.replace('0x', ''), 'hex');
  hashBuf.writeInt32BE(index, 28);
  return `0x${hashBuf.toString('hex')}`;
}

async function deploy(signer: Signer, relay: MockRelay): Promise<VbtcToken> {
  let strudelFactory = new StrudelTokenFactory(signer);
  let strudel = await strudelFactory.deploy();

  const VbtcToken = await ethers.getContractFactory("VbtcToken");
  const vbtc = await upgrades.deployProxy(VbtcToken, [relay.address, strudel.address, 0, 50], {unsafeAllowCustomTypes: true});
  await vbtc.deployed();

  await strudel.addMinter(vbtc.address);
  return vbtc as VbtcToken;
}

describe('VBTC', async () => {
  let signers: Signer[];
  let instance: VbtcToken;
  let relay: MockRelay;

  before(async () => {
    signers = await ethers.getSigners();
    let relayFactory = new MockRelayFactory(signers[0]);
    relay = await relayFactory.deploy(BYTES32_0, 210, BYTES32_0, 211);
  });

  beforeEach(async () => {
    instance = await deploy(signers[0], relay);
  });

  describe('#provideProof', async () => {
    it('should pass test vector', async () => {
      for (let i = 0; i < vector.length; i++) {
        const test = vector[i];
        await relay.addHeader(test.BLOCK_HASH, 200);
        const tx = await instance.proofOpReturnAndMint(
          test.HEADER,
          test.PROOF,
          test.VERSION,
          test.LOCKTIME,
          test.INDEX,
          0, // burn output index in transaction
          test.VIN,
          test.VOUT
        );
        // check
        const events = (await tx.wait(1)).events!;
        const args: any = events[3].args;
        expect(args.btcTxHash).to.eq(reverse(test.TX_ID_LE));
        expect(args.receiver).to.eq(test.OUT_RECEIVER);
        expect(args.amount).to.eq(test.OUT_AMOUNT);
        expect(args.outputIndex).to.eq(test.OUT_INDEX);

        const outpoint = makeCompressedOutpoint(args.btcTxHash, test.OUT_INDEX);
        const isKnown = await instance.knownOutpoints(outpoint);
        expect(isKnown).to.be.true;
      }
    });
  });
});
