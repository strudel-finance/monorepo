# Monorepo for Strudel Finance

Strudel Finance is the first one-way, **trustless bridge** linking Bitcoin to Ethereum. The bridge can only be crossed by burning BTC on the Bitcoin blockchain and receiving an equal amount vBTC on Ethereum. The action is irreversable.

The purpose of the Strudel is two-fold:
1. **Integrating the Bitcoin and Ethereum ecosystems** tightly with each other. By equiping BTC with the ERC20 interface and smart-contract interoperability it becomes more versatile. Furthermore, it's supply can be locked into protocols for lending, options and other DeFi use-cases, reducing its volatility and potentially increasing market value.
2. **Reducing systemic risk** in the ecosystem, as introduced by trusted bridge solutions like $REN and $WBTC. Not only do these bridges lock BTC in [insecure multisig setups](https://medium.com/wanchain-foundation/how-safe-are-todays-wrapped-btc-bridges-b0f35a7b15e2) (<8  signers), but they [raise concerns](https://twitter.com/VitalikButerin/status/1295252403558559746) of total value collapse causing harm to protocols locking these assets.

**vBTC is the better wrappend BTC!** With a fully auditable supply and no risk of compromise it is the asset of choice for traders and DeFi users. 

Read more about Strudel on [medium](https://medium.com/@strudelfinance) and follow us on [twitter](https://twitter.com/EnterTheStrudel).

## Packages

| Package                                   | Description                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| [`@strudelfinance/onchain`](/packages/onchain) | Contracts and all the business logic |
| [`@strudelfinance/frontend`](/packages/frontend) | Web App for burning and farming |
| [`@strudelfinance/backend`](/packages/backend) | Backend services, supporting frontend |

## Deployments

### Ethereum Mainnet

$TRDL token: [0x297d33e17e61c2ddd812389c2105193f8348188a](https://etherscan.io/token/0x297d33e17e61c2ddd812389c2105193f8348188a)

vBTC token: [0xe1406825186d63980fd6e2ec61888f7b91c4bae4](https://etherscan.io/token/0xe1406825186d63980fd6e2ec61888f7b91c4bae4)

vBCH token: [0xb5badfa6e69728adba44d67c98b05f1d1d40182e](https://etherscan.io/token/0xb5badfa6e69728adba44d67c98b05f1d1d40182e)

g$TRDL token: [0x64d506ba9ba0cc9f0326cc72f134e754df0e2aff](https://etherscan.io/token/0x64d506ba9ba0cc9f0326cc72f134e754df0e2aff)

governance MultiSig: [0xb61b683cDccCa879166885841004586847bE793C](https://etherscan.io/address/0xb61b683cDccCa879166885841004586847bE793C)

### Binance Smart Chain

$TRDL token: [0x297d33e17e61c2ddd812389c2105193f8348188a](https://bscscan.com/token/0x46c6426b0e18c61a642aca01adf668da17176bc2)

vBCH token: [0xb5badfa6e69728adba44d67c98b05f1d1d40182e](https://bscscan.com/token/0xe1406825186d63980fd6e2ec61888f7b91c4bae4)

governance MultiSig: [0x02734aCa8026b34EE15D9DE6a620823EbCcD2548](https://bscscan.com/address/0x02734aCa8026b34EE15D9DE6a620823EbCcD2548)

### Harmony 

$TRDL token: [0x8a3937950BF912c1680b7366DB4D1731E45F7fAA](https://explorer.harmony.one/address/0x8a3937950BF912c1680b7366DB4D1731E45F7fAA)

vBTC token: [0xDb29b395e5E216593C406D9ecC3222580c636Fd4](https://explorer.harmony.one/address/0x1567442538f5f0d0411ded1f701d95fc79e80197)

governance MultiSig: [0x1567442538f5f0d0411DED1F701d95fc79E80197](https://explorer.harmony.one/address/0x1567442538f5f0d0411ded1f701d95fc79e80197)

