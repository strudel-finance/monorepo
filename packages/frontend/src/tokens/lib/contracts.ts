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
import * as Types from './types.js'

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
  confirmationType: number

  constructor(provider: any, networkId: number, web3: Web3, options: Options) {
    this.web3 = web3
    this.defaultConfirmations = options.defaultConfirmations
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5
    this.confirmationType = Types.ConfirmationType.Confirmed
    this.defaultGas = options.defaultGas
    this.defaultGasPrice = options.defaultGasPrice

    this.strudel = new this.web3.eth.Contract(StrudelAbi as AbiItem[]) as any
    this.vbtc = new this.web3.eth.Contract(VBTCAbi as AbiItem[]) as any
    this.masterChef = new this.web3.eth.Contract(
      MasterChefAbi as AbiItem[],
    ) as any
    this.weth = new this.web3.eth.Contract(WETHAbi as AbiItem[]) as any
    this.relay = new this.web3.eth.Contract(RelayAbi as AbiItem[]) as any
    // !!! TODO: add type
    this.vbch = new this.web3.eth.Contract(VBCHAbi as AbiItem[]) as any

    this.pools = supportedPools.map((pool) => {
      return Object.assign(pool, {
        lpAddress: pool.lpAddresses[networkId],
        tokenAddress: pool.tokenAddresses[networkId],
        lpContract: new this.web3.eth.Contract(
          UNIV2PairAbi as AbiItem[],
        ) as any,
        tokenContract: new this.web3.eth.Contract(
          ERC20Abi as AbiItem[],
        ) as any,
      })
    })

    this.setProvider(provider, networkId)
    this.setDefaultAccount(this.web3.eth.defaultAccount)
  }

  setProvider(provider: any, networkId: number) {
    function _setProvider<T>(contract: Contract & T, address: string) {
      // !!! TODO TODO TODO TODO !!! web3-eth-contract `Contract` has a method setProvider
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

    this.pools.forEach(
      ({
        lpContract,
        lpAddress,
        tokenContract,
        tokenAddress,
        // balancerPoolAddress,
        // balancerPoolContract,
      }) => {
        // if (balancerPoolAddress) {
        //   _setProvider(balancerPoolContract, balancerPoolAddress)
        // }
        _setProvider(lpContract, lpAddress)
        _setProvider(tokenContract, tokenAddress)
      },
    )
  }

  setDefaultAccount(account: string) {
    this.vbtc.options.from = account
    this.strudel.options.from = account
    // !!!
    // this.vbch.options.from = account
    this.masterChef.options.from = account
  }
}
