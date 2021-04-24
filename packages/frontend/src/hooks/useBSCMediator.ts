import { useEffect, useState } from 'react'
import { contractAddresses } from '../tokens/lib/constants'
import mediator from '../tokens/lib/abi/mediator.json'
const Contract = require('web3-eth-contract')
const BSC_NETWORK_ID = 56

const useBSCMediator = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_BSC_PROVIDER)

    const BSCMediatorContract = new Contract(
      mediator,
      contractAddresses.mediator[BSC_NETWORK_ID],
    )

    setContract(BSCMediatorContract)
  }, [])

  return contract
}

export default useBSCMediator
