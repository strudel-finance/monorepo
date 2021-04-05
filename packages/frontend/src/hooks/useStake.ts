import {useCallback} from 'react'

import useVBTC from './useVBTC'
import {useWallet} from 'use-wallet'

import { stake, getMasterChefContract } from '../bridgeTokens/utils'

const useStake = (pid: number) => {
  const {account} = useWallet()
  const vbtc = useVBTC()

  const handleStake = useCallback(
    async (amount: string) => {
      // !!! TODO: is that number !!!!
      console.log(typeof amount, '!!! TODO: is that number !!!! 111 ')

      const txHash = await stake(
        getMasterChefContract(vbtc),
        pid,
        amount,
        account,
      )
      console.log(txHash)
    },
    [account, pid, vbtc],
  )

  return {onStake: handleStake}
}

export default useStake
