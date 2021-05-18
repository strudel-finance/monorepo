import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import useETH from './useETH'
// import debounce from 'debounce'
import { contractAddresses } from '../tokens/lib/constants'
import StrudelTokenABI from '../tokens/lib/abi/StrudelToken.json'
const Contract = require('web3-eth-contract')
const BSC_NETWORK_ID = 56

const useStrudelOnBSC = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_BSC_PROVIDER)

    const strudelContract = new Contract(
      // add ABI item as type
      StrudelTokenABI as any[],
      contractAddresses.strudel[BSC_NETWORK_ID],
    )

    setContract(strudelContract)
  }, [])

  return contract
}

export default useStrudelOnBSC
