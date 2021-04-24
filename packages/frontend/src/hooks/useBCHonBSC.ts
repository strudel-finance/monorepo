import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import useETH from './useETH'
// import debounce from 'debounce'
import { contractAddresses } from '../tokens/lib/constants'
import ERC20Abi from '../tokens/lib/abi/erc20.json'
const Contract = require('web3-eth-contract')
const BSC_NETWORK_ID = 56

const useVBCHonBSC = () => {
  const [contract, setContract] = useState<any>()

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_BSC_PROVIDER)

    const vBCHcontract = new Contract(
      // add ABI item as type
      ERC20Abi as any[],
      contractAddresses.vbch[BSC_NETWORK_ID],
    )

    setContract(vBCHcontract)
  }, [])

  return contract
}

export default useVBCHonBSC
