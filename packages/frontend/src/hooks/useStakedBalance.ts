import {useCallback, useEffect, useState} from 'react'

import BigNumber from 'bignumber.js'
import {useWallet} from 'use-wallet'

import {getStaked, getMasterChefContract} from '../vbtc/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const {account}: {account: string} = useWallet()
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
