const fetch = require('node-fetch');
const { it, describe, afterEach } = require('mocha');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const StrudelHandler = require('./strudelHandler');
const { DB } = require('./utils/db');
const ethers = require('ethers');
const { expect } = chai;
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
    expect(rsp).to.eql({
      statusCode: 204
    });
  });

  describe('addBtcTx', () => {

    it('should accept btc tx output', async () => {
      // set up & stub
      const p2fshBuf = Buffer.from(`0xa914${ADDR.replace('0x', '')}87`, 'hex');
      let flatSig = await wallet.signMessage(p2fshBuf);
      let sig = ethers.utils.splitSignature(flatSig);
      sinon.stub(sdb, 'putAttributes').yields(null, {});

      // run
      const rsp = await new StrudelHandler(db).addBtcTx(OP_RETURN_TX_ID_LE, OP_RETURN_TX);

      // check
      expect(sdb.putAttributes).calledWith({
        Attributes: [
          {Name: "account", Value: ADDR2 },
          {Name: "created", Value: sinon.match.any },
          {Name: "amount", Value: '497480' },
          {Name: "btcTxHash", Value: OP_RETURN_TX_ID_LE },
        ],
        DomainName: DOMAIN_NAME,
        ItemName: `${OP_RETURN_TX_ID_LE}-01`
      });
      expect(rsp).to.eql({
        statusCode: 204
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
            `0x${OP_RETURN_TX_ID_LE}`,
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
      expect(rsp).to.eql({
        statusCode: 200
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
        `Not Found: account ${ADDR} not found in db.`
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
        statusCode: 200,
        data: {
          "account": ADDR,
          "burns": [],
          "created": DATE,
          "r": SIG.r,
          "s": SIG.s,
          "v": SIG.v
        }
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
          {Name: "amount", Value: '497480' },
          {Name: "btcTxHash", Value: OP_RETURN_TX_ID_LE },
        ],
      }] });

      // run
      const rsp = await new StrudelHandler(db).getAccount(ADDR2);

      // check
      expect(rsp).to.eql({
        statusCode: 200,
        data: {
          "account": ADDR2,
          "burns": [{
            "amount": "497480",
            "btcTxHash": OP_RETURN_TX_ID_LE,
            "dateCreated": DATE,
          }],
        }
      });
    });
  });

  afterEach(() => {
    if (sdb.getAttributes.restore) sdb.getAttributes.restore();
    if (sdb.putAttributes.restore) sdb.putAttributes.restore();
    if (sdb.select.restore) sdb.select.restore();
    if (fetch.Promise.restore) fetch.Promise.restore();
  });

});