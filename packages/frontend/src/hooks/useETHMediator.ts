import { useEffect, useState } from 'react'
// import debounce from 'debounce'
import { contractAddresses } from '../tokens/lib/constants'
import mediator from '../tokens/lib/abi/mediator.json'
const Contract = require('web3-eth-contract')
const ETH_MAINNET = 1

const useBSCMediator = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_MAINNET_PROVIDER)

    const ETHMediatorContract = new Contract(
      mediator,
      contractAddresses.mediator[ETH_MAINNET],
    )

    setContract(ETHMediatorContract)
  }, [])

  return contract
}

export default useBSCMediator
