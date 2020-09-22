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

