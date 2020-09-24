const { Errors } = require('leap-lambda-boilerplate');
const ethers = require('ethers');
const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;
const { Transaction, opcodes } = require('bitcoinjs-lib');

module.exports = class StrudelHandler {

  constructor(db) {
    this.db = db;
  }

  async getAccount(accountAddr) {
    const account = await this.db.getAccount(accountAddr);
    return {
      statusCode: 200,
      data: account
    }
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
    return {statusCode: 204};
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
    return {statusCode: 204};
  }

  async addEthTx(btcTxHash, outputIndex) {

  }

  async getWatchlist() {

  }

  async getInclusionProof(txHash, blockHash) {

  }
}