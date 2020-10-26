const spvAbi = require("./spv.json");
const ethers = require('ethers');
const request = require('request');
const fetch = require('node-fetch');
const vBTCAbi = require('./controller.json');
const { PoorManRpc } = require('./poorManRpc');

const toggle = require('endian-toggle');

const api = "";
const relayerAddress = "0x1531b6e3d51BF80f634957dF81A990B92dA4b154";
const privateKey = "";
const vBTCaddr = "0xe1406825186D63980fd6e2eC61888f7B91C4bAe4";

const bc_un = "";
const bc_pass = "";
const rpc = "";
const port = 8332;

const provider = new ethers.providers.JsonRpcProvider(api);
const wallet = new ethers.Wallet(privateKey, provider);

const Relayer = new ethers.Contract(relayerAddress, spvAbi, ethers.getDefaultProvider());
const relayer = Relayer.connect(wallet);

const vBTC = new ethers.Contract(vBTCaddr, vBTCAbi, ethers.getDefaultProvider());
const vbtc = vBTC.connect(wallet);

const swapEndian = hexString => {
  const buff = Buffer.from(hexString.replace('0x', ''), 'hex');
  const swapped = toggle(buff, 256);
  return swapped.toString('hex');
};

const range = (start, end) => {
  let ret = [];
  let count = start;
  while (count <= end) {
    ret.push(count);
    count++;
  }
  return ret;
}

const bclient = new PoorManRpc(
  request,
  bc_un,
  bc_pass,
  rpc,
  port
);

const overrides = {
  gasLimit: 200000,
  gasPrice: ethers.utils.parseUnits('80.0', 'gwei'),
}

async function main() {
  try {

    let gasDataRes = await fetch("https://ethgasstation.info/api/ethgasAPI.json?");
    let gasData = await gasDataRes.json();
    let gasPrice = (gasData.fast/10).toString();
    console.log("Gas price: ", gasPrice);
    overrides.gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei');
    
    let lastBlockhash = await relayer.getBestKnownDigest();
    let lastBlockhashLE = swapEndian(lastBlockhash.slice(2));
    let lastBlock = await bclient.getBlock(lastBlockhashLE);
    let lastHeader = await bclient.getHeader(lastBlockhashLE);
    let lastBlockHeight = lastBlock.height;
    
    let latestNetworkInfoResponse = await fetch("https://sochain.com/api/v2/get_info/BTC");
    let latestNetworkInfo = await latestNetworkInfoResponse.json();
    let latestHeight = latestNetworkInfo.data.blocks;

    const blockHashes = await Promise.all(range(lastBlockHeight+1, latestHeight).map(h => bclient.getBlockHash(h)));
    const blockHeaders = await Promise.all(blockHashes.map(hash => bclient.getHeader(hash)));
    const concated = "0x" + blockHeaders.reduce((cv, acc) => cv + acc, "");
    
    console.log("Last submitted block heigth: ", lastBlockHeight);
    console.log("Current best heigth: ", latestHeight);
    console.log(`Submitting ${blockHeaders.length} headers`);

    if (blockHeaders.length > 0) {
      let tx = await relayer.addHeaders("0x" + lastHeader, concated, overrides);
      console.log(`Submission tx ${tx.hash}`);
      await tx.wait();
      console.log("Submitted headers");
    
      const ancestor = lastBlockhash;
      const currentBest = "0x" + lastHeader;
      const newBest = "0x" + blockHeaders[blockHeaders.length - 1];
      const limit = 200;

      tx = await vbtc.markNewHeaviest(ancestor, currentBest, newBest, limit, overrides);
      console.log(`Mark new tx ${tx.hash}`);
      await tx.wait();
      console.log("Submitted new heaviest");
    }
  } catch (e) {
    console.log(e);
  }
}

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function realMain() {
  while (true) {
    console.log("New round");
    await main();
    await delay(1000);
  }
}

realMain();


