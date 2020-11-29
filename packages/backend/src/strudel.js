const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const ethers = require('ethers');
const { DB } = require('./utils/db');
const StrudelHandler = require('./strudelHandler');
const request = require('request');
const { PoorManRpc } = require('./utils/poorManRpc');

let provider;

exports.handler = async (event, context, callback) => {
  const providerUrl = process.env.PROVIDER_URL;
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const path = event.requestPath;
  const method = event.method;

  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(providerUrl);
  }
  const bclient = new PoorManRpc(
    request,
    process.env.BCD_USERNAME,
    process.env.BCD_PASSWORD,
    process.env.BCD_RPC,
    process.env.BCD_PORT,
  );
  const service = new StrudelHandler(
    new DB(process.env.TABLE_NAME),
    provider,
    bclient,
    process.env.CERT,
    process.env.CHAIN,
    process.env.PRIV,
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
  if (path.indexOf('output') > -1 && method === 'POST') {
      return await service.addEthTx(
        event.path.txHash,
        event.path.outputIndex,
        body.ethTxHash
      );
  }
  if (path.indexOf('payment') > -1 && method === 'POST') {
      return await service.addBtcTx(event.path.txHash, body.txData);
  }
  if (path.indexOf('syn') > -1 && method === 'POST') {
      const res = await service.paySyn(event.path.destination, event.path.amount);
      callback(null, {
        statusCode: 200,
        headers: res.headers,
        body: res.rawBody.toString('base64')
      });
      return;
  }
  if (path.indexOf('ack') > -1 && method === 'POST') {
      const res = await service.payAck(body);
      callback(null, {
        statusCode: 200,
        headers: res.headers,
        body: res.rawBody.toString('base64')
      });
      return;
  }
  if (path.indexOf('watchlist') > -1 && method === 'GET') {
      return await service.getWatchlist();
  }
  if (path.indexOf('proof') > -1 && method === 'POST') {
      return await service.getInclusionProof(event.path.txHash, event.path.blockHash, body.txData);
  }
  return `Not Found: unexpected path: ${path}`;
};
