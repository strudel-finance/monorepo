// Read this
// https://github.com/bitcoin/bips/blob/master/bip-0070.mediawiki

const { Errors } = require('leap-lambda-boilerplate');
const ethers = require('ethers');
const bitcore = require("bitcore-lib"); // https://github.com/bitpay/bitcore/tree/v8.0.0/packages/bitcore-lib
const PaymentProtocol = require("bitcore-payment-protocol"); // https://www.npmjs.com/package/bitcore-payment-protocol

const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;
const { Transaction, opcodes } = require('bitcoinjs-lib'); // https://github.com/bitcoinjs/bitcoinjs-lib
const getProof = require('./utils/proof');
const PROTOCOL_ID = Buffer.from("07ffff", "hex"); // 2^19-1

const {
  ETH_NETWORK_ID,
  BSC_NETWORK_ID,
  HARMONY_NETWORK_ID
} = require("./blockchainNetworkIds");

module.exports = class StrudelHandler {

  constructor(
    db, 
    
    provider, 
    bscProvider,
    harmonyProvider,
    
    bclient, cert, chain, priv
  ) {
    this.db = db;
    
    this.provider = provider;
    this.bscProvider = bscProvider;
    this.harmonyProvider = harmonyProvider;

    this.bclient = bclient;
    this.cert = cert;
    this.chain = chain;
    this.priv = priv;
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

  async addBtcTx(txHash, txData, isBch = false) {
    // parse tx
    const tx = Transaction.fromBuffer(Buffer.from(txData.replace('0x', ''), 'hex'));
    const txId = tx.getId();
    console.log('txId: ', txId);

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
      if (out.script.readUInt8(0) === opcodes.OP_RETURN && out.script.length == 25) {
        count++;
        index = i;
      }
    })
    if (count < 1) {
      throw new Errors.BadRequest(`${txId} has no OP_RETURN output matching protocol.`);
    }
    if (count > 1) {
      throw new Errors.ServerError(`multiple OP_RETURN outputs not implemented.`);
    }
    if (tx.outs[index].value < 1) {
      throw new Errors.ServerError(`output has 0 value.`);
    }
    const walletAddress = `0x${tx.outs[index].script.slice(5, 25).toString('hex')}`;

    await this.db.setPaymentOutput(txId, index, walletAddress, `${tx.outs[index].value}`, isBch); 
    return 'Created'; 
  }

  async addEthTx(
    btcTxHash, 
    outputIndex, 
    ethTxHash, 
    blockchainNetworkId,
  ) { 
    // console.log("btcTxHash, outputIndex, ethTxHash, blockchainNetworkId");
    // console.log(btcTxHash, outputIndex, ethTxHash, blockchainNetworkId);

    // btc output exists

    // check the Eth transaction matches what we need
    //   - same tx hash
    //   - same output index
    //   - same amount
    //   - same account
    let receipt;
    let parsedTxHash;
    let log;

    if (blockchainNetworkId === undefined) {
      throw new Errors.BadRequest(`blockchainNetworkId wasn't set`);
    }

    if (
      blockchainNetworkId == ETH_NETWORK_ID
    ) {
      receipt = await this.provider.getTransactionReceipt(ethTxHash);
    }
    else if (blockchainNetworkId == BSC_NETWORK_ID) {
      receipt = await this.bscProvider.getTransactionReceipt(ethTxHash);
    }
    else if (blockchainNetworkId == HARMONY_NETWORK_ID) {
      receipt = await this.harmonyProvider.getTransactionReceipt(ethTxHash);
    }

    // Should check it is in 
    const entry = await this.db.getPaymentOutput(btcTxHash, outputIndex);

    // No need to include ethTxHash again because it is from blockchain and permanent
    if (entry.ethTxHash !== undefined) {
      throw new Errors.BadRequest(`ethTxHash was already included for the btcTxHash ${btcTxHash}.`);
    }

    // Catch Crossing event at the vBTC contract?
    if (entry.bchTxHash) {
      // Test this part ok with ETH and BSC with mainnet later?
      // BCH is currently deployed to ETH, BSC

      // Need to see the contract for vBCH at ETH mainnet also and see these below are valid
      parsedTxHash = receipt.logs[1].topics[1].replace('0x', '');
      log = receipt.logs[1];
    } else {
      // BTC is currently dpeloyed to ETH, BSC and Harmony (Not complete yet)

      parsedTxHash = receipt.logs[3].topics[1].replace('0x', '');
      log = receipt.logs[3];
    }

    // reverse 
    parsedTxHash = parsedTxHash.match(/.{2}/g).reverse().join("");
    if (parsedTxHash !== btcTxHash) {
      throw new Errors.BadRequest(`parsed txHash ${parsedTxHash} doesn't match.`);
    }
    
    const dataBuf = Buffer.from(log.data.replace('0x', ''), 'hex');
    const parsedOutputIndex = dataBuf.readUInt8(dataBuf.length - 1);
    
    if (parsedOutputIndex !== parseInt(outputIndex)) {
      throw new Errors.BadRequest(`parsed outIndex ${parsedOutputIndex} doesn't match.`);
    }
    
    const parsedValue = ethers.utils.bigNumberify(`0x${dataBuf.slice(0, 32).toString('hex')}`);
    
    if (parsedValue.eq(ethers.utils.bigNumberify(entry.amount))) {
      throw new Errors.BadRequest(`parsed value ${parsedValue} doesn't match.`);
    }
    
    const parsedAccount = log.topics[2].replace('000000000000000000000000', '');
    
    if (parsedAccount.toLowerCase() !== entry.account) {
      throw new Errors.BadRequest(`parsed accountAddr ${parsedAccount} doesn't match.`);
    }

    await this.db.setClaimTx(btcTxHash, outputIndex, ethTxHash, blockchainNetworkId);
  }

  async getWatchlist() {

  }

  async getInclusionProof(txHash, blockHash, txData) {
    if (!txData) {
      throw new Errors.BadRequest(`tx Data missing.`);
    }
    
    // payload
    const proof = await getProof(this.bclient, txHash, blockHash, txData); // use proof and index for relayer at the frontend
    return JSON.stringify(proof);
  }

  // paySyn -> payAck (addBtcTx is called here)
  // PaymentDetails/PaymentRequest
  async paySyn(destinationAddress, amount, isBch = false) {
    if (!ADDR_REGEX.test(destinationAddress)) {
      throw new Errors.BadRequest(`${destinationAddress} invalid ethereum address.`);
    }
    
    //const amount = req.params.amount;
    // TODO: sanitize amount input

    // BCH is Bitcoin Cash

    destinationAddress = destinationAddress.replace("0x", "");

    const dataBuf = Buffer.alloc(23);
    PROTOCOL_ID.copy(dataBuf, 0, 0, 3);
    Buffer.from(destinationAddress, "hex").copy(dataBuf, 3, 0, 20);
    const script = bitcore.Script.buildDataOut(dataBuf).toBuffer();
    const output = new PaymentProtocol().makeOutput();
    output.set("amount", amount);
    output.set("script", script);

    const now = (Date.now() / 1000) | 0;
    const details = new PaymentProtocol((isBch) ? "BCH" : "BTC").makePaymentDetails();

    // https://github.com/bitcoin/bips/blob/master/bip-0070.mediawiki#paymentdetailspaymentrequest
    details.set("network", "main");
    details.set("outputs", output.message);
    details.set("time", now);
    details.set("expires", now + 60 * 60 * 24);
    details.set("memo", "A request to enter the strudel.");

    details.set("payment_url", (isBch)
      ? "https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/bch/ack"
      : "https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/ack");
    details.set("merchant_data", Buffer.from(JSON.stringify({ foo: "bar" })));
    const certificates = new PaymentProtocol().makeX509Certificates();
    certificates.set("certificate", [
      this.cert,
      this.chain,
    ]);
    const request = new PaymentProtocol((isBch) ? "BCH" : "BTC").makePaymentRequest();
    request.set("payment_details_version", 1);
    request.set("pki_type", "x509+sha256");
    request.set("pki_data", certificates.serialize());
    console.log('syn: ', details);
    request.set("serialized_payment_details", details.serialize());
    request.sign(this.priv);

    const rawBody = request.serialize();

    return rawBody;
  }

  // Confirm paySyn worked correctly with this
  // PaymentACK
  async payAck(bodyRaw, isBch = false) {
    // Decode payment
    const body = PaymentProtocol.Payment.decode(bodyRaw);
    const payment = new PaymentProtocol((isBch) ? "BCH" : "BTC").makePayment(body);
    
    const merchantData = payment.get("merchant_data");
    
    const transactions = payment.get("transactions");
    const txData = transactions[0].toString("hex");
    console.log("received tx: ", txData);

    // Transaction (transfer) happens here
    const txHash = await this.bclient.sendRawTransaction(txData);
    console.log("txHash:", txHash);

    // Save to db
    await this.addBtcTx(txHash, txData, isBch);

    // Make a payment acknowledgement
    // https://github.com/bitcoin/bips/blob/master/bip-0070.mediawiki#payment
    const ack = new PaymentProtocol((isBch) ? "BCH" : "BTC").makePaymentACK();
    ack.set("payment", payment.message);
    ack.set("memo", "You have entered the strudel!");
    const rawBody = ack.serialize();
    return rawBody;
  }

}