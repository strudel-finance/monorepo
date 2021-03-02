import { useCallback, useEffect, useState } from 'react'
import { provider } from 'web3-core'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import { getEarned, getMasterChefContract } from '../vbtc/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'

const useEarnings = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)
  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(masterChefContract, pid, account)
    setBalance(new BigNumber(balance))
  }, [account, masterChefContract, vbtc])

  useEffect(() => {
    if (account && masterChefContract && vbtc) {
      fetchBalance()
    }
  }, [account, block, masterChefContract, setBalance, vbtc])

  return balance
}

export default useEarnings
