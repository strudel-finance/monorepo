import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'

import {
  getMasterChefContract,
  getWethContract,
  getVbtcContract,
  getFarms,
  getTotalLPWethValue,
} from '../bridgeTokens/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'
import { ERC20Contract, UniContract } from '../bridgeTokens/lib/contracts.types'

export interface StakedValue {
  tokenAmount: BigNumber
  wethAmount: BigNumber
  totalWethValue: BigNumber
  tokenPriceInWeth: BigNumber
  poolWeight: BigNumber
  multiplier: BigNumber
}

const useAllStakedValue = () => {
  const [balances, setBalance] = useState([] as Array<StakedValue>)
  const { account }: { account: string; ethereum: provider } = useWallet()
  const vbtc = useVBTC()
  const farms = getFarms(vbtc)
  const masterChefContract = getMasterChefContract(vbtc)
  const wethContact = getWethContract(vbtc)
  const vbtcContract = getVbtcContract(vbtc)
  const block = useBlock()

  const fetchAllStakedValue = useCallback(async () => {
    console.log(farms, 'farms farms farms');
    
    const balances: Array<StakedValue> = await Promise.all(
      farms.map(
        ({
          isBalancer,
          pid,
          lpContract,
          tokenContract,
          // !!! TODO: check removed variable !!!
          // multiplier,
        }: {
                            //       pid: number;
                            // isBalancer: boolean;
                            // url: string;
                            // id: string;
                            // name: string;
                            // lpToken: string;
                            // tokenSymbol: string;
                            // earnToken: string;
                            // earnTokenAddress: string;
                            //         icon: string
                            ///
          isBalancer: boolean
          pid: number
          lpContract: ERC20Contract | UniContract
          tokenContract: ERC20Contract
          // balancerPoolContract: Contract
          // multiplier: number
        }) =>
          getTotalLPWethValue(
            isBalancer,
            pid,
            wethContact,
            lpContract,
            tokenContract,
            masterChefContract,
            vbtcContract,
            vbtc,
            block,
          ),
      ),
    )
    setBalance(balances)
  }, [account, masterChefContract, vbtc])

  useEffect(() => {
    if (account && masterChefContract && vbtc) {
      fetchAllStakedValue()
    }
  }, [account, block, masterChefContract, setBalance, vbtc])

  return balances
}

export default useAllStakedValue
