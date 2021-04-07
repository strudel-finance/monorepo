import React, { createContext, Dispatch, useEffect, useState } from 'react'
import { getEth } from '../../utils/getEth'
import { ConnectorUpdate } from '@web3-react/types'

export interface ETHProvider {
  eth?: ConnectorUpdate<string | number>
  setUpdate: Dispatch<any>
}

export const Context = createContext<ETHProvider>({
  eth: undefined,
  setUpdate: () => {},
})

const ETHProvider: React.FC = ({ children }) => {
  const [eth, setEth] = useState<ConnectorUpdate<string | number> | null>()
  const [update, setUpdate] = useState<boolean>(true)

  useEffect(() => {
    setUpdate(false)
    getEth().then((eth) => {
      if (eth) setEth(eth)
      else setEth(null)
    })
  }, [update])

  return (
    <Context.Provider value={{ eth, setUpdate }}>{children}</Context.Provider>
  )
}

export default ETHProvider
