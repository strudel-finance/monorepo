# Monorepo for Strudel Finance

![header](https://user-images.githubusercontent.com/659301/95357676-725b4e80-08c8-11eb-92f4-38895120b83d.png)

Strudel Finance is the first one-way, **trustless bridge** linking Bitcoin to Ethereum. The bridge can only be crossed by burning BTC on the Bitcoin blockchain and receiving an equal amount vBTC on Ethereum. The action is irreversable.

The purpose of the Strudel is two-fold:
1. To **integrate the Bitcoin and Ethereum ecosystems** tightly with each other. By equiping BTC with the ERC20 interface and smart-contract interoperability it becomes more versatile. Furthermore, it's supply can be locked into protocols for lending, options and other DeFi use-cases, reducing its volatility and potentially increasing market value.
2. To **reduce systemic risk** in the ecosystem, as introduced by trusted bridge solutions like $REN and $WBTC. Not only do these bridges lock BTC in [insecure multisig setups](https://medium.com/wanchain-foundation/how-safe-are-todays-wrapped-btc-bridges-b0f35a7b15e2) (<8  signers), but they [raise concerns](https://twitter.com/VitalikButerin/status/1295252403558559746) of total value collapse causing harm to protocols locking these assets.

**vBTC is the better wrappend BTC!** With a fully auditable supply and no risk of compromise it is the asset of choice for traders and DeFi users. 

Read more about $TRDL on [medium](https://medium.com/@strudelfinance) and follow us on [twitter](https://twitter.com/strudelfinance).

## Packages

| Package                                   | Description                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| [`@strudelfinance/onchain`](/packages/onchain) | Contracts and all the business logic |
| [`@strudelfinance/frontend`](/packages/frontend) | Web App for burning and farming |
| [`@strudelfinance/backend`](/packages/backend) | Backend services, supporting frontend |
