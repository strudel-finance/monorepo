import { ethers, upgrades } from '@nomiclabs/buidler';
import { Signer } from 'ethers';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import vector from './testVector.json';
import { expandTo18Decimals } from './shared/utilities';
import { MockFlashErc20 } from '../typechain/MockFlashErc20';
import { MockFlashErc20Factory } from '../typechain/MockFlashErc20Factory';
import { MockBorrower } from '../typechain/MockBorrower';
import { MockBorrowerFactory } from '../typechain/MockBorrowerFactory';

chai.use(solidity);
const { expect } = chai;

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('FlashERC20', async () => {
  let signers: Signer[];
  let vBtc: MockFlashErc20;

  before(async () => {
    signers = await ethers.getSigners();
    vBtc = await new MockFlashErc20Factory(signers[0]).deploy(
      'vBTC',
      'VBTC',
      expandTo18Decimals(100000)
    );
  });

  describe('flash loaning', async () => {
    it('should loan', async () => {
      let borrower = await new MockBorrowerFactory(signers[0]).deploy(vBtc.address);
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
      let borrower = await new MockBorrowerFactory(signers[0]).deploy(vBtc.address);
      const amount = expandTo18Decimals(1);
      await vBtc.transfer(borrower.address, amount.div(1700));
      await expect(borrower.flashMint(amount, BYTES32_0, true)).to.be.revertedWith('ERR_REENTRY');
    });
  });
});
