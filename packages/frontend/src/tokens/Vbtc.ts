import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import { Contracts } from './lib/contracts'
import { Account } from './lib/accounts'
import { EVM } from './lib/evm.js'

import { contractAddresses } from './lib/constants'

interface Options {
  defaultAccount: string
  defaultConfirmations: number
  autoGasMultiplier: number
  testing: boolean
  defaultGas: string
  defaultGasPrice: string
  accounts: string[]
  ethereumNodeTimeout: number
}

export class Vbtc {
  // !!!  TODO: add correct web3 type
  web3: any
  testing: EVM
  snapshot: Promise<string>
  contracts: Contracts
  vbtcAddress: string
  masterChefAddress: string
  wethAddress: string
  strudelAddress: string
  gStrudelAddress: string
  accounts: Account[]

  constructor(
    provider: any,
    networkId: number,
    testing: boolean,
    options: Options,
  ) {
    var realProvider
    if (typeof provider === 'string') {
      if (provider.includes('wss')) {
        realProvider = new Web3.providers.WebsocketProvider(provider, {
          timeout: options.ethereumNodeTimeout || 10000,
        })
      } else {
        realProvider = new Web3.providers.HttpProvider(provider, {
          timeout: options.ethereumNodeTimeout || 10000,
        })
      }
    } else {
      realProvider = provider
    }

    this.web3 = new Web3(realProvider)

    if (testing) {
      this.testing = new EVM(realProvider)
      this.snapshot = this.testing.snapshot()
    }

    if (options.defaultAccount) {
      this.web3.eth.defaultAccount = options.defaultAccount
    }

    this.contracts = new Contracts(realProvider, networkId, this.web3, options)
    
    this.vbtcAddress = contractAddresses.vbtc[networkId]

    this.masterChefAddress = contractAddresses.masterChef[networkId]
    this.wethAddress = contractAddresses.weth[networkId]
    
    this.strudelAddress = contractAddresses.strudel[networkId]
    this.gStrudelAddress = contractAddresses.gStrudel[networkId]
  }

  async resetEVM() {
    this.testing.resetEVM(await this.snapshot)
  }

  addAccount(address: string) {
    this.accounts.push(new Account(this.contracts, address))
  }

  setProvider(provider: any, networkId: number) {
    this.web3.setProvider(provider)
    this.contracts.setProvider(provider, networkId)
    // this.operation.setNetworkId(networkId)
  }

  // setDefaultAccount(account) {
  //   this.web3.eth.defaultAccount = account
  //   this.contracts.setDefaultAccount(account)
  // }

  // getDefaultAccount() {
  //   return this.web3.eth.defaultAccount
  // }

  // loadAccount(account) {
  //   const newAccount = this.web3.eth.accounts.wallet.add(account.privateKey)

  //   if (
  //     !newAccount ||
  //     (account.address &&
  //       account.address.toLowerCase() !== newAccount.address.toLowerCase())
  //   ) {
  //     throw new Error(`Loaded account address mismatch.
  //       Expected ${account.address}, got ${
  //       newAccount ? newAccount.address : null
  //     }`)
  //   }
  // }

  // toBigN(a) {
  //   return BigNumber(a)
  // }
}
