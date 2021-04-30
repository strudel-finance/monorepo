import { useEffect, useState } from 'react'
// import debounce from 'debounce'
import { contractAddresses } from '../../tokens/lib/constants'
import foreignAMB from '../../tokens/lib/abi/foreignAMB.json'
const Contract = require('web3-eth-contract')

const useBSCAMB = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ; (Contract as any).setProvider(process.env.REACT_APP_BSC_PROVIDER)

    const ETHBSCContract = new Contract(
      foreignAMB,
      contractAddresses.edgeAmb[56],
    )

    setContract(ETHBSCContract)
  }, [])

  return contract
}

export default useBSCAMB
