import { ethers, upgrades } from 'hardhat';
import { Signer } from 'ethers';
import chai from 'chai';
import vector from './testVector.json';
import { expandTo18Decimals } from './shared/utilities';
import { MockFlashERC20 } from '../typechain/MockFlashErc20';
import { MockBorrower } from '../typechain/MockBorrower';

const { expect } = chai;

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('FlashERC20', async () => {
  let signers: Signer[];
  let vBtc: MockFlashERC20;

  before(async () => {
    signers = await ethers.getSigners();
    const MockFlashERC20Factory = await ethers.getContractFactory('MockFlashERC20');
    vBtc = (await MockFlashERC20Factory.deploy(
      'vBTC',
      'VBTC',
      expandTo18Decimals(100000)
    )) as MockFlashERC20;
  });

  describe('flash loaning', async () => {
    const MockBorrowerFactory = await ethers.getContractFactory('MockBorrower');

    it('should loan', async () => {
      let borrower = (await MockBorrowerFactory.deploy(vBtc.address)) as MockBorrower;
      const amount = expandTo18Decimals(20900000);
      // try borrowing too much
      await expect(
        borrower.flashMint(expandTo18Decimals(21000001), BYTES32_0, false)
      ).to.be.revertedWith('can not borrow more than BTC cap');
      // try without paying fee
      await expect(borrower.flashMint(amount, BYTES32_0, false)).to.be.revertedWith(
        'burn amount exceeds balance'
      );

      await vBtc.transfer(borrower.address, amount.div(1700));
      await borrower.flashMint(amount, BYTES32_0, false);
      const balAfter = await vBtc.balanceOf(borrower.address);
      expect(balAfter).to.eq(0);
    });

    it('should notice reentrance', async () => {
      let borrower = (await MockBorrowerFactory.deploy(vBtc.address)) as MockBorrower;
      const amount = expandTo18Decimals(1);
      await vBtc.transfer(borrower.address, amount.div(1700));
      await expect(borrower.flashMint(amount, BYTES32_0, true)).to.be.revertedWith('ERR_REENTRY');
    });
  });
});
