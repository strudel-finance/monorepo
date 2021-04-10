const fetch = require('node-fetch');
const { it, describe, afterEach } = require('mocha');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const StrudelHandler = require('./strudelHandler');
const { DB } = require('./utils/db');
const ethers = require('ethers');
const { PoorManRpc } = require('./utils/poorManRpc');
const { expect } = chai;
const { ValidateSPV, ser } = require("@summa-tx/bitcoin-spv-js");
const PROOF_DATA = require('./testData/proofData');
chai.use(sinonChai);

const expectThrow = async (promise, message) => {
  try {
    await promise;
    expect.fail('Expected to throw');
  } catch (e) {
    if (e.message !== message) {
      throw e;
    }
  }
};

// external interfaces
const sdb = {
  getAttributes() {},
  putAttributes() {},
  select() {},
};

const DOMAIN_NAME = 'strudel';
const db = new DB(DOMAIN_NAME);
db.sdb = sdb;

const PRIV_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
const provider = new ethers.providers.JsonRpcProvider('https://network.io/');
const wallet = new ethers.Wallet(PRIV_KEY, provider);
const ADDR = wallet.address;
const ADDR2 = '0xedb1b5c2f39af0fec151732585b1049b07895211';
const DATE = "Fri Sep 25 2020 01:17:52";

const OP_RETURN_TX = '0x010000000001011746bd867400f3494b8f44c24b83e1aa58c4f0ff25b4a61cffeffd4bc0f9ba300000000000ffffffff024897070000000000220020a4333e5612ab1a1043b25755c89b16d55184a42f81799e623e6bc39db8539c184897070000000000166a14edb1b5c2f39af0fec151732585b1049b07895211024730440220276e0ec78028582054d86614c65bc4bf85ff5710b9d3a248ca28dd311eb2fa6802202ec950dd2a8c9435ff2d400cc45d7a4854ae085f49e05cc3f503834546d410de012103732783eef3af7e04d3af444430a629b16a9261e4025f52bf4d6d026299c37c7400000000';
const OP_RETURN_TX_ID_LE = 'a64de435477f44b72ad0c0d6eff8fa857d2309d56a294d050ccec53c65812a56';

const p2fshBuf = Buffer.from(`0xa914${ADDR.replace('0x', '')}87`, 'hex');

describe('StrudelHandler', () => {

  it('should get sig', async () => {
    // set up & stub
    const FLAT_SIG = await wallet.signMessage(p2fshBuf);
    const SIG = ethers.utils.splitSignature(FLAT_SIG);
    sinon.stub(sdb, 'putAttributes').yields(null, {});

    // run
    const rsp = await new StrudelHandler(db).addSig(ADDR, SIG);

    // check
    expect(sdb.putAttributes).calledWith({
      Attributes: [
        {Name: "r", Value: SIG.r },
        {Name: "s", Value: SIG.s },
        {Name: "v", Value: `${SIG.v}` },
        {Name: "created", Value: sinon.match.any },
      ],
      DomainName: DOMAIN_NAME,
      ItemName: ADDR.toLowerCase()
    });
  });

  describe('addBtcTx', () => {

    it('should accept btc tx output', async () => {
      // set up & stub
      sinon.stub(sdb, 'putAttributes').yields(null, {});
      const txHash = 'd05142c0b09454f0b72b968f9f81684147a621cca86e16c686e3c73390cf07ca';
      const txData = '0200000001b7e96a68afbfd5d4e110d126ccc4ef50429d05e68b49c41b79195837b84c4aae000000006b4830450221009976efdee1e721c1948b92cffc9bc0560d6c0e8a8f9a59c4c1219d47c34fd338022012216a70fce18ab12f156ff03df7792e19af895480448e2c53b62a6931edfa800121036390cab1ffd87e14498af4dcf3cb3b067f9d58dbc000ad986b1fab9e00022a75ffffffff02f401000000000000196a1707ffff8db6b632d743aef641146dc943acb6495715538840890000000000001976a914e944a4312eb693f1ddfa59d34aa6a4a86f8ffd3888ac00000000';

      // run
      const rsp = await new StrudelHandler(db).addBtcTx(txHash, txData);

      // check
      expect(sdb.putAttributes).calledWith({
        Attributes: [
          {Name: "account", Value: '0x8db6b632d743aef641146dc943acb64957155388' },
          {Name: "created", Value: sinon.match.any },
          {Name: "outputIndex", Value: '0' },
          {Name: "amount", Value: '500' },
          {Name: "btcTxHash", Value: txHash },
        ],
        DomainName: DOMAIN_NAME,
        ItemName: `${txHash}-00`
      });
    });
  });

  describe('addEthTx', () => {
    it('should accept eth tx', async () => {
      // set up & stub
      const ethTxHash = '0x6320487f51e5583ec425c3a79afcc9c435ed2e611b2b72fb05495b697242044f';

      sinon.stub(provider, 'getTransactionReceipt').resolves({ 
        transactionHash: ethTxHash,
        logs: [{}, {}, {}, {
          topics: [
            '0x3d023d90350b769385d88d9e75401f8b4e4431afbcb22be877125e15b5fb1d5b',
            `0x${OP_RETURN_TX_ID_LE.replace('0x', '').match(/.{2}/g).reverse().join("")}`,
            `0x000000000000000000000000${ADDR2.replace('0x', '')}`
          ],
          data: '0x0000000000000000000000000000000000000000000000000011ac8de2d420000000000000000000000000000000000000000000000000000000000000000001'
        }]
      });

      sinon.stub(sdb, 'getAttributes').yields(null, { Attributes: [
        {Name: "account", Value: ADDR2 },
        {Name: "created", Value: DATE },
        {Name: "amount", Value: '497480' },
        {Name: "btcTxHash", Value: OP_RETURN_TX_ID_LE },
      ] });
      sinon.stub(sdb, 'putAttributes').yields(null, {});

      // run
      const rsp = await new StrudelHandler(db, provider).addEthTx(OP_RETURN_TX_ID_LE, 1, ethTxHash);

      // check
      expect(sdb.getAttributes).calledWith({
        DomainName: DOMAIN_NAME,
        ItemName: `${OP_RETURN_TX_ID_LE}-01`
      });
      expect(sdb.putAttributes).calledWith({
        Attributes: [
          {Name: "ethTxHash", Value: ethTxHash },
        ],
        DomainName: DOMAIN_NAME,
        ItemName: `${OP_RETURN_TX_ID_LE}-01`
      });
    });
  });

  describe('getAccount', () => {

    it('should throw on no data', async () => {
      // set up & stub
      sinon.stub(sdb, 'getAttributes').yields(null, {});
      sinon.stub(sdb, 'select').yields(null, {});

      // run
      await expectThrow(
        new StrudelHandler(db).getAccount(ADDR),
        `Not Found: account ${ADDR.toLowerCase()} not found in db.`
      );
    });

    it('should return account with only sig', async () => {
      // set up & stub
      const FLAT_SIG = await wallet.signMessage(p2fshBuf);
      const SIG = ethers.utils.splitSignature(FLAT_SIG);
      sinon.stub(sdb, 'getAttributes').yields(null, { Attributes: [
        {Name: "r", Value: SIG.r },
        {Name: "s", Value: SIG.s },
        {Name: "v", Value: `${SIG.v}` },
        {Name: "created", Value: DATE },
      ] });
      sinon.stub(sdb, 'select').yields(null, {});

      // run
      const rsp = await new StrudelHandler(db).getAccount(ADDR);

      // check
      expect(rsp).to.eql({
        "account": ADDR.toLowerCase(),
        "burns": [],
        "created": DATE,
        "r": SIG.r,
        "s": SIG.s,
        "v": SIG.v
      });
    });

    it('should return account with payment', async () => {
      // set up & stub
      const FLAT_SIG = await wallet.signMessage(p2fshBuf);
      const SIG = ethers.utils.splitSignature(FLAT_SIG);
      sinon.stub(sdb, 'getAttributes').yields(null, {});
      sinon.stub(sdb, 'select').yields(null, { Items: [{ Name: `${OP_RETURN_TX_ID_LE}-01`,
        Attributes: [
          {Name: "account", Value: ADDR2 },
          {Name: "created", Value: DATE },
          {Name: "outputIndex", Value: '0' },
          {Name: "amount", Value: '497480' },
          {Name: "btcTxHash", Value: OP_RETURN_TX_ID_LE },
        ],
      }] });

      // run
      const rsp = await new StrudelHandler(db).getAccount(ADDR2);

      // check
      expect(rsp).to.eql({
        "account": ADDR2,
        "burns": [{
          "amount": "497480",
          "btcTxHash": OP_RETURN_TX_ID_LE,
          "dateCreated": DATE,
          "burnOutputIndex": "0"
        }]
      });
    });
  });

  describe('getInclusionProof', () => {
    it('should give proof', async () => {
      const bclient = new PoorManRpc();
      sinon.stub(bclient, 'getBlock').resolves(PROOF_DATA.BLOCK);
      sinon.stub(bclient, 'getHeader').resolves(PROOF_DATA.BLOCK_HEADER);
      
      const txid = PROOF_DATA.TXID;
      const blockhash = PROOF_DATA.BLOCK_HASH;
      
      const rsp = await new StrudelHandler(null, null, bclient).getInclusionProof(txid, blockhash, PROOF_DATA.TXDATA);
      let SPVProof = ser.deserializeSPVProof(rsp);
      expect(ValidateSPV.validateProof(SPVProof)).to.eql(true);
    });
  });

  const cert = 'fill in';
  const chain = 'fill in';
  const priv = 'fill in';

  describe('payment server', () => {
    it('syn', async () => {
      const rsp = await new StrudelHandler(null, null, null, Buffer.from(cert, 'hex'), Buffer.from(chain, 'hex'), Buffer.from(priv, 'hex')).paySyn(ADDR, '100000000');
      console.log(rsp);
    });

    it('ack', async () => {
      sinon.stub(sdb, 'putAttributes').yields(null, {});
      const bclient = new PoorManRpc();
      sinon.stub(bclient, 'sendRawTransaction').resolves('{\"result\":\"0x137c5db62c12be3b03b4d897a87ce1db37ed2033963d77f882484a40da487e98\"}');
      const reqData = Buffer.from('0a0d7b22666f6f223a22626172227d12f5020200000002002db36291f1d40452d40acbc132f183f9760619b1a0082170a6e16de8be0575010000006a47304402207515be530c4da8d91ccaae0517cbbd9975419d6ba4e51f7bd8d868a9d2a9402502205d70724b87480954ae3285f9ed98aefcb922d0ac09eac321fab3053edb9bf50c012102bcf6e76d4c2a45e289ccc3f0425357d13072f9162289583ca5e6c2b29f71b31effffffff737f4a8a93c2d778e712fe50bef93ee5c00941468b59107006347e4ecea255fe000000006b483045022100e9b478bf5a5754af839d61d367a057142d9e2f3b0c4990f3583eb768f0d9c4c9022045b6a10ba93fd175e0068cd9f1ba0fdcfb9e3ec3fae38aa1d57101328a82a0e1012102db95a091990d6d0e5d0d076924efdc9a4133490b567a340d1733e307d18f1408ffffffff021027000000000000196a1707ffff8db6b632d743aef641146dc943acb64957155388c1a90100000000001976a914d1b1780cd6b9e1e959e2f3eee459c47e7955595f88ac000000001a1e08904e121976a9140fc192b8b798b9e32aebdb631ea773a07586c76488ac', 'hex');
      const rsp = await new StrudelHandler(db, null, bclient, Buffer.from(cert, 'hex'), Buffer.from(chain, 'hex'), Buffer.from(priv, 'hex')).payAck(reqData);
      console.log(rsp);
    });
  });

  afterEach(() => {
    if (sdb.getAttributes.restore) sdb.getAttributes.restore();
    if (sdb.putAttributes.restore) sdb.putAttributes.restore();
    if (sdb.select.restore) sdb.select.restore();
    if (fetch.Promise.restore) fetch.Promise.restore();
  });

});
