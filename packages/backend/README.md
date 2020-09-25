# API Overview

```
  GET - https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/account/{account}
  POST - https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/account/{account}/addSig
  POST - https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/payment/{txHash}
  POST - https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/payment/{txHash}/output/{outputIndex}/addEthTx
  GET - https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/watchlist
  GET - https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/proof/{txHash}/{blockHash}
```

## GET /account/\<0xaa..ff\>
possible responses:
- 200: no previous paymnts
	```json
    {
      "account": "0x20",
      "burns": []
    }
	```
- 200: no previous paymnts, only sig
	```json
    {
      "account": "0x20",
      "burns": [],
      "sig": {
        "r": "0x32",
	"s": "0x32",
	"v": 8
      }
    }
	```
- 200: one previous payment, no sig
	```json
    {
      "account": "0x20",
      "burns": [{
		"amount": "1000", // satoshis
		"dateCreated": "23/9/2020",
		"btcTxHash": "0x32",
		"status": "pending"
	  }]
    }
	```
- 200: 2 previous payments and sig
	```json
    {
      "account": "0x20",
      "burns": [{
		"amount": 1000, // satoshis
		"dateCreated": "23/9/2020",
		"btcTxHash": "0x32",
		"ethTxHash": "0x32",
		"status": "paid"
	}, {..}],
      "sig": {
        "r": "0x32",
	"s": "0x32",
	"v": 8
      }
    }
	```
- 404: account not found

example:

```
curl -H "Content-Type: application/json" https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/account/0x14791697260E4c9A71f18484C9f997B308e59325
```

## POST /account/\<0xaa..ff\>/addSig

this can be done for 

post body:
```json
{
	"r": "0x32",
	"s": "0x32",
	"v": 256
}
```

responses:
- 200: sig already here, and it's the same
- 204: sig added
- 400: sig does not match account address
- 404: account not found

example:
```
curl --data '{"r":"0xf93927710a3a451d0a5e5c00013078156e6e1de125513ef855322bb7cd82f846","s":"0x4973d0cf7adc5809004833afc97f5eb98ab3ed5a8a5ad38b2d4e10e071b36faf","v":27}' -H "Content-Type: application/json" -X POST https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/account/0x14791697260E4c9A71f18484C9f997B308e59325/addSig
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

## GET /watchlist
responses:
- 200: `["P2FSH_ADDR_1", "P2FSH_ADDR_2", "P2FSH_ADDR_3"]`

## GET /tx/\<txHash\>
responses:
- 200:
	```json
	{bitcoin tx data as returned bitcoind rpc}
	```
- 400: no relevant output
- 404: tx not found

## GET /proof/\<txHash\>/\<blockHash\>
responses:
- 200:
	```json
	{
	  "proof": "0x1122..3344",
	  "header": "0x2233..4455",
	  "txData": "0x3344..5566"
	}
	```
- 400: no relevant output
- 404: block not found
- 408: tx not found in block

[this code](https://github.com/summa-tx/bitcoin-spv/tree/master/js) can be used to verify proofs client side.
