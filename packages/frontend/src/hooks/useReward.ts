import {useCallback} from 'react'

import useVBTC from './useVBTC'
import { harvest, getMasterChefContract } from '../tokens/utils'
import useETH from './useETH'

const useReward = (pid: number) => {
  const { eth } = useETH()
  const account = eth?.account
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)

  const handleReward = useCallback(async () => {
    const txHash = await harvest(masterChefContract, pid, account)
    return txHash
  }, [account, pid, vbtc])

  return {onReward: handleReward}
}

export default useReward
