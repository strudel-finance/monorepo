import React, { createContext, useEffect, useState } from 'react'
import { contractAddresses } from '../../tokens/lib/constants'
import { StrudelContract, VbtcContract } from '../../tokens/lib/contracts.types'
const Contract = require('web3-eth-contract')
const ERC20Abi = require('../../tokens/lib/abi/erc20.json')
const ETH_MAINNET = 1

export interface InfuraProvider {
  vBTC: VbtcContract
  trdl: StrudelContract
  vBCH: any
}

export const Context = createContext<InfuraProvider>({
  vBTC: undefined,
  trdl: undefined,
  vBCH: undefined,
})

declare global {
  interface Window {
    infura: any
  }
}

const InfuraProvider: React.FC = ({ children }) => {
  const [infura, setInfura] = useState<any>()
  // const { eth } = useInfura()

  // @ts-ignore
  window.infura = infura

  useEffect(() => {
    ;(Contract as any).setProvider(process.env.REACT_APP_MAINNET_PROVIDER)

    const contract = {
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
    }

    setInfura(contract)
  }, [])

  return <Context.Provider value={infura}>{children}</Context.Provider>
}

export default InfuraProvider
