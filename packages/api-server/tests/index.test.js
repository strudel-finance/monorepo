/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the GNU Affero General Public License,
 * version 3, found in the LICENSE file in the root directory of this source
 * tree.
 */

import chai, {expect, assert} from "chai";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import {it, describe, afterEach} from "mocha";
import SniperRifle from "./src/index";
import Db from "./src/db";

chai.use(sinonChai);

const sdb = {
  getAttributes() {},
  putAttributes() {},
};

const web3 = {
  getUnspent() {},
  eth: {
    getBlockNumber() {},
    sendRawTransaction() {},
  },
};

describe("SniperRifle", () => {
  it("handle chain progressed", async () => {
    const heightBefore = 100;
    sinon.stub(sdb, "getAttributes").yields(null, {
      Attributes: [{Name: "lastBlock", Value: heightBefore.toString()}],
    });
    sinon.stub(sdb, "putAttributes").yields(null, {});

    const heightAfter = 110;
    sinon.stub(web3.eth, "getBlockNumber").yields(null, heightAfter);

    const manager = new SniperRifle(null, new Db(sdb), "testnet", web3);
    await manager.sniperRifle();

    expect(sdb.putAttributes).calledWith({
      Attributes: [
        {Name: "lastBlock", Replace: true, Value: heightAfter.toString()},
      ],
      DomainName: sinon.match.any,
      ItemName: "testnet",
    });
  });

  it("handle chain didn't progress", async () => {
    const heightBefore = 100;
    sinon.stub(sdb, "getAttributes").yields(null, {
      Attributes: [{Name: "lastBlock", Value: heightBefore.toString()}],
    });
    sinon.stub(sdb, "putAttributes").yields(null, {});

    const heightAfter = 100;
    sinon.stub(web3.eth, "getBlockNumber").yields(null, heightAfter);

    const unspent = {
      outpoint: new leap.Outpoint(
        "0x0098c4777c8897fad3ad2ec3cf89b2d8b8aeab1052b857348f9861e1a97bf9ad",
        0
      ),
      output: {
        address: "0x6cb117a635dc7633b42089c607fdfc5c60b7d679",
        value: BigInt(1000000000000000000),
        color: 0,
      },
    };

    const txHash = "0x1234";
    sinon.stub(web3, "getUnspent").yields(null, [unspent]);
    sinon.stub(web3.eth, "sendRawTransaction").yields(null, txHash);

    const priv =
      "0xbd54b17c48ac1fc91d5ef2ef02e9911337f8758e93c801b619e5d178094486cc";
    const manager = new SniperRifle(priv, new Db(sdb), "testnet", web3);
    const rsp = await manager.sniperRifle();
    assert.equal(rsp, txHash);
    sinon.assert.called(web3.eth.sendRawTransaction);
  });

  afterEach(() => {
    if (sdb.getAttributes.restore) sdb.getAttributes.restore();
    if (sdb.putAttributes.restore) sdb.putAttributes.restore();
    if (web3.eth.getBlockNumber.restore) web3.eth.getBlockNumber.restore();
  });
});
