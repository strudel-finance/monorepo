const { Errors } = require('leap-lambda-boilerplate');
const ethers = require('ethers');
const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;
const { Transaction, opcodes } = require('bitcoinjs-lib');

module.exports = class StrudelHandler {

  constructor(db, provider) {
    this.db = db;
    this.provider = provider;
  }

  async getAccount(accountAddr) {
    // check account address
    if (!ADDR_REGEX.test(accountAddr)) {
      throw new Errors.BadRequest(`${accountAddr} invalid ethereum address.`);
    }
    accountAddr = accountAddr.toLowerCase();    
    return await this.db.getAccount(accountAddr);
  }

  async addSig(accountAddr, sig) {
    // check account address
    if (!ADDR_REGEX.test(accountAddr)) {
      throw new Errors.BadRequest(`${accountAddr} invalid ethereum address.`);
    }
    accountAddr = accountAddr.toLowerCase();

    // TODO: what to do with existing ones?
    // const existing = await this.db.getSig(accountAddr);
    // construct P2FSH buffer
    //   0xa9 - OP_HASH160
    //   0x14 - Push 20 bytes to stack
    //   0x87 - OP_EQUAL
    const p2fshBuf = Buffer.from(`0xa914${accountAddr.replace('0x', '')}87`, 'hex');
    // check sig
    let addr = ethers.utils.verifyMessage(p2fshBuf, `${sig.r}${sig.s.replace('0x', '')}${sig.v.toString(16)}`);
    addr = addr.toLowerCase();
    if (addr != accountAddr) {
      throw new Errors.BadRequest(`${accountAddr} ${addr} invalid sig.`);
    }
    // store sig
    await this.db.setSig(accountAddr, sig.r, sig.s, `${sig.v}`);
    return 'Created';
  }

  async addBtcTx(txHash, txData) {
    // parse tx
    const tx = Transaction.fromBuffer(Buffer.from(txData.replace('0x', ''), 'hex'));
    const txId = tx.getId();

    // verify hash
    const hashBuf = Buffer.from(txHash.replace('0x', ''), 'hex');
    let isEqual = Buffer.compare(Buffer.from(tx.getId(), 'hex'), hashBuf);
    if (isEqual !== 0) {
      if (Buffer.compare(hashBuf, tx.getHash(false)) !== 0) {
        throw new Errors.BadRequest(`${txId} does not match tx data.`);
      }
    }

    // find op-return output
    let count = 0;
    let index;
    tx.outs.forEach((out, i) => {
      if (out.script.readUInt8(0) === opcodes.OP_RETURN && out.script.length == 22) {
        count++;
        index = i;
      }
    })
    if (count < 1) {
      throw new Errors.BadRequest(`${txId} has no OP_RETURN output.`);
    }
    if (count > 1) {
      throw new Errors.ServerError(`multiple OP_RETURN outputs not implemented.`);
    }
    if (tx.outs[index].value < 1) {
      throw new Errors.ServerError(`output has 0 value.`);
    }
    const walletAddress = `0x${tx.outs[index].script.slice(2, 22).toString('hex')}`;
    await this.db.setPaymentOutput(txId, index, walletAddress, `${tx.outs[index].value}`);
    return 'Created';
  }

  async addEthTx(btcTxHash, outputIndex, ethTxHash) {
    // btc output exists
    const entry = await this.db.getPaymentOutput(btcTxHash, outputIndex);

    // check the Eth transaction matches what we need
    //   - same tx hash
    //   - same output index
    //   - same amount
    //   - same account
    const receipt = await this.provider.getTransactionReceipt(ethTxHash);
    const parsedTxHash = receipt.logs[3].topics[1].replace('0x', '');
    if (parsedTxHash !== btcTxHash) {
      throw new Errors.BadRequest(`parsed txHash ${parsedTxHash} doesn't match.`);
    }
    const dataBuf = Buffer.from(receipt.logs[3].data.replace('0x', ''), 'hex');
    const parsedOutputIndex = dataBuf.readUInt8(dataBuf.length - 1);
    if (parsedOutputIndex !== outputIndex) {
      throw new Errors.BadRequest(`parsed outIndex ${parsedOutputIndex} doesn't match.`);
    }
    const parsedValue = ethers.utils.bigNumberify(`0x${dataBuf.slice(0, 32).toString('hex')}`);
    if (parsedValue.eq(ethers.utils.bigNumberify(entry.amount))) {
      throw new Errors.BadRequest(`parsed value ${parsedValue} doesn't match.`);
    }
    const parsedAccount = receipt.logs[3].topics[2].replace('000000000000000000000000', '');
    if (parsedAccount.toLowerCase() !== entry.account) {
      throw new Errors.BadRequest(`parsed accountAddr ${parsedAccount} doesn't match.`);
    }
    await this.db.setClaimTx(btcTxHash, outputIndex, ethTxHash);
  }

  async getWatchlist() {

  }

  async getInclusionProof(txHash, blockHash) {

  }
}