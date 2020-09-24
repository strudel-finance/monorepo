import {useCallback, useEffect, useState} from 'react'
import {provider} from 'web3-core'

import BigNumber from 'bignumber.js'
import {useWallet} from 'use-wallet'

import {getEarned, getMasterChefContract, getFarms} from '../vbtc/utils'
import useVBTC from './useVBTC'
import useBlock from './useBlock'

const useAllEarnings = () => {
  const [balances, setBalance] = useState([] as Array<BigNumber>)
  const {account}: {account: string; ethereum: provider} = useWallet()
  const vbtc = useVBTC()
  const farms = getFarms(vbtc)
  const masterChefContract = getMasterChefContract(vbtc)
  const block = useBlock()

  const fetchAllBalances = useCallback(async () => {
    const balances: Array<BigNumber> = await Promise.all(
      farms.map(({pid}: {pid: number}) =>
        getEarned(masterChefContract, pid, account),
      ),
    )
    setBalance(balances)
  }, [account, masterChefContract, vbtc])

  useEffect(() => {
    if (account && masterChefContract && vbtc) {
      fetchAllBalances()
    }
  }, [account, block, masterChefContract, setBalance, vbtc])

  return balances
}

export default useAllEarnings
