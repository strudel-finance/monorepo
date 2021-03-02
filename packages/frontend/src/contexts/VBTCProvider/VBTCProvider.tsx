import React, {createContext, useEffect, useState} from 'react'

import {useWallet} from 'use-wallet'

import {Vbtc} from '../../vbtc'

export interface VBTCContext {
  vbtc?: typeof Vbtc
}

export const Context = createContext<VBTCContext>({
  vbtc: undefined,
})

declare global {
  interface Window {
    vbtcsauce: any
  }
}

const VBTCProvider: React.FC = ({children}) => {
  const {ethereum}: {ethereum: any} = useWallet()
  const [vbtc, setVbtc] = useState<any>()

  // @ts-ignore
  window.vbtc = vbtc
  // @ts-ignore
  window.eth = ethereum
  useEffect(() => {
    if (ethereum) {
      const chainId = Number(ethereum.chainId)
      const vbtcLib = new Vbtc(ethereum, chainId, false, {
        defaultAccount: ethereum.selectedAddress,
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
    }
  }, [ethereum])

  return <Context.Provider value={{vbtc}}>{children}</Context.Provider>
}

export default VBTCProvider
