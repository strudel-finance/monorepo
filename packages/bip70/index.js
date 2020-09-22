const express = require('express');
const fs = require('fs');
const bitcore = require('bitcore-lib');
const PaymentProtocol = require('bitcore-payment-protocol');

const file_with_x509_der_cert = fs.readFileSync('/home/ubuntu/bip70/cert.der');
const file_with_x509_der_chain = fs.readFileSync('/home/ubuntu/bip70/chain.der');
const file_with_x509_private_key = fs.readFileSync('/home/ubuntu/bip70/privkey.pem', 'utf8');

const app = express();
const port = 8080;

app.get('/', (req, res) => {res.send('hello world');});

app.get('/bla/', (req, res) => {res.send('hello world 2');});

app.get('/:destination/:amount', (req, res) => {

  let destinationAddress = req.params.destination;
  // TODO: sanitize input
  const amount = req.params.amount;
  // TODO: sanitize input
  console.log('query:', destinationAddress, amount);
  destinationAddress = destinationAddress.replace('0x', '');

  const script = bitcore.Script.buildDataOut(Buffer.from(destinationAddress, 'hex')).toBuffer();
  const output = new PaymentProtocol().makeOutput();
  output.set('amount', amount);
  console.log('amount:', amount, output);
  output.set('script', script);
  console.log('address:', output);

  const now = Date.now() / 1000 | 0;
  const details = new PaymentProtocol('BTC').makePaymentDetails();
  details.set('network', 'main');
  details.set('outputs', output.message);
  details.set('time', now);
  details.set('expires', now + 60 * 60 * 24);
  details.set('memo', 'A payment request from the merchant.');
  details.set('payment_url', 'https://bip70.strudel.finance/payment');
  details.set('merchant_data', Buffer.from(JSON.stringify({"foo": "bar"})));
  const certificates = new PaymentProtocol().makeX509Certificates();
  certificates.set('certificate', [file_with_x509_der_cert, file_with_x509_der_chain]);
  const request = new PaymentProtocol().makePaymentRequest();
  request.set('payment_details_version', 1);
  request.set('pki_type', 'x509+sha256');
  request.set('pki_data', certificates.serialize());
  console.log(details);
  request.set('serialized_payment_details', details.serialize());
  request.sign(file_with_x509_private_key);
  const rawbody = request.serialize();
  // Example HTTP Response Headers:
  // Content-Type: PaymentProtocol.LEGACY_PAYMENT.BTC.REQUEST_CONTENT_TYPE
  // Content-Length: request.length
  // Content-Transfer-Encoding: 'binary'
  res.set({
    'Content-Type': PaymentProtocol.LEGACY_PAYMENT.BTC.REQUEST_CONTENT_TYPE,
    'Content-Length': request.length,
    'Content-Transfer-Encoding': 'binary'
  });
  res.send(rawbody);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})