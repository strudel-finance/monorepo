import React, { createContext, useEffect, useState } from 'react'
import useETH from '../../hooks/useETH'
import { AbiItem } from 'web3-utils'
import { contractAddresses } from '../../tokens/lib/constants'
import { VbtcContract } from '../../tokens/lib/contracts.types'
import vbtcAbi from '../../tokens/lib/abi/vbtc.json'
import RelayAbi from '../../tokens/lib/abi/relayBCH.json'
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
      const Contract1 = require('web3-eth-contract')
      Contract1.setProvider(eth.provider)

      const bridgeLib = new Contract1(
        vbtcAbi as AbiItem[],
        contractAddresses.bridge[XDAI_NETWORK_ID],
      )

      const Contract2 = require('web3-eth-contract')
      Contract2.setProvider(eth.provider)
      const relayerLib = new Contract2(
        RelayAbi as AbiItem[],
        contractAddresses.bridge[XDAI_NETWORK_ID],
      )

      setBridge({ bridge: bridgeLib, relayer: relayerLib })
    } else setBridge(undefined)
  }, [eth])

  return <Context.Provider value={{ bridge }}>{children}</Context.Provider>
}

export default BridgeProvider
