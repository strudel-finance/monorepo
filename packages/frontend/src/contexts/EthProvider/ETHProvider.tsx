import React, { createContext, Dispatch, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { getEth } from '../../utils/getEth'

export interface ETHProvider {
  eth?: { account: string; provider: any }
  setUpdate: Dispatch<any>
}

export const Context = createContext<ETHProvider>({
  eth: undefined,
  setUpdate: () => {},
})

const ETHProvider: React.FC = ({ children }) => {
  const [eth, setEth] = useState<any>()
  const [update, setUpdate] = useState<boolean>(true)

  // console.log(ethereum, '\n', account, '\n', provider, 'duce duce');

  // @ts-ignore
  window.eth = ethereum

  useEffect(() => {
    setUpdate(false)
    getEth().then((eth) => {
      if (eth) {
        setEth(eth)
      }
    })
  }, [update])

  return (
    <Context.Provider value={{ eth, setUpdate }}>{children}</Context.Provider>
  )
}

export default ETHProvider
