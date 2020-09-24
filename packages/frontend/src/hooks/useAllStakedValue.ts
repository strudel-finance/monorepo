import {useCallback, useEffect, useState} from 'react'
import {provider} from 'web3-core'

import BigNumber from 'bignumber.js'
import {useWallet} from 'use-wallet'
import {Contract} from 'web3-eth-contract'

import {
  getMasterChefContract,
  getWethContract,
  getFarms,
  getTotalLPWethValue,
} from '../vbtc/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'

export interface StakedValue {
  tokenAmount: BigNumber
  wethAmount: BigNumber
  totalWethValue: BigNumber
  tokenPriceInWeth: BigNumber
  poolWeight: BigNumber
}

const useAllStakedValue = () => {
  const [balances, setBalance] = useState([] as Array<StakedValue>)
  const {account}: {account: string; ethereum: provider} = useWallet()
  const vbtc = useVBTC()
  const farms = getFarms(vbtc)
  const masterChefContract = getMasterChefContract(vbtc)
  const wethContact = getWethContract(vbtc)
  const block = useBlock()

  const fetchAllStakedValue = useCallback(async () => {
    const balances: Array<StakedValue> = await Promise.all(
      farms.map(
        ({
          pid,
          lpContract,
          tokenContract,
        }: {
          pid: number
          lpContract: Contract
          tokenContract: Contract
        }) =>
          getTotalLPWethValue(
            masterChefContract,
            wethContact,
            lpContract,
            tokenContract,
            pid,
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
