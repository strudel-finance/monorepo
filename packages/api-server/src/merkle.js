import AWS from "aws-sdk";
import Db from "./db";
const simpledb = new AWS.SimpleDB();

function getProofLength(y) {
  return Math.ceil(Math.log(y) / Math.log(2));
}
function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function findTreeHeight(number, mrrHeight) {
  let binaryN = dec2bin(mrrHeight);
  let currentRes = 0;
  for (var i = 0; i < binaryN.length; i++) {
    if (binaryN[i] == 1) {
      currentTree = Math.pow(2, binaryN.length - i - 1);
      currentRes += currentTree;
      if (number < currentRes) {
        return getProofLength(currentTree);
      }
    }
  }
}

async function getRecursiveHash(index, sdb, height) {}

async function getProof(height, sdb) {
  height = Number(height);
  const merkleHeight = 10;
  const proofLength = findTreeHeight(height, merkleHeight);
  let indicator = height;
  let proofArray = [];
  let index = height.toString();
  //case that Block is its own proof
  if (proofLength == 0) {
    return [await sdb.getHash(height.toString())];
  }

  for (var i = 0; i < proofLength; i++) {
    if (index.length == 1) {
      index = indicator % 2 == 0 ? Number(index) + 1 : Number(index) - 1;
      proofArray.push(await sdb.getHash(index.toString()));
      indicator = Math.floor(indicator / 2);
      index= + "-" +
    }
    index = index.split("-");
    if (indicator % 2 == 0) {
    } else {
    }

    let returnValue;
    try {
      returnValue = await sdb.getHash();
    } catch (error) {}
  }
}

exports.handler = async (event, context) => {
  const provider = process.env.PROVIDER_URL;
  const tableName = process.env.SDB_DOMAIN;
  const sdb = new Db(simpledb, tableName);
};
