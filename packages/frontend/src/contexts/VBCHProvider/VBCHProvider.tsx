import React, { createContext, useEffect, useState } from 'react'
import { Vbch } from '../../bridgeTokens/Vbch'
import useETH from '../../hooks/useETH'

export interface VBCHContext {
  vbch?: Vbch
}

export const Context = createContext<VBCHContext>({
  vbch: undefined,
})

declare global {
  interface Window {
    vbchsauce: any
  }
}

const VBCHProvider: React.FC = ({ children }) => {
  const [vbch, setVbch] = useState<Vbch | undefined>()
  const { eth } = useETH()

  // @ts-ignore
  window.vbch = vbch
  useEffect(() => {
    if (eth) {
      const chainId = Number(eth.provider.chainId)
      const vbchLib = new Vbch(eth.provider, chainId, false, {
        defaultAccount: eth.provider.selectedAddress,
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      })

      setVbch(vbchLib)
      window.vbchsauce = vbchLib
    } else setVbch(undefined)
  }, [eth])

  return <Context.Provider value={{ vbch }}>{children}</Context.Provider>
}

export default VBCHProvider
