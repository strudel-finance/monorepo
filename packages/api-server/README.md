

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

## POST /account/\<0xaa..ff\>/addBtcTx

post body:
```json
{
	"btcTxHash": "0x32"
}
```
responses:
- 200: btc tx parsed and added
- 400: no relevant output
- 404: account not found
- 408: tx not found in mempool

## POST /account/\<0xaa..ff\>/addEthTx
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
	{bitcoind rpc proxy}
	```
- 400: no relevant output
- 404: tx not found

## GET /proof/\<txHash\>/\<blockHash\>
responses:
- 200:
	```json
	{bitcoind rpc proxy}
	```
- 400: no relevant output
- 404: block not found
- 408: tx not found in block

[this code](https://github.com/summa-tx/bitcoin-spv/tree/master/js) can be used to verify proofs client side.
