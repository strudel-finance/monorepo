const { Errors } = require('leap-lambda-boilerplate');
const ethers = require('ethers');
const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;

module.exports = class StrudelHandler {

  constructor(db) {
    this.db = db;
  }

  async getAccount(request) {
   
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

  async addBtcTx(txHash) {
  }

  async addEthTx(txHash) {

  }

  async getWatchlist() {

  }

  async getInclusionProof(txHash, blockHash) {

  }
}