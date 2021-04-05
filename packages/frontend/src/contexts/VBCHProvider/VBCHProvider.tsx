import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Vbch } from '../../bridgeTokens/Vbch'
import useETH from '../../hooks/useETH'
import { getEth } from '../../utils/getEth'

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
  // const { ethereum }: { ethereum: any } = useWallet()
  const [vbch, setVbch] = useState<any>()

  const [provider, setProvider] = useState<any>()
  const { eth } = useETH()
  
  // @ts-ignore
  window.vbch = vbch
  // @ts-ignore
  window.eth = provider
  useEffect(() => {
    // getEth().then((eth) => {
    //   if (eth) {
    //     setProvider(eth.provider)
    //   }
    // })
    
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
      }
  }, [eth])

  return <Context.Provider value={{ vbch }}>{children}</Context.Provider>
}

export default VBCHProvider
