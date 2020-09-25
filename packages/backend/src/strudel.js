const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const ethers = require('ethers');
const { DB } = require('./utils/db');
const StrudelHandler = require('./strudelHandler');

exports.handler = async (event, context) => {
  const providerUrl = process.env.PROVIDER_URL;
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const path = event.requestPath;
  const method = event.method;

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const service = new StrudelHandler(
    new DB(process.env.TABLE_NAME),
    provider
  );

  if (path.indexOf('account') > -1 && method === 'GET') {
      return await service.getAccount(event.path.account);
  }
  if (path.indexOf('addSig') > -1 && method === 'POST') {
      return await service.addSig(event.path.account, {
        r: body.r,
        s: body.s,
        v: body.v
      });
  }
  if (path.indexOf('payment') > -1 && method === 'POST') {
      return await service.addBtcTx(event.path.txHash, body.txData);
  }
  if (path.indexOf('output') > -1 && method === 'POST') {
      return await service.addEthTx(
        event.path.txHash,
        event.path.outputIndex,
        body.ethTxHash
      );
  }
  if (path.indexOf('watchlist') > -1 && method === 'GET') {
      return await service.getWatchlist();
  }
  if (path.indexOf('proof') > -1 && method === 'GET') {
      return await service.getInclusionProof(event.path.txHash, event.path.blockHash);
  }
  return `Not Found: unexpected path: ${path}`;
};