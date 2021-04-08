import {useCallback, useEffect, useState} from 'react'

import BigNumber from 'bignumber.js'
import useVBTC from './useVBTC'
import {provider} from 'web3-core'
import {Contract} from 'web3-eth-contract'

import {getAllowance} from '../utils/erc20'
import { getMasterChefContract } from '../bridgeTokens/utils'
import useETH from './useETH'

const useAllowance = (lpContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { eth } = useETH()
  const account = eth?.account
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(
      lpContract,
      masterChefContract,
      account,
    )
    setAllowance(new BigNumber(allowance))
  }, [account, masterChefContract, lpContract])

  useEffect(() => {
    if (account && masterChefContract && lpContract) {
      fetchAllowance()
    }
    let refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, masterChefContract, lpContract])

  return allowance
}

export default useAllowance
