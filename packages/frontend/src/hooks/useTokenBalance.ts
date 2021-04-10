import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { getBalance } from '../utils/erc20'
import useBlock from './useBlock'
import useETH from './useETH'

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { eth } = useETH()
  const account = eth?.account
  const provider = eth?.provider

  const block = useBlock()

  const fetchBalance = useCallback(async () => {
    const balance = await getBalance(provider, tokenAddress, account)
    setBalance(new BigNumber(balance))
  }, [account, provider, tokenAddress])

  useEffect(() => {
    if (account && provider) {
      fetchBalance()
    }
  }, [account, provider, setBalance, block, tokenAddress])

  return balance
}

export default useTokenBalance
