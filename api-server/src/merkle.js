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
  const merkleHeight = 10;
  const proofLength = findTreeHeight(height, merkleHeight);
  let indicator = proofLength;
  let proofArray = [];
  let index = height.toString();
  //case that Block is its own proof
  if (proofLength == 0) {
    return [await sdb.getHash(height.toString())];
  }

  for (var i = 0; i < proofLength; i++) {
    index = index.split("-");
    if (index.length == 1) {
    }
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
