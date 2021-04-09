import React, { createContext, Dispatch, useEffect, useState } from 'react'
import { getEth } from '../../utils/getEth'
import { ConnectorUpdate } from '@web3-react/types'

export interface ETHProvider {
  eth?: ConnectorUpdate<string | number>
  setStatus: Dispatch<'active' | 'inactive'>
  setAccount: Dispatch<string>
}

export const Context = createContext<ETHProvider>({
  eth: undefined,
  setStatus: () => {},
  setAccount: () => {},
})

const ETHProvider: React.FC = ({ children }) => {
  const [eth, setEth] = useState<ConnectorUpdate<string | number> | null>()
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [account, setAccount] = useState<string>()

  useEffect(() => {
    getEth(status).then((eth) => {
      if (eth && status === 'active') {
        setEth(eth)
      } else setEth(null)
    })
  }, [status, account])

  return (
    <Context.Provider value={{ eth, setStatus, setAccount }}>
      {children}
    </Context.Provider>
  )
}

export default ETHProvider
