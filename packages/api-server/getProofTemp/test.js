const Client = require('bitcoin-core');
const client = new Client({
  host: 'bcd.strudel.finance',
  port: 8332,
  username: 'masterbaker',
  password: 'test9900',
  network: 'mainnet',
  version: '0.20.1',
});

const txHash = "1b8d5e92cf15ec9aeb55170cd96cfa6b0397447a96b72a8b98452ee29dff7f32";
const blockHash = "0000000000000000000ab444ca941c5bfc4ecedfc59bc66f76586be94f301957";

async function main() {
  const i = await client.getTxOutProof({
    blockhash: "0000000000000000000ab444ca941c5bfc4ecedfc59bc66f76586be94f301957",
    txids: [txHash],
  });
  console.log(i);
}

main();
