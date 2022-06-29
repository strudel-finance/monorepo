import React, { createContext, useEffect, useState } from 'react'
import { Vbtc } from '../../tokens/index'
import useETH from '../../hooks/useETH'

export interface VBTCProvider {
  vbtc?: Vbtc
}

export const Context = createContext<VBTCProvider>({
  vbtc: undefined,
})

declare global {
  interface Window {
    vbtcsauce: any
  }
}

const VBTCProvider: React.FC = ({ children }) => {
  const [vbtc, setVbtc] = useState<any>()
  const { eth } = useETH()

  // @ts-ignore
  window.vbtc = vbtc

  useEffect(() => {
    if (eth) {
      const chainId = Number(eth.provider.chainId) // networkId

      const vbtcLib = new Vbtc(eth.provider, chainId, false, {
        defaultAccount: eth.provider.selectedAddress,
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      })
      setVbtc(vbtcLib)

      window.vbtcsauce = vbtcLib
    } else setVbtc(undefined)
  }, [eth])

  return <Context.Provider value={{ vbtc }}>{children}</Context.Provider>
}

export default VBTCProvider
