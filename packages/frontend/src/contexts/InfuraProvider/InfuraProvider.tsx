import React, { createContext, useEffect, useState } from 'react'
import { contractAddresses } from '../../tokens/lib/constants'
import { StrudelContract, VbtcContract } from '../../tokens/lib/contracts.types'
import ERC20Abi from '../../tokens/lib/abi/erc20.json'
import GStrudelAbi from '../../tokens/lib/abi/gStrudel.json'

const Contract = require('web3-eth-contract')

// This part only works with ETH currently
// @steadylearner
const ETH_MAINNET = 1
// const BSC_MAINNET = 56
// const HARMONY_MAINNET = 1666600000
// const NETWORKD_ID = (window as any).ethereum?.networkVersion;

export interface InfuraProvider {
  vBTC: VbtcContract
  trdl: StrudelContract
  gTrdl: StrudelContract
  vBCH: any
}

export const Context = createContext<InfuraProvider>({
  vBTC: undefined,
  trdl: undefined,
  vBCH: undefined,
  gTrdl: undefined,
})

declare global {
  interface Window {
    infura: any
  }
}

// Blockchain ID
const InfuraProvider: React.FC = ({ children }) => {
  const [infura, setInfura] = useState<InfuraProvider>()
  // const { eth } = useInfura()

  // @ts-ignore
  window.infura = infura

  // Find blockchain id here

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_MAINNET_PROVIDER)

    const contracts = {
      vBTC: new Contract(
        // add ABI item as type
        ERC20Abi as any[],
        contractAddresses.vbtc[ETH_MAINNET],
      ),
      vBCH: new Contract(
        // add ABI item as type
        ERC20Abi as any[],
        contractAddresses.vbch[ETH_MAINNET],
      ),
      trdl: new Contract(
        // add ABI item as type
        ERC20Abi as any[],
        contractAddresses.strudel[ETH_MAINNET],
      ),
      gTrdl: new Contract(
        // add ABI item as type
        GStrudelAbi as any[],
        contractAddresses.gStrudel[ETH_MAINNET],
      ),
    }

    setInfura(contracts)
  }, [])

  return <Context.Provider value={infura}>{children}</Context.Provider>
}

export default InfuraProvider
