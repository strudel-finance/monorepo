import BigNumber from 'bignumber.js/bignumber'
import ERC20Abi from './abi/erc20.json'
import MasterChefAbi from './abi/masterchef.json'
import StrudelAbi from './abi/StrudelToken.json'
import VBTCAbi from './abi/vbtc.json'
import VBCHAbi from './abi/vbch.json'
import UNIV2PairAbi from './abi/uni_v2_lp.json'
import WETHAbi from './abi/weth.json'
import RelayAbi from './abi/Relay.json'
import { contractAddresses, supportedPools, Pool } from './constants'
import Web3 from 'web3'
import { Options } from '../Vbch'
// import { VbtcTokenInterface } from './abi/types/VbtcToken'
// import { StrudelTokenInterface } from './abi/types/StrudelToken'
// import { TorchShipInterface } from './abi/types/TorchShip'
// import { IWETH9Interface } from './abi/types/IWETH9'
// import { IRelayInterface } from './abi/types/IRelay'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import {
  ERC20Contract,
  MasterChefContract,
  RelayContract,
  StrudelContract,
  UniContract,
  VbtcContract,
  WethContract,
} from './contracts.types'

interface ExtendedPool extends Pool {
  lpAddress: string
  tokenAddress: string
  lpContract: ERC20Contract | UniContract
  tokenContract: ERC20Contract
}

export class Contracts {
  web3: Web3
  networkId: number
  options: Options
  provider: any

  defaultAccount: string
  defaultConfirmations: number
  autoGasMultiplier: number
  testing: boolean
  defaultGas: string
  defaultGasPrice: string
  accounts: string[]
  ethereumNodeTimeout: number

  vbtc: VbtcContract
  strudel: StrudelContract
  masterChef: MasterChefContract
  weth: WethContract
  relay: RelayContract
  // !!! TODO: import types !!!
  vbch: any
  // !!! TODO: import types !!!
  pools: ExtendedPool[]

  constructor(provider: any, networkId: number, web3: Web3, options: Options) {
    this.web3 = web3
    this.defaultConfirmations = options.defaultConfirmations
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5
    // !!! TODO: is this shit in use??? !!!
    // this.confirmationType =
    //   options.confirmationType || Types.ConfirmationType.Confirmed
    this.defaultGas = options.defaultGas
    this.defaultGasPrice = options.defaultGasPrice

    this.strudel = new this.web3.eth.Contract(
      StrudelAbi as AbiItem[],
    ) as StrudelContract
    this.vbtc = new this.web3.eth.Contract(VBTCAbi as AbiItem[]) as VbtcContract
    this.masterChef = new this.web3.eth.Contract(
      MasterChefAbi as AbiItem[],
    ) as MasterChefContract
    this.weth = new this.web3.eth.Contract(WETHAbi as AbiItem[]) as WethContract
    this.relay = new this.web3.eth.Contract(
      RelayAbi as AbiItem[],
    ) as RelayContract
    // !!! TODO: add type
    this.vbch = new this.web3.eth.Contract(VBCHAbi as AbiItem[]) as any

    this.pools = supportedPools.map((pool) => {
      return Object.assign(pool, {
        lpAddress: pool.lpAddresses[networkId],
        tokenAddress: pool.tokenAddresses[networkId],
        lpContract: new this.web3.eth.Contract(
          UNIV2PairAbi as AbiItem[],
        ) as UniContract,
        tokenContract: new this.web3.eth.Contract(
          ERC20Abi as AbiItem[],
        ) as ERC20Contract,
      })
    })

    this.setProvider(provider, networkId)
    this.setDefaultAccount(this.web3.eth.defaultAccount)
  }

  setProvider(provider: any, networkId: number) {
    function _setProvider<T>(contract: Contract & T, address: string) {
      // !!! TODO TODO TODO TODO !!!
      ;(contract as any).setProvider(provider)
      if (address) contract.options.address = address
      else console.error('Contract address not found in network', networkId)
    }

    _setProvider(this.vbtc, contractAddresses.vbtc[networkId])
    _setProvider(this.strudel, contractAddresses.strudel[networkId])
    _setProvider(this.masterChef, contractAddresses.masterChef[networkId])
    _setProvider(this.weth, contractAddresses.weth[networkId])
    _setProvider(this.relay, contractAddresses.relay[networkId])
    _setProvider(this.vbch, contractAddresses.vbch[networkId])

    // !!! TODO !!!

    // this.pools.forEach(
    //   ({
    //     lpContract,
    //     lpAddress,
    //     tokenContract,
    //     tokenAddress,
    //     balancerPoolAddress,
    //     balancerPoolContract,
    //   }) => {
    //     if (balancerPoolAddress) {
    //       _setProvider(balancerPoolContract, balancerPoolAddress)
    //     }
    //     _setProvider(lpContract, lpAddress)
    //     _setProvider(tokenContract, tokenAddress)
    //   },
    // )
  }

  setDefaultAccount(account: string) {
    this.vbtc.options.from = account
    this.strudel.options.from = account
    // !!!
    // this.vbch.options.from = account
    this.masterChef.options.from = account
  }

  // async callContractFunction(method, options) {
  //   const {
  //     confirmations,
  //     confirmationType,
  //     autoGasMultiplier,
  //     ...txOptions
  //   } = options

  //   if (!this.blockGasLimit) {
  //     await this.setGasLimit()
  //   }

  //   if (!txOptions.gasPrice && this.defaultGasPrice) {
  //     txOptions.gasPrice = this.defaultGasPrice
  //   }

  //   if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
  //     let gasEstimate
  //     if (
  //       this.defaultGas &&
  //       confirmationType !== Types.ConfirmationType.Simulate
  //     ) {
  //       txOptions.gas = this.defaultGas
  //     } else {
  //       try {
  //         console.log('estimating gas')
  //         gasEstimate = await method.estimateGas(txOptions)
  //       } catch (error) {
  //         const data = method.encodeABI()
  //         const { from, value } = options
  //         const to = method._parent._address
  //         error.transactionData = { from, value, data, to }
  //         throw error
  //       }

  //       const multiplier = autoGasMultiplier || this.autoGasMultiplier
  //       const totalGas = Math.floor(gasEstimate * multiplier)
  //       txOptions.gas =
  //         totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit
  //     }

  //     if (confirmationType === Types.ConfirmationType.Simulate) {
  //       let g = txOptions.gas
  //       return { gasEstimate, g }
  //     }
  //   }

  //   if (txOptions.value) {
  //     txOptions.value = new BigNumber(txOptions.value).toFixed(0)
  //   } else {
  //     txOptions.value = '0'
  //   }

  //   const promi = method.send(txOptions)

  //   const OUTCOMES = {
  //     INITIAL: 0,
  //     RESOLVED: 1,
  //     REJECTED: 2,
  //   }

  //   let hashOutcome = OUTCOMES.INITIAL
  //   let confirmationOutcome = OUTCOMES.INITIAL

  //   const t =
  //     confirmationType !== undefined ? confirmationType : this.confirmationType

  //   if (!Object.values(Types.ConfirmationType).includes(t)) {
  //     throw new Error(`Invalid confirmation type: ${t}`)
  //   }

  //   let hashPromise
  //   let confirmationPromise

  //   if (
  //     t === Types.ConfirmationType.Hash ||
  //     t === Types.ConfirmationType.Both
  //   ) {
  //     hashPromise = new Promise((resolve, reject) => {
  //       promi.on('error', (error) => {
  //         if (hashOutcome === OUTCOMES.INITIAL) {
  //           hashOutcome = OUTCOMES.REJECTED
  //           reject(error)
  //           const anyPromi = promi
  //           anyPromi.off()
  //         }
  //       })

  //       promi.on('transactionHash', (txHash) => {
  //         if (hashOutcome === OUTCOMES.INITIAL) {
  //           hashOutcome = OUTCOMES.RESOLVED
  //           resolve(txHash)
  //           if (t !== Types.ConfirmationType.Both) {
  //             const anyPromi = promi
  //             anyPromi.off()
  //           }
  //         }
  //       })
  //     })
  //   }

  //   if (
  //     t === Types.ConfirmationType.Confirmed ||
  //     t === Types.ConfirmationType.Both
  //   ) {
  //     confirmationPromise = new Promise((resolve, reject) => {
  //       promi.on('error', (error) => {
  //         if (
  //           (t === Types.ConfirmationType.Confirmed ||
  //             hashOutcome === OUTCOMES.RESOLVED) &&
  //           confirmationOutcome === OUTCOMES.INITIAL
  //         ) {
  //           confirmationOutcome = OUTCOMES.REJECTED
  //           reject(error)
  //           const anyPromi = promi
  //           anyPromi.off()
  //         }
  //       })

  //       const desiredConf = confirmations || this.defaultConfirmations
  //       if (desiredConf) {
  //         promi.on('confirmation', (confNumber, receipt) => {
  //           if (confNumber >= desiredConf) {
  //             if (confirmationOutcome === OUTCOMES.INITIAL) {
  //               confirmationOutcome = OUTCOMES.RESOLVED
  //               resolve(receipt)
  //               const anyPromi = promi
  //               anyPromi.off()
  //             }
  //           }
  //         })
  //       } else {
  //         promi.on('receipt', (receipt) => {
  //           confirmationOutcome = OUTCOMES.RESOLVED
  //           resolve(receipt)
  //           const anyPromi = promi
  //           anyPromi.off()
  //         })
  //       }
  //     })
  //   }

  //   if (t === Types.ConfirmationType.Hash) {
  //     const transactionHash = await hashPromise
  //     if (this.notifier) {
  //       this.notifier.hash(transactionHash)
  //     }
  //     return { transactionHash }
  //   }

  //   if (t === Types.ConfirmationType.Confirmed) {
  //     return confirmationPromise
  //   }

  //   const transactionHash = await hashPromise
  //   if (this.notifier) {
  //     this.notifier.hash(transactionHash)
  //   }
  //   return {
  //     transactionHash,
  //     confirmation: confirmationPromise,
  //   }
  // }

  // async callConstantContractFunction(method, options) {
  //   const m2 = method
  //   const { blockNumber, ...txOptions } = options
  //   return m2.call(txOptions, blockNumber)
  // }

  // async setGasLimit() {
  //   const block = await this.web3.eth.getBlock('latest')
  //   this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT
  // }
}
