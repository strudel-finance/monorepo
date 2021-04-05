import React, { createContext, useEffect, useState } from 'react'
import { setTimeout } from 'timers'
import { useWallet } from 'use-wallet'
import { Vbtc } from '../../bridgeTokens'
import useETH from '../../hooks/useETH'
import { getEth } from '../../utils/getEth'

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
  // const { ethereum }: { ethereum: any } = useWallet()
  const [vbtc, setVbtc] = useState<any>()
  // const [account, setAccount] = useState<any>()
  const [provider, setProvider] = useState<any>()
  
  const {eth} = useETH()
  // console.log(ethereum, '\n', account, '\n', provider, 'duce duce');
  
  
  // @ts-ignore
  window.vbtc = vbtc
  // @ts-ignore
  // window.eth = ethereum
  useEffect(() => {
    if (eth) {
      const chainId = Number(eth.provider.chainId)
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
    }
  }, [eth])

  return <Context.Provider value={{ vbtc }}>{children}</Context.Provider>
}

export default VBTCProvider
