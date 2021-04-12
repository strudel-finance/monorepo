import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import {
  getMasterChefContract,
  getWethContract,
  getVbtcContract,
  getFarms,
  getTotalLPWethValue,
} from '../tokens/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'
import { ERC20Contract, UniContract } from '../tokens/lib/contracts.types'
import useETH from './useETH'

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
  const { eth } = useETH()
  const account = eth?.account
  const vbtc = useVBTC()
  const farms = getFarms(vbtc)
  const masterChefContract = getMasterChefContract(vbtc)
  const wethContact = getWethContract(vbtc)
  const vbtcContract = getVbtcContract(vbtc)
  const block = useBlock()

  const fetchAllStakedValue = useCallback(async () => {
    const balances: Array<StakedValue> = await Promise.all(
      farms.map(
        ({
          isBalancer,
          pid,
          lpContract,
          tokenContract,
        }: {
          isBalancer: boolean
          pid: number
          lpContract: any
          tokenContract: any
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
