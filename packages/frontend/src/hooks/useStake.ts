import {useCallback} from 'react'

import useVBTC from './useVBTC'
import {useWallet} from 'use-wallet'

import {stake, getMasterChefContract} from '../vbtc/utils'

const useStake = (pid: number) => {
  const {account} = useWallet()
  const vbtc = useVBTC()

  const handleStake = useCallback(
    async (amount: string) => {
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
