import React, { createContext, useEffect, useState } from 'react'
import useETH from '../../hooks/useETH'
import { AbiItem } from 'web3-utils'
import { contractAddresses } from '../../tokens/lib/constants'
import { VbtcContract } from '../../tokens/lib/contracts.types'
const Contract = require('web3-eth-contract')
const vbtcAbi = require('../../tokens/lib/abi/vbtc.json')
const XDAI_NETWORK_ID = 100
export interface VBTCProvider {
  bridge?: VbtcContract
}

export const Context = createContext<VBTCProvider>({
  bridge: undefined,
})

const BridgeProvider: React.FC = ({ children }) => {
  const [bridge, setBridge] = useState<any>()
  const { eth } = useETH()

  // @ts-ignore
  window.vbtc = bridge

  useEffect(() => {
    if (eth) {
      Contract.setProvider(eth.provider)

      const bridgeLib = new Contract(
        vbtcAbi as AbiItem[],
        contractAddresses.bridge[XDAI_NETWORK_ID],
      )
      setBridge(bridgeLib)
    } else setBridge(undefined)
  }, [eth])

  return <Context.Provider value={{ bridge }}>{children}</Context.Provider>
}

export default BridgeProvider
