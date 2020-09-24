# Strudel Finance

Vortex Finance is the first one-way, **trustless bridge** linking Bitcoin to Ethereum. The bridge can only be crossed by burning BTC on the Bitcoin blockchain and receiving an equal amount vBTC on Ethereum. The action is irreversable.

The purpose of the Vortex is two-fold:
1. To **integrate the Bitcoin and Ethereum ecosystems** tightly with each other. By equiping BTC with the ERC20 interface and smart-contract interoperability it becomes more versatile. Furthermore, it's supply can be locked into protocols for lending, options and other DeFi use-cases, reducing its volatility and potentially increasing market value.
2. To **reduce systemic risk** in the ecosystem, as introduced by trusted bridge solutions like $REN and $WBTC. Not only do these bridges lock BTC in [insecure multisig setups](https://medium.com/wanchain-foundation/how-safe-are-todays-wrapped-btc-bridges-b0f35a7b15e2) (<8  signers), but they [raise concerns](https://twitter.com/VitalikButerin/status/1295252403558559746) of total value collapse causing harm to protocols locking these assets.

**vBTC is the better wrappend BTC!** With a fully auditable supply and no risk of compromise it is the asset of choice for traders and DeFi users. 

### Bridge Design

When BTC is burned using the vortex finance interface, an OP_RETURN output with the burn amount and the data of the receiving Ethereum wallet address is created.

![burn transaction](https://i.imgur.com/2ZQiaNd.png)

Next, the block header of the Bitcoin block containing the transactions need to be relayed to Vortex contract on Ethereum, where its proof-of-work is verified and the canonical chain is constructed. The Vortex contract implements the [simple payment verification](https://en.bitcoinwiki.org/wiki/Simplified_Payment_Verification) (SPV) protocol as used by all light clients and most wallets of the Bitcoin network.

#### Fallback to P2FSH

A fallback for non-BIP70 wallets is provided. the ethereum address is injected into the P2SH (pay to script-hash) output as script, creating a P2FSH (fake script hash) output.

<drawing here></drawing>

Lastly an inclusion proof of the transaction is relayed to the Vortex contract, proving transaction inclusion, burn amount and receiver address. The Vortex contract verifies authenticity of the burn and mints vBTC.
The Vortex contract strictly mints 1 vBTC for 1 burned BTC, not taking any fees for bridge crossings.

### $STRDL

$STRDL (Strudel) is the governance and reward token for Vortex Finince. It is created on 3 separate ocasions:
1. when BTC cross the bridge, the user receives $STRDL. early users receive a quadratic bonus.
2. When liquidity is staked into the vBTC-ETH pool $STRDL is distributed. When liquidity is staked into the STRDL-ETH pool $STRDL is distributed. 
3. when block headers are relayed from Bitcoin to the Relayer contract.


### vBTC Price Stability

The supply of tokenized Bitcoin on Ethereum now [tops $1.1B](https://www.coindesk.com/tokenized-bitcoin-wrapped-bitcoin-on-ethereum). The demand for Bitcoin is here to stay, though it is unclear how much further it will grow.
As th Strudel Protocol implements a one-way trustless bridge, vBTC can not migrate back to its parent chain. Hence, the protocol aims to satisfy only the base demand for BTC on Ethereum, that supply which will not need to exit Ethereum back onto Bitcoin ever. This way vBTC holders will not 


Stablecoins have often gone off peg due to varying market conditions and limitations in monetary policy. The recent boom in yield farming has only exacerbated this problem as farmers buy and sell large amounts of stablecoins in order to chase the best yield.


The Strudel protocol empowers farmers to leverage their yield-seeking tendencies to help the DeFi ecosystem maintain the pegs of the 3 largest : DAI, USDC, USDT, and sUSD.
The idea is simple, PICKLEs are minted and distributed to Uniswap LPs of the following pools:
DAI-ETH
USDC-ETH
USDT-ETH
sUSD-ETH
When a stablecoin is above peg, the protocol will distribute fewer PICKLEs to that pool and more PICKLEs to other pools. As farmers chase the best yield, this creates sell pressure for the overvalued stablecoin and buy pressure for the other coins. This works in reverse for stablecoins that are below peg.
Initial distribution of PICKLEs is based off Curve.fi’s sUSD pool.
Image for post
Future distributions will be done via a timelock contract, with input from the governance community.