import { useEffect, useState } from 'react'
// import debounce from 'debounce'
import { contractAddresses } from '../../tokens/lib/constants'
import foreignAMB from '../../tokens/lib/abi/foreignAMB.json'
const Contract = require('web3-eth-contract')

const useETHAMB = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ; (Contract as any).setProvider(process.env.REACT_APP_MAINNET_PROVIDER)

    const ETHAMBContract = new Contract(
      foreignAMB,
      contractAddresses.edgeAmb[1],
    )

    setContract(ETHAMBContract)
  }, [])

  return contract
}

export default useETHAMB
