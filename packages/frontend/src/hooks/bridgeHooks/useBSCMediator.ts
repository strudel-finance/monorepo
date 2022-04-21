import { useEffect, useState } from 'react'
import { contractAddresses } from '../../tokens/lib/constants'

import mediator from '../../tokens/lib/abi/mediator.json'
import useETH from '../useETH'
import showError  from '../../utils/showError'

const Contract = require('web3-eth-contract')
const BSC_NETWORK_ID = 56
const ETH_MAINNET = 1

const useBSCMediator = () => {
  const { eth } = useETH()
  const provider = eth?.provider
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    const networkId = Number(localStorage.getItem('networkId'))

    if (provider) {
      if (networkId != BSC_NETWORK_ID && networkId != ETH_MAINNET) {
        showError('Wrong network ID')
        console.error('Wrong network ID')
      } else {
        ;(Contract as any).setProvider(provider)
        const BSCMediatorContract = new Contract(
          mediator,
          contractAddresses.mediator[networkId],
        )

        setContract(BSCMediatorContract)
      }
    }
  }, [provider])

  return contract
}

export default useBSCMediator
