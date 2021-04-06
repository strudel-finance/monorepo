import {useCallback} from 'react'

import useVBTC from './useVBTC'
import {useWallet} from 'use-wallet'

import { harvest, getMasterChefContract } from '../bridgeTokens/utils'

const useReward = (pid: number) => {
  const {account} = useWallet()
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)

  const handleReward = useCallback(async () => {
    const txHash = await harvest(masterChefContract, pid, account)
    return txHash
  }, [account, pid, vbtc])

  return {onReward: handleReward}
}

export default useReward
