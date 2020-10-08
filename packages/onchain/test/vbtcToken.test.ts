import {ethers, upgrades} from '@nomiclabs/buidler';
import {Signer, Contract} from 'ethers';
import {getAdminAddress} from '@openzeppelin/upgrades-core';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import vector from './testVector.json';
import {expandTo18Decimals} from './shared/utilities';
import ProxyAdminArtifact from '@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json';
import {VbtcToken} from '../typechain/VbtcToken';
import {StrudelToken} from '../typechain/StrudelToken';
import {StrudelTokenFactory} from '../typechain/StrudelTokenFactory';
import {MockRelay} from '../typechain/MockRelay';
import {MockRelayFactory} from '../typechain/MockRelayFactory';
import {MockBorrower} from '../typechain/MockBorrower';
import {MockBorrowerFactory} from '../typechain/MockBorrowerFactory';

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

describe('VBTC', async () => {
  let bob: Signer;
  let owner: Signer;
  let admin: Signer;
  let vBtc: VbtcToken;
  let relay: MockRelay;

  before(async () => {});

  before(async () => {
    [bob, owner, admin] = await ethers.getSigners();

    relay = await new MockRelayFactory(owner).deploy(BYTES32_0, 210, BYTES32_0, 211);
    let strudel = await new StrudelTokenFactory(owner).deploy();

    const VbtcToken = await ethers.getContractFactory('VbtcToken');
    vBtc = (await upgrades.deployProxy(VbtcToken, [relay.address, strudel.address, 0, 50], {
      unsafeAllowCustomTypes: true,
    })) as VbtcToken;
    await vBtc.deployed();

    // const devAddr = await dev.getAddress();
    // let owner = await torchShip.owner();
    let proxyAdminAddr = await getAdminAddress(ethers.provider, vBtc.address);
    console.log('before:', proxyAdminAddr);

    // take control back from proxy admin
    const proxyAdmin = new Contract(
      proxyAdminAddr,
      JSON.stringify(ProxyAdminArtifact.abi),
      ethers.provider
    ).connect(bob);
    const adminAddr = await admin.getAddress();
    await proxyAdmin.functions.changeProxyAdmin(vBtc.address, adminAddr);

    proxyAdminAddr = await getAdminAddress(ethers.provider, vBtc.address);
    // owner = await torchShip.connect(alice).owner();
    console.log('after:', proxyAdminAddr);

    await strudel.addMinter(vBtc.address);
  });

  describe('#provideProof', async () => {
    it('should exit on invalid proofs', async () => {
      const test = vector[2];
      await expect(
        vBtc.proofOpReturnAndMint(
          test.HEADER,
          test.PROOF,
          test.VERSION,
          test.LOCKTIME,
          test.INDEX,
          0, // burn output index in transaction
          test.VIN,
          test.VOUT
        )
      ).to.be.revertedWith('height not found in relay');

      await relay.addHeader(test.BLOCK_HASH, 200);
      await expect(
        vBtc.proofOpReturnAndMint(
          test.HEADER,
          test.PROOF,
          test.VERSION,
          test.LOCKTIME,
          test.INDEX,
          0, // burn output index in transaction
          test.VIN,
          test.VOUT
        )
      ).to.be.revertedWith('invalid op-return payload length');

      await expect(
        vBtc.proofOpReturnAndMint(
          test.HEADER,
          test.PROOF,
          test.VERSION,
          test.LOCKTIME,
          test.INDEX,
          1, // burn output index in transaction
          test.VIN,
          test.VOUT
        )
      ).to.be.revertedWith('output has 0 value');
    });

    it('should pass test vector', async () => {
      for (let i = 0; i < 2; i++) {
        const test = vector[i];
        await relay.addHeader(test.BLOCK_HASH, 200);
        const tx = await vBtc.proofOpReturnAndMint(
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
        const isKnown = await vBtc.knownOutpoints(outpoint);
        expect(isKnown).to.be.true;
      }
    });
  });

  it('should test all governance functions', async () => {
    //const devAddr = await signers[0].getAddress();
  });
});
