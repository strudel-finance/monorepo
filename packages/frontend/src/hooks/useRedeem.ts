import { useCallback } from 'react'
import { MasterChefContract } from '../bridgeTokens/lib/contracts.types'
import { redeem } from '../bridgeTokens/utils'
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
