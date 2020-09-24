const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const { DB } = require('./utils/db');
const StrudelHandler = require('./strudelHandler');

exports.handler = async (event, context) => {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  const service = new StrudelHandler(
    new DB(process.env.TABLE_NAME)
  );

  const rv = await service.handlePayment(paymentId);
  rv.statusCode = 200;
  return rv;
};