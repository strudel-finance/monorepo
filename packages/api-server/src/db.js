/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the GNU Affero General Public License,
 * version 3, found in the LICENSE file in the root directory of this source
 * tree.
 */

function Db(sdb, tableName) {
  this.sdb = sdb;
  this.domain = tableName;
}

Db.prototype.getHash = function getHash(index) {
  return new Promise((fulfill, reject) => {
    this.sdb.getAttributes(
      {
        DomainName: this.domain,
        ItemName: index,
      },
      (err, data) => {
        if (err) {
          reject(`Error: ${err.toString()}`);
          return;
        }
        if (!data || !data.Attributes) {
          reject(`Error: entry ${index} not found.`);
          return;
        }
        data.Attributes.forEach((aPair) => {
          if (aPair.Name === "hash") {
            fulfill(aPair.Value);
          }
        });
      }
    );
  });
};

Db.prototype.getBlock = function getBlock(height) {
  return new Promise((fulfill, reject) => {
    this.sdb.getAttributes(
      {
        DomainName: this.domain,
        ItemName: height,
      },
      (err, data) => {
        if (err) {
          reject(`Error: ${err.toString()}`);
          return;
        }
        if (!data || !data.Attributes) {
          reject(`Error: entry ${height} not found.`);
          return;
        }
        let dataJSON = {};
        data.Attributes.forEach((aPair) => {
          dataJSON[aPair.Name] = aPair.Value;
        });
        fulfill(dataJSON);
      }
    );
  });
};

Db.prototype.putHash = function putHash(index, hash) {
  return new Promise((fulfill, reject) => {
    this.sdb.putAttributes(
      {
        DomainName: this.domain,
        ItemName: index,
        Attributes: [
          {
            Name: "hash",
            Replace: true,
            Value: hash,
          },
        ],
      },
      (err, data) => {
        if (err) {
          reject(`Error: ${err.toString}`);
          return;
        }
        fulfill(data);
      }
    );
  });
};

Db.prototype.putBlock = function putBlock(index, block) {
  return new Promise((fulfill, reject) => {
    this.sdb.putAttributes(
      {
        DomainName: this.domain,
        ItemName: index,
        Attributes: [
          {
            Name: "hash",
            Replace: true,
            Value: block.hash,
          },
          {
            Name: "bits",
            Replace: true,
            Value: block.bits.toString(),
          },
          {
            Name: "nonce",
            Replace: true,
            Value: block.nonce.toString(),
          },
          {
            Name: "time",
            Replace: true,
            Value: block.time.toString(),
          },
          {
            Name: "merkleRoot",
            Replace: true,
            Value: block.merkleRoot,
          },
          {
            Name: "version",
            Replace: true,
            Value: block.version.toString(),
          },
          {
            Name: "prevBlock",
            Replace: true,
            Value: block.prevBlock,
          },
        ],
      },
      (err, data) => {
        if (err) {
          reject(`Error: ${err.toString}`);
          return;
        }
        fulfill(data);
      }
    );
  });
};

module.exports = Db;
