import { useEffect, useState } from 'react'
// import debounce from 'debounce'
import { contractAddresses } from '../tokens/lib/constants'
import homeAMB from '../tokens/lib/abi/homeAMB.json'
const Contract = require('web3-eth-contract')
const XDAI_NETWORK_ID = 100

const useBSCMediator = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_XDAI_PROVIDER_SOCKET)

    const ETHMediatorContract = new Contract(
      homeAMB,
      contractAddresses.mediator[XDAI_NETWORK_ID],
    )

    setContract(ETHMediatorContract)
  }, [])

  return contract
}

export default useBSCMediator
