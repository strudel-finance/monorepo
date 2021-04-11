import React, { createContext, useEffect, useState } from 'react'
import { Vbtc } from '../../tokens/index'
import useETH from '../../hooks/useETH'
const XDAI_NETWORK_ID = 100

export interface VBTCProvider {
  bridge?: Vbtc
}

export const Context = createContext<VBTCProvider>({
  bridge: undefined,
})

const BridgeProvider: React.FC = ({ children }) => {
  const [bridge, setBridge] = useState<any>()
  const { eth } = useETH()

  // @ts-ignore
  window.vbtc = bridge

  useEffect(() => {
    if (eth) {
      const chainId = Number(eth.provider.chainId)
      const bridgeLib = new Vbtc(eth.provider, chainId, false, {
        defaultAccount: eth.provider.selectedAddress,
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      })
      setBridge(bridgeLib)
    } else setBridge(undefined)
  }, [eth])

  return <Context.Provider value={{ bridge }}>{children}</Context.Provider>
}

export default BridgeProvider
