const { SimpleDb } = require('leap-lambda-boilerplate');
const ethers = require('ethers');

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

  setPaymentOutput(txHash, outputIndex, walletAddress, amount, isBch = false) {
    const pad = "00";
    const oi = (pad + outputIndex).slice(-pad.length);
    if (typeof amount == 'number') {
      throw new Error(`Error: amount should not be number.`);
    }

    const entry = {
      account: walletAddress,
      created: new Date().toString(),
      outputIndex: `${outputIndex}`,
      amount,
      btcTxHash: txHash,
    };

    console.log("entry");
    console.log(entry);

    if (isBch) {
      delete entry.btcTxHash;
      entry.bchTxHash = txHash;
    }
    
    return this.setAttrs(`${txHash}-${oi}`, entry);
  }

  async getPaymentOutput(txHash, outputIndex) {
    const pad = "00";
    const oi = (pad + outputIndex).slice(-pad.length);
    return this.getAttr(`${txHash}-${oi}`)
      .then((a) => {
        if (!a.created) {
          throw new Error(`Not Found: output ${txHash}-${outputIndex} not found in db.`);
        }
        return a;
      });
  }

  // This is where we can see users have minted vBTC, vBCH and $TURDEL
  setClaimTx(btcTxHash, outputIndex, ethTxHash, blockchainNetworkId) {
    const pad = "00";
    const oi = (pad + outputIndex).slice(-pad.length);

    return this.setAttrs(`${btcTxHash}-${oi}`, { ethTxHash, blockchainNetworkId }); 
  }

  async getAccount(walletAddress) {
    // get sig, if any
    const rsp = await this.getAttr(walletAddress, {
      account: walletAddress,
      burns: [],
      bchBurns: [],
    });
    if (rsp.v) {
      rsp.v = parseInt(rsp.v);
    }
    // attach all burns, pending or complete
    const payments = await this.select(`select * from \`${this.tableName}\` where account =  "${walletAddress}"`);
    if (!rsp.created && payments.length == 0) {
      throw new Error(`Not Found: account ${walletAddress} not found in db.`);
    }

    payments.forEach((payment) => {
      if (payment.Attributes.btcTxHash) {
        // Bitcoin
        const burn = {
          btcTxHash: payment.Attributes.btcTxHash,
          amount: payment.Attributes.amount,
          burnOutputIndex: payment.Attributes.outputIndex,
          dateCreated: payment.Attributes.created
        };

        if (payment.Attributes.ethTxHash) { 
          burn.ethTxHash = payment.Attributes.ethTxHash;
        } 

        if (payment.Attributes.blockchainNetworkId) { 
          burn.blockchainNetworkId = payment.Attributes.blockchainNetworkId;
        } 

        rsp.burns.push(burn);
      } else {
        // Bitcoin Cash
        const bchBurn = {
          bchTxHash: payment.Attributes.bchTxHash,
          amount: payment.Attributes.amount,
          burnOutputIndex: payment.Attributes.outputIndex,
          dateCreated: payment.Attributes.created
        };

        if (payment.Attributes.ethTxHash) {
          bchBurn.ethTxHash = payment.Attributes.ethTxHash;
        } 

        if (payment.Attributes.blockchainNetworkId) { 
          burn.blockchainNetworkId = payment.Attributes.blockchainNetworkId;
        } 
        
        rsp.bchBurns.push(bchBurn);
      }
    });

    return rsp;
  }

  getSig(walletAddress) {
    return this.getAttr(walletAddress);
  }
  
}