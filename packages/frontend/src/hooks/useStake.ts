import {useCallback} from 'react'

import useVBTC from './useVBTC'
import { stake, getMasterChefContract } from '../bridgeTokens/utils'
import useETH from './useETH'

const useStake = (pid: number) => {
  const { eth } = useETH()
  const account = eth?.account
  const vbtc = useVBTC()

  const handleStake = useCallback(
    async (amount: string) => {
      const txHash = await stake(
        getMasterChefContract(vbtc),
        pid,
        amount,
        account,
      )
    },
    [account, pid, vbtc],
  )

  return {onStake: handleStake}
}

export default useStake
