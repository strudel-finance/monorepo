import {ethers, upgrades} from 'hardhat';
import {Signer, Contract} from 'ethers';
import {getAdminAddress} from '@openzeppelin/upgrades-core';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import vector from './testVector.json';
import REGULAR_CHAIN from './headers.json';
import {expandTo18Decimals, concatenateHexStrings} from './shared/utilities';
import ProxyAdminArtifact from '@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json';
import AdminUpgradeabilityProxyArtifact from '@openzeppelin/upgrades-core/artifacts/AdminUpgradeabilityProxy.json';
import {VbtcToken} from '../typechain/VbtcToken';
import {StrudelToken} from '../typechain/StrudelToken';
import {StrudelTokenFactory} from '../typechain/StrudelTokenFactory';
import {MockRelay} from '../typechain/MockRelay';
import {MockRelayFactory} from '../typechain/MockRelayFactory';
import {MockBorrower} from '../typechain/MockBorrower';
import {MockBorrowerFactory} from '../typechain/MockBorrowerFactory';
import {MockVbtcUpgraded} from '../typechain/MockVbtcUpgraded';
import {MockVbtcUpgradedFactory} from '../typechain/MockVbtcUpgradedFactory';
import {Timelock} from '../typechain/Timelock';
import {TimelockFactory} from '../typechain/TimelockFactory';

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
  let ownerLock: Timelock;
  let strudel: StrudelToken;

  before(async () => {
    [bob, owner, admin] = await ethers.getSigners();

    // deploy infrastructure
    relay = await new MockRelayFactory(owner).deploy(BYTES32_0, 210, BYTES32_0, 211);
    strudel = await new StrudelTokenFactory(owner).deploy();
    const ownerAddr = await owner.getAddress();
    ownerLock = await new TimelockFactory(owner).deploy(ownerAddr, 60 * 60 * 24);

    // proxy deploy vBtc
    const VbtcToken = await ethers.getContractFactory('VbtcToken');
    vBtc = (await upgrades.deployProxy(VbtcToken, [relay.address, strudel.address, 0, 50], {
      unsafeAllowCustomTypes: true,
    })) as VbtcToken;
    await vBtc.deployed();

    // take control back from proxy admin
    let proxyAdminAddr = await getAdminAddress(ethers.provider, vBtc.address);
    const proxyAdmin = new Contract(
      proxyAdminAddr,
      JSON.stringify(ProxyAdminArtifact.abi),
      ethers.provider
    ).connect(bob);
    const adminAddr = await admin.getAddress();
    await proxyAdmin.functions.changeProxyAdmin(vBtc.address, adminAddr);
    proxyAdminAddr = await getAdminAddress(ethers.provider, vBtc.address);
    expect(proxyAdminAddr).to.eq(adminAddr);

    // make timelock the owner
    vBtc.connect(bob).transferOwnership(ownerLock.address);

    // last preps
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
      ).to.be.revertedWith('Not included!');

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

    it('should allow to claim dev pool funds through timelock', async () => {
      const bobAddr = await bob.getAddress();
      const devPoolBalBefore = await strudel.balanceOf(ownerLock.address);
      const msgData = `0xa9059cbb000000000000000000000000${bobAddr.replace(
        '0x',
        ''
      )}0000000000000000000000000000000000000000000000000000000000000064`;
      const timestamp = (await ethers.provider.getBlock('latest')).timestamp;
      await ownerLock.queueTransaction(
        strudel.address,
        0,
        '',
        msgData,
        timestamp + 60 * 60 * 24 + 5
      );
      await ethers.provider.send('evm_increaseTime', [60 * 60 * 48]);
      await ethers.provider.send('evm_mine', []);
      await ownerLock.executeTransaction(
        strudel.address,
        0,
        '',
        msgData,
        timestamp + 60 * 60 * 24 + 5
      );
      const devPoolBalAfter = await strudel.balanceOf(ownerLock.address);
      expect(devPoolBalAfter).to.eq(devPoolBalBefore.sub(100));
    });
  });

  describe('upgradeabliity', async () => {
    it('should allow upgrade', async () => {
      // before
      await expect(vBtc.proofP2FSHAndMint('0x', '0x', 0, BYTES32_0)).to.be.revertedWith(
        'not implemented'
      );

      // upgarde
      const newImpl = await new MockVbtcUpgradedFactory(owner).deploy();
      const proxy = new Contract(
        vBtc.address,
        JSON.stringify(AdminUpgradeabilityProxyArtifact.abi),
        ethers.provider
      );
      await expect(proxy.connect(bob).functions.upgradeTo(newImpl.address)).to.be.revertedWith(
        "function selector was not recognized and there's no fallback function"
      );
      await proxy.connect(admin).functions.upgradeTo(newImpl.address);

      // after
      expect(await vBtc.proofP2FSHAndMint('0x', '0x', 0, BYTES32_0));
    });
  });
});
