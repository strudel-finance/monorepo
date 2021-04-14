import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { getStaked, getMasterChefContract } from '../tokens/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'
import useETH from './useETH'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { eth } = useETH()
  const account = eth?.account
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(masterChefContract, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, pid, vbtc])

  useEffect(() => {
    if (account && vbtc) {
      fetchBalance()
    }
  }, [account, pid, setBalance, block, vbtc])

  return balance
}

export default useStakedBalance
