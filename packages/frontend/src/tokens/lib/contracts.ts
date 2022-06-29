import BigNumber from 'bignumber.js/bignumber'
import ERC20Abi from './abi/erc20.json'
import MasterChefAbi from './abi/masterchef.json'
import StrudelAbi from './abi/StrudelToken.json'

// For ETH
import RelayAbi from './abi/Relay.json'
import VBTCAbi from './abi/vbtc.json' 
// For Harmony
// import VBTCAbi from './abi/HarmonyVBTC.json' 
import HarmonyVBTCAbi from './abi/HarmonyVBTC.json' 

import VBCHAbi from './abi/vbch.json'
import UNIV2PairAbi from './abi/uni_v2_lp.json'
import WETHAbi from './abi/weth.json'
import gStrudel from './abi/gStrudel.json'

// Harmony Relay contract is different from ETH and BSC
import HarmonyRelayAbi from './abi/HarmonyRelay'

import { contractAddresses, supportedPools, Pool } from './constants'
import Web3 from 'web3'
import { Options } from '../Vbch'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'

// You can make types with this?
// https://github.com/joshstevens19/ethereum-abi-types-generator
// There was a $yarn tsc command
import {
  ERC20Contract,
  MasterChefContract,
  RelayContract,
  StrudelContract,
  UniContract,
  VbtcContract, // @steadylearner needs to change this also to mint
  WethContract,

  HarmonyVbtcContract,
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
  harmonyVbtc: HarmonyVbtcContract

  bridge: VbtcContract
  strudel: StrudelContract
  masterChef: MasterChefContract
  weth: WethContract

  relay: RelayContract
  // @steadylearner
  // // !!! TODO: import types !!! from onchain
  harmonyRelay: any
  // harmonyRelay: HarmonyRelayContract

  
  // !!! TODO: import types !!!
  vbch: any
  gStrudel: any
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

    // !!! TODO: TYPES !!!
    this.strudel = new this.web3.eth.Contract(StrudelAbi as AbiItem[]) as any
    this.gStrudel = new this.web3.eth.Contract(gStrudel as AbiItem[]) as any
    
    // @ts-ignore
    this.vbtc = new this.web3.eth.Contract(VBTCAbi as AbiItem[]) as any // ETH, BSC
    this.harmonyVbtc = new this.web3.eth.Contract(HarmonyVBTCAbi as AbiItem[]) as any // Harmony
    
    this.masterChef = new this.web3.eth.Contract(
      MasterChefAbi as AbiItem[],
    ) as any
    this.weth = new this.web3.eth.Contract(WETHAbi as AbiItem[]) as any

    this.relay = new this.web3.eth.Contract(RelayAbi as AbiItem[]) as any // ETH, BSC
    this.harmonyRelay = new this.web3.eth.Contract(HarmonyRelayAbi as AbiItem[]) as any // Harmony
    
    // !!! TODO: add type
    this.vbch = new this.web3.eth.Contract(VBCHAbi as AbiItem[]) as any

    this.pools = supportedPools.map((pool) => {
      return Object.assign(pool, {
        lpAddress: pool.lpAddresses[networkId],
        tokenAddress: pool.tokenAddresses[networkId],
        lpContract: new this.web3.eth.Contract(
          UNIV2PairAbi as AbiItem[],
        ) as any,
        tokenContract: new this.web3.eth.Contract(ERC20Abi as AbiItem[]) as any,
      })
    })

    this.setProvider(provider, networkId)
    this.setDefaultAccount(this.web3.eth.defaultAccount)
  }

  setProvider(provider: any, networkId: number) {
    // alert(contractAddresses.vbtc[networkId]);
    // alert(contractAddresses.strudel[networkId]);
    // alert(contractAddresses.vbtc[networkId]);
    // alert(contractAddresses.vbtc[networkId]);

    function _setProvider<T>(contract: Contract & T, address: string) {
    // function _setProvider<T>(contract: Contract & T, address: string, test: string) {
      // !!! TODO TODO TODO TODO !!! web3-eth-contract `Contract` has a method setProvider
      ;(contract as any).setProvider(provider)
      if (address) contract.options.address = address
      else console.error('Contract address not found in network', networkId)
    }

    _setProvider(this.vbtc, contractAddresses.vbtc[networkId])
    _setProvider(this.harmonyVbtc, contractAddresses.vbtc[1666600000])


    _setProvider(this.strudel, contractAddresses.strudel[networkId])
    
    _setProvider(this.masterChef, contractAddresses.masterChef[networkId])
    _setProvider(this.weth, contractAddresses.weth[networkId])

    _setProvider(this.relay, contractAddresses.relay[networkId]);
    _setProvider(this.harmonyRelay, contractAddresses.relay[1666600000]);
    
    _setProvider(this.vbch, contractAddresses.vbch[networkId])
    _setProvider(this.gStrudel, contractAddresses.gStrudel[networkId])

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

        // @steadylearner, what do these?
        _setProvider(lpContract, lpAddress)
        _setProvider(tokenContract, tokenAddress);
        // _setProvider(lpContract, lpAddress)
        // _setProvider(tokenContract, tokenAddress);
      },
    )
  }

  setDefaultAccount(account: string) {
    this.vbtc.options.from = account
    this.strudel.options.from = account
    this.gStrudel.options.from = account
    this.masterChef.options.from = account
  }
}
