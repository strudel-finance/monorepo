import {useCallback} from 'react'

import useVBTC from './useVBTC'
import {useWallet} from 'use-wallet'

import { unstake, getMasterChefContract } from '../bridgeTokens/utils'

const useUnstake = (pid: number) => {
  const {account} = useWallet()
  const vbtc = useVBTC()
  const masterChefContract = getMasterChefContract(vbtc)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(masterChefContract, pid, amount, account)
      console.log(txHash)
    },
    [account, pid, vbtc],
  )

  return {onUnstake: handleUnstake}
}

export default useUnstake
