import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Vbch } from '../../bridgeTokens/Vbch'

export interface VBCHContext {
  vbch?: typeof Vbch
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
  const { ethereum }: { ethereum: any } = useWallet()
  const [vbch, setVbch] = useState<any>()

  // @ts-ignore
  window.vbch = vbch
  // @ts-ignore
  window.eth = ethereum
  useEffect(() => {
    if (ethereum) {
      const chainId = Number(ethereum.chainId)
      const vbchLib = new Vbch(ethereum, chainId, false, {
        defaultAccount: ethereum.selectedAddress,
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        testing: false,
        defaultGas: '6000000',
        defaultGasPrice: '1000000000000',
        accounts: [],
        ethereumNodeTimeout: 10000,
      })

      console.log(vbchLib, 'vbchLib vbchLib vbchLib')

      setVbch(vbchLib)
      window.vbchsauce = vbchLib
    }
  }, [ethereum])

  return <Context.Provider value={{ vbch }}>{children}</Context.Provider>
}

export default VBCHProvider
