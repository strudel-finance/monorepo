import {useCallback} from 'react'

import useVBTC from './useVBTC'

import { unstake, getMasterChefContract } from '../bridgeTokens/utils'
import useETH from './useETH'

const useUnstake = (pid: number) => {
  const { eth } = useETH()
  const account = eth?.account
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)

  const handleUnstake = useCallback(
    async (amount: string) => {
      console.log(typeof amount, '!!! TODO: is that number !!!! 222')

      const txHash = await unstake(masterChefContract, pid, amount, account)
      console.log(txHash)
    },
    [account, pid, vbtc],
  )

  return {onUnstake: handleUnstake}
}

export default useUnstake
