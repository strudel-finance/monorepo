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


// external interfaces
const sdb = {
  getAttributes() {},
  putAttributes() {},
  select() {},
};

const DOMAIN_NAME = 'strudel';

const db = new DB(DOMAIN_NAME);
db.sdb = sdb;


let PRIV_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
let wallet = new ethers.Wallet(PRIV_KEY);
const ADDR = wallet.address;

describe('StrudelHandler', () => {

  it('should get sig', async () => {

    const p2fshBuf = Buffer.from(`0xa914${ADDR.replace('0x', '')}87`, 'hex');
    let flatSig = await wallet.signMessage(p2fshBuf);
    let sig = ethers.utils.splitSignature(flatSig);

    sinon.stub(sdb, 'putAttributes').yields(null, {});

    // run
    const rsp = await new StrudelHandler(db).addSig(ADDR, sig);
    // check
    expect(sdb.putAttributes).calledWith({
      Attributes: [
        {Name: "r", Value: sig.r },
        {Name: "s", Value: sig.s },
        {Name: "v", Value: `${sig.v}` },
        {Name: "created", Value: sinon.match.any },
      ],
      DomainName: DOMAIN_NAME,
      ItemName: ADDR.toLowerCase()
    });
    expect(rsp).to.eql({
      statusCode: 204,

    });
  });


  afterEach(() => {
    if (sdb.getAttributes.restore) sdb.getAttributes.restore();
    if (sdb.putAttributes.restore) sdb.putAttributes.restore();
    if (sdb.select.restore) sdb.select.restore();
    if (fetch.Promise.restore) fetch.Promise.restore();
  });

});