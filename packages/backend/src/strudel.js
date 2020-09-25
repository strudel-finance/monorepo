const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const { DB } = require('./utils/db');
const StrudelHandler = require('./strudelHandler');

exports.handler = async (event, context) => {
  const providerUrl = process.env.PROVIDER_URL;
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const service = new StrudelHandler(
    new DB(process.env.TABLE_NAME),
    provider
  );

  const rv = await service.handlePayment(paymentId);
  rv.statusCode = 200;
  return rv;
};