# API Overview

https://www.serverless.com/plugins/serverless-dotenv-plugin

```
  GET  - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/account/{account} - Used at frontend
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/payment/{txHash}
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/bch/payment/{txHash}
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/payment/{txHash}/output/{outputIndex}/addEthTx - Used at frontend after minting vBTC
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/bch/payment/{txHash}/output/{outputIndex}/addEthTx
  - Used at frontend after minting vBCH
  GET  - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/syn/{destination}/{amount} - BTC to vBTC
  GET  - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/bch/syn/{destination}/{amount}
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/ack
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/bch/ack
  GET  - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/watchlist
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/proof/{txHash}/{blockHash} - Used at frontend before minting vBTC
  POST - https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/bch/proof/{txHash}/{blockHash} - Used at frontend before minting vBCH
```

## GET /account/\<0xaa..ff\>
possible responses:
- 200: no previous payment
	```json
    {
      "account": "0x20",
      "burns": [],
      "bchBurns": [],
    }
	```
- 200: one previous payment
	```json
    {
      "account": "0x20",
      "burns": [{
		"amount": "1000", // satoshis
		"dateCreated": "23/9/2020",
		"btcTxHash": "0x32",
		"burnOutputIndex": "0",
		"status": "pending"
	  }],
	  "bchBurns": []
    }
	```
- 400: invalid Ethereum address
- 404: account not found

example:

```
curl -H "Content-Type: application/json" https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/account/0x14791697260E4c9A71f18484C9f997B308e59325
```


## POST /payment/\<0xaa..32..ff\>

post body:
```json
{
	"txData": "0x1122..3344"
}
```
responses:
- 200: btc tx parsed and added
- 400: no relevant output
- 404: account not found
- 408: tx not found in mempool

example:
```
curl --data '{"txData": "02000000017aa6eca8ed999fd0205a3a8af9d60e2b1893cb1245abb11b87493d26026e6b78000000006b483045022100ac3618fa1915b4139eca9898443de39058fe984e858cf837982824f25093439e022045c1d89f5fea34810a94c648c2c3dec191c9922e306d33cead7998e03828a6c40121035d143cdcd601d42523b5274601391de0ab0bc9a04e3d4303b2d2358eaff23caaffffffff021027000000000000196a1707ffff89ab6d3c799d35f5b17194ee7f07253856a67949c2ff1c00000000001976a91482ab5c363cef14a2b24fa09d9ab16c2ec2fdc9a388ac00000000"}' -H "Content-Type: application/json" -X POST https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/payment/94105cdc1032fa8fd97e45f39b015b6b19b9d47ccf9142c65ee5ae1ea3f32cb1
```

## POST /payment/\<0xaa..32..ff\>/output/\<outputIndex\>/addEthTx
post body:
```json
{
	"ethTxHash": "0x32"
}
```
responses:
- 200: sucessfull eth Tx found on chain and added
- 400: no relevent event
- 404: account not found
- 408: tx not found on chain

example:
```
curl --data '{"ethTxHash": "0xaf362ecb29e457df9853d023f0d01233758d56624b090e91b77d3994606cc7a7"}' -H "Content-Type: application/json" -X POST https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/payment/94105cdc1032fa8fd97e45f39b015b6b19b9d47ccf9142c65ee5ae1ea3f32cb1/output/0/addEthTx
```

## GET /tx/\<txHash\>
responses:
- 200:
	```json
	{bitcoin tx data as returned bitcoind rpc}
	```
- 400: no relevant output
- 404: tx not found

## POST /proof/\<txHash\>/\<blockHash\>
post body:
```json
{
	"txData": "0x32"
}
```

responses:
- 200:
	```json
	{
	  "header": "0x2233..4455",
	  "proof": "0x1122..3344", // used with index at getInclusion at the frontend
	  "version": "0x02000000",
	  "locktime": "0x00000000",
	  "index": 145, // tx in block, used for proof verification
	  "vin": "0x3344..5566",
	  "vout": "0x4455..6677"
	}
	```
- 400: no relevant output
- 404: block not found
- 408: tx not found in block

example:
```
curl  --data '{"txData": "02000000017aa6eca8ed999fd0205a3a8af9d60e2b1893cb1245abb11b87493d26026e6b78000000006b483045022100ac3618fa1915b4139eca9898443de39058fe984e858cf837982824f25093439e022045c1d89f5fea34810a94c648c2c3dec191c9922e306d33cead7998e03828a6c40121035d143cdcd601d42523b5274601391de0ab0bc9a04e3d4303b2d2358eaff23caaffffffff021027000000000000196a1707ffff89ab6d3c799d35f5b17194ee7f07253856a67949c2ff1c00000000001976a91482ab5c363cef14a2b24fa09d9ab16c2ec2fdc9a388ac00000000"}' -H "Content-Type: application/json" -X POST https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/proof/94105cdc1032fa8fd97e45f39b015b6b19b9d47ccf9142c65ee5ae1ea3f32cb1/0000000000000000000567381f8526bdd88cfd0abe62b09457f669b6ed8d519c
```

[this code](https://github.com/summa-tx/bitcoin-spv/tree/master/js) can be used to verify proofs client side.

## deploy

```
$export AWS_ACCESS_KEY_ID=<your-key-here>
$export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
$deploy:serverless
```
