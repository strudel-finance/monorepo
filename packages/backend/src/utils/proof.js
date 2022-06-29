const {utils, BTCUtils, ser} = require("@summa-tx/bitcoin-spv-js");
const assert = require('./bsert');
const hash256 = require('./hash256');
const merkle = require('./merkle');

function hasWitnessBytes(bytes) {
  return bytes[4] === 0 && bytes[5] !== 0;
}

function toString(buf) {
  let str = '';
  for (const uint of buf) {
    let hex = uint.toString(16);
    if (hex.length === 1) { hex = `0${hex}`; }
    str += hex;
  }
  return str;
}

function reverse(str) {
  return Buffer.from(str, 'hex').reverse().toString('hex');
}

function parseTxHex(hex) {
  const raw = utils.deserializeHex(hex);
  let offset = 0;

  // Handle version
  let version = raw.subarray(offset, offset + 4);
  version = toString(version);

  if (hasWitnessBytes(raw)) { offset += 6; } else { offset += 4; }

  let inputs = '';
  const vinCount = BTCUtils.determineVarIntDataLength(raw[offset]) || raw[offset];
  inputs += toString(raw.subarray(offset, offset + 1));
  offset += 1;

  // Handle inputs
  for (let i = 0; i < vinCount; i++) {
    // 32 byte hash
    const hash = raw.subarray(offset, offset + 32);
    inputs += toString(hash);
    offset += 32;
    // 32 bit integer
    const index = raw.subarray(offset, offset + 4);
    inputs += toString(index);
    offset += 4;

    // varint script
    const scriptSize = BTCUtils.determineVarIntDataLength(raw[offset]) || raw[offset];
    const varint = raw.subarray(offset, offset + 1);
    inputs += toString(varint);
    offset += 1;

    const script = raw.subarray(offset, offset + scriptSize);
    inputs += toString(script);
    offset += scriptSize;

    // 32 bit sequence
    const sequence = raw.subarray(offset, offset + 4);
    inputs += toString(sequence);
    offset += 4;
  }

  // Handle outputs
  let outputs = '';
  const voutCount = BTCUtils.determineVarIntDataLength(raw[offset]) || raw[offset];
  outputs += toString(raw.subarray(offset, offset + 1));
  offset += 1;

  for (let i = 0; i < voutCount; i++) {
    // value 64 bits
    const value = raw.subarray(offset, offset + 8);
    offset += 8;
    outputs += toString(value);

    // script varbytes
    const scriptSize = BTCUtils.determineVarIntDataLength(raw[offset]) || raw[offset];
    const varint = raw.subarray(offset, offset + 1);
    outputs += toString(varint);
    offset += 1;

    const script = raw.subarray(offset, offset + scriptSize);
    outputs += toString(script);
    offset += scriptSize;
  }

  // Handle locktime
  let locktime = raw.subarray(-4);
  locktime = toString(locktime);

  return {
    version,
    vin: inputs,
    vout: outputs,
    locktime
  };
}

// payload
async function getMerkleProof(txid, block) {

  let index = -1;
  const txs = [];
  for (const [i, tx] of Object.entries(block.tx)) {
    const curr_txid = tx;
    if (curr_txid === txid) { index = i >>> 0; } // cast to uint from string
    txs.push(Buffer.from(curr_txid, 'hex').reverse());
  }

  assert(index >= 0, 'Transaction not in block.');

  const [root] = merkle.createRoot(hash256, txs.slice());
  assert.bufferEqual(Buffer.from(block.merkleroot, 'hex').reverse(), root);

  const branch = merkle.createBranch(hash256, index, txs.slice());

  const proof = [];
  for (const hash of branch) { proof.push(hash.toString('hex')); }

  return [proof, index];
}

async function getProof(client, txid, blockhash, txData) {
  assert(typeof txid === 'string');

  const blockPromise = client.getBlock(blockhash);
  const headerPromise = client.getHeader(blockhash);

  const [block, rawheader] = await Promise.all([blockPromise, headerPromise]);

  const tx = block.tx.filter(tx => tx === txid)[0];

  if (!tx) { throw new Error('Cannot find transaction'); }

  const txinfo = parseTxHex(txData);

  // proof, index
  const [nodes, index] = await getMerkleProof(txid, block);

  let path = '';
  for (const node of nodes) {
    path += node;
  }

  return {
    header: `0x${rawheader}`,
    proof: `0x${path}`, // use it at relayer and getInclusion at the frontend
    version: `0x${txinfo.version}`,
    locktime: `0x${txinfo.locktime}`,
    index, // use it at relayer and getInclusion at the frontend
    intermediate_nodes: `0x${path}`,
    tx_id: `0x${txid.replace('0x', '').match(/.{2}/g).reverse().join("")}`,
    confirming_header: {
      raw: `0x${rawheader}`,
      hash: `0x${block.hash.replace('0x', '').match(/.{2}/g).reverse().join("")}`,
      prevhash: `0x${block.previousblockhash.replace('0x', '').match(/.{2}/g).reverse().join("")}`,
      merkle_root: `0x${block.merkleroot.replace('0x', '').match(/.{2}/g).reverse().join("")}`,
    },
    vin: `0x${txinfo.vin}`,
    vout: `0x${txinfo.vout}`
  };
}

module.exports = getProof;
