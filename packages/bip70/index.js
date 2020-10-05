const express = require("express");
const fs = require("fs");
const bitcore = require("bitcore-lib");
const PaymentProtocol = require("bitcore-payment-protocol");
const bodyParser = require("body-parser");
const file_with_x509_der_cert = fs.readFileSync("/home/ubuntu/bip70/cert.der");
const file_with_x509_der_chain = fs.readFileSync(
  "/home/ubuntu/bip70/chain.der"
);
const file_with_x509_private_key = fs.readFileSync(
  "/home/ubuntu/bip70/privkey.pem",
  "utf8"
);
const request = require("request");

const app = express();
const port = 8080;

const headers = {
  "content-type": "text/plain;",
};
const appJson = {
  "content-type": "application/json",
};
const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const PROTOCOL_ID = Buffer.from("07ffff", "hex"); // 2^19-1

function httpRequest(params) {
  return new Promise(function (resolve, reject) {
    const req = request(params, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        console.log("data:", data);
        resolve(body);
      } else {
        console.log("error:", response.body);
        reject(response.body);
      }
    });
  });
}

app.use(bodyParser.raw({ type: "*/*" }));

app.get("/:destination/:amount", (req, res) => {
  let destinationAddress = req.params.destination;
  // TODO: sanitize input
  const amount = req.params.amount;
  // TODO: sanitize input
  console.log("query:", destinationAddress, amount);
  destinationAddress = destinationAddress.replace("0x", "");

  const dataBuf = Buffer.alloc(23);
  PROTOCOL_ID.copy(dataBuf, 0, 0, 3);
  Buffer.from(destinationAddress, "hex").copy(dataBuf, 3, 0, 20);
  const script = bitcore.Script.buildDataOut(dataBuf).toBuffer();
  const output = new PaymentProtocol().makeOutput();
  output.set("amount", amount);
  output.set("script", script);

  const now = (Date.now() / 1000) | 0;
  const details = new PaymentProtocol("BTC").makePaymentDetails();
  details.set("network", "main");
  details.set("outputs", output.message);
  details.set("time", now);
  details.set("expires", now + 60 * 60 * 24);
  details.set("memo", "A request to enter the strudel.");
  details.set("payment_url", "https://bip70.strudel.finance/ack");
  details.set("merchant_data", Buffer.from(JSON.stringify({ foo: "bar" })));
  const certificates = new PaymentProtocol().makeX509Certificates();
  certificates.set("certificate", [
    file_with_x509_der_cert,
    file_with_x509_der_chain,
  ]);
  const request = new PaymentProtocol().makePaymentRequest();
  request.set("payment_details_version", 1);
  request.set("pki_type", "x509+sha256");
  request.set("pki_data", certificates.serialize());
  console.log(details);
  request.set("serialized_payment_details", details.serialize());
  request.sign(file_with_x509_private_key);
  const rawbody = request.serialize();
  // Example HTTP Response Headers:
  // Content-Type: PaymentProtocol.LEGACY_PAYMENT.BTC.REQUEST_CONTENT_TYPE
  // Content-Length: request.length
  // Content-Transfer-Encoding: 'binary'
  res.set({
    "Content-Type": PaymentProtocol.LEGACY_PAYMENT.BTC.REQUEST_CONTENT_TYPE,
    "Content-Length": request.length,
    "Content-Transfer-Encoding": "binary",
  });
  res.send(rawbody);
});

app.post("/ack", async (req, res) => {
  // Decode payment
  const body = PaymentProtocol.Payment.decode(req.body);
  const payment = new PaymentProtocol().makePayment(body);
  const merchantData = payment.get("merchant_data");
  const transactions = payment.get("transactions");
  const txData = transactions[0].toString("hex");
  console.log("tx:", txData);
  const dataString =
    '{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["' +
    txData +
    '"]}';
  const rpcOptions = {
    url: `http://${USER}:${PASS}@90.179.1.59:10666/`,
    method: "POST",
    headers: headers,
    body: dataString,
  };

  const rsp = await httpRequest(rpcOptions);
  console.log("here", rsp);
  const txHash = JSON.parse(rsp).result;
  console.log("txHash:", txHash);

  const backendOptions = {
    url: `https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/payment/${txHash}`,
    method: "POST",
    headers: appJson,
    body: `{"txData":"${txData}"}`,
  };

  await httpRequest(backendOptions);

  // Make a payment acknowledgement
  var ack = new PaymentProtocol().makePaymentACK();
  ack.set("payment", payment.message);
  ack.set("memo", "Thank you for your payment!");
  var rawBody = ack.serialize();

  res.set({
    "Content-Type": PaymentProtocol.LEGACY_PAYMENT.BTC.PAYMENT_ACK_CONTENT_TYPE,
    "Content-Length": rawBody.length,
    "Content-Transfer-Encoding": "binary",
  });

  res.send(rawBody);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
