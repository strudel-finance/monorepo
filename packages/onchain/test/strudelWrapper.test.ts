import { ethers, upgrades } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import chai from 'chai';
import vector from './testVector.json';
import { expandTo18Decimals, advanceBlock } from './shared/utilities';
import { StrudelToken } from '../typechain/StrudelToken';
import { StrudelWrapper } from '../typechain/StrudelWrapper';


const { expect } = chai;
const txHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('Strudel Wrapper', async () => {
  let signers: Signer[];
  let strudel: StrudelToken;
  let wrapper: StrudelWrapper;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    const StrudelTokenFactory = await ethers.getContractFactory('StrudelToken');
    strudel = (await StrudelTokenFactory.deploy()) as StrudelToken;
    const StrudelWrapperFactory = await ethers.getContractFactory('StrudelWrapper');
    wrapper = (await StrudelWrapperFactory.deploy(strudel.address)) as StrudelWrapper;
    const signerAddr = await signers[0].getAddress();
    await wrapper.addMinter(signerAddr);
    await strudel.addMinter(signerAddr);
    await strudel.addMinter(wrapper.address);
    await strudel.mint(signerAddr, expandTo18Decimals(100000));
  });

  describe('swapping', async () => {
    it('should swap in', async () => {
      const tsBefore = await strudel.totalSupply();
      const signerAddr = await signers[0].getAddress();
      await wrapper.Swapin(txHash, signerAddr, expandTo18Decimals(100));
      const tsAfter = await strudel.totalSupply();
      expect(tsBefore.add(expandTo18Decimals(100))).to.eq(tsAfter);
    });

    it('should swap out', async () => {
      const tsBefore = await strudel.totalSupply();
      const signerAddr = await signers[0].getAddress();
      await strudel.approve(wrapper.address, expandTo18Decimals(100));
      await wrapper.Swapout(expandTo18Decimals(100), signerAddr);
      const tsAfter = await strudel.totalSupply();
      expect(tsBefore.sub(expandTo18Decimals(100))).to.eq(tsAfter);
    });

    it('should swap out in 1 tx', async () => {
      const tsBefore = await strudel.totalSupply();
      const signerAddr = await signers[0].getAddress();
      await strudel.approveAndCall(wrapper.address, expandTo18Decimals(100), signerAddr);
      const tsAfter = await strudel.totalSupply();
      expect(tsBefore.sub(expandTo18Decimals(100))).to.eq(tsAfter);
    });
  });
});
