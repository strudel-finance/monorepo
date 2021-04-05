import {useCallback} from 'react'
import {useWallet} from 'use-wallet'
import {Contract} from 'web3-eth-contract'
import { MasterChefContract } from '../bridgeTokens/lib/contracts.types'
import { redeem } from '../bridgeTokens/utils'

const useRedeem = (masterChefContract: MasterChefContract) => {
  const { account } = useWallet()

  const handleRedeem = useCallback(async () => {
    const txHash = await redeem(masterChefContract, account)
    console.log(txHash)
    return txHash
  }, [account, masterChefContract])

  return { onRedeem: handleRedeem }
}

export default useRedeem
