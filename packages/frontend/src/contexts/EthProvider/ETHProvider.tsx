import React, { createContext, Dispatch, useEffect, useState } from 'react'
import { getEth } from '../../utils/getEth'
import { ConnectorUpdate } from '@web3-react/types'

export interface ETHProvider {
  eth?: ConnectorUpdate<string | number>
  setStatus: Dispatch<any>
}

export const Context = createContext<ETHProvider>({
  eth: undefined,
  setStatus: () => {},
})

const ETHProvider: React.FC = ({ children }) => {
  const [eth, setEth] = useState<ConnectorUpdate<string | number> | null>()
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  useEffect(() => {
    getEth(status).then((eth) => {
      if (eth && status === 'active') {
        setEth(eth)
      } else setEth(null)
    })
  }, [status])

  return (
    <Context.Provider value={{ eth, setStatus }}>{children}</Context.Provider>
  )
}

export default ETHProvider
