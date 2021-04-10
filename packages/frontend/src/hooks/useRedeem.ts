import { useCallback } from 'react'
import { MasterChefContract } from '../tokens/lib/contracts.types'
import { redeem } from '../tokens/utils'
import useETH from './useETH'

const useRedeem = (masterChefContract: MasterChefContract) => {
  const { eth } = useETH()
  const account = eth?.account

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(masterChefContract, account)
    return txHash
  }, [account, masterChefContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
