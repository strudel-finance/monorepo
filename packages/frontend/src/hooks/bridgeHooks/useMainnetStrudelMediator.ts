import { useEffect, useState } from 'react'
import { contractAddresses } from '../../tokens/lib/constants'
import abi from '../../tokens/lib/abi/strudelMediator.json'
import useETH from '../useETH'
import showError, { handleErrors } from '../../utils/showError'
const Contract = require('web3-eth-contract')
const BSC_NETWORK_ID = 56
const ETH_MAINNET = 1

const useMainnetStrudelMediator = () => {
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
        ; (Contract as any).setProvider(provider)
        const MainnetStrudelMediator = new Contract(
          abi,
          contractAddresses.strudelMediator[networkId],
        )

        setContract(MainnetStrudelMediator)
      }
    }
  }, [provider])

  return contract
}

export default useMainnetStrudelMediator
