import { useEffect, useState } from 'react'
// import debounce from 'debounce'
import { contractAddresses } from '../../tokens/lib/constants'
import homeAMB from '../../tokens/lib/abi/homeAMB.json'
const Contract = require('web3-eth-contract')
const BSC_NETWORK_ID = 56

const useBSCtoXDAIamb = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_XDAI_PROVIDER)

    const XDAIAMBContract = new Contract(
      homeAMB,
      contractAddresses.AMB[BSC_NETWORK_ID],
    )

    setContract(XDAIAMBContract)
  }, [])

  return contract
}

export default useBSCtoXDAIamb
