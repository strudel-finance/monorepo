const { SimpleDb } = require('leap-lambda-boilerplate');

exports.DB = class DB extends SimpleDb {

  constructor(tableName) {
    super(tableName);
  }

  setSig(walletAddress, r, s, v) {
    return this.setAttrs(walletAddress, {
      r,
      s,
      v,
      created: new Date().toString(),
    });
  }

  setPaymentOutput(txHash, outputIndex, walletAddress, amount) {
    return this.setAttrs(`${txHash}-${outputIndex}`, {
      account: walletAddress,
      created: new Date().toString(),
      outputIndex,
      amount
    });
  }

  async getPaymentOutput(txHash, outputIndex) {
    return this.getAttr(`${txHash}-${outputIndex}`)
      .then((a) => {
        if (!a.created) {
          throw new Error(`Not Found: output ${txHash}-${outputIndex} not found in db.`);
        }
        return a;
      });
  }

  setClaimTx(btcTxHash, outputIndex, ethTxHash) {
    return this.setAttrs(`${txHash}-${outputIndex}`, { ethTxHash });
  }

  async getAccount(walletAddress) {
    // get sig, if any
    const rsp = this.getAttr(walletAddress);
    if (!rsp.account) {
      rsp.account = walletAddress;
    }
    rsp.burns = [];
    // attach all burns, pending or complete
    const payments = await this.select(`select * from \`${this.tableName}\` where account =  "${walletAddress}"`);
    if (!rsp.created && payments.length == 0) {
      throw new Error(`Not Found: account ${walletAddress} not found in db.`);
    }
    payments.forEach((payment) => {
      rsp.push({
        btcTxHash: payment.Name,
        amount: payment.Attributes.amount,
        dateCreated: payment.Attributes.created,
        ethTxHash: payment.Attributes.ethTxHash
      })
    });
    return rsp;
  }

  getSig(walletAddress) {
    return this.getAttr(walletAddress);
  }
  
}