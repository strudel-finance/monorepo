import React, { createContext, useEffect, useState } from 'react'
import useETH from '../../hooks/useETH'
import { AbiItem } from 'web3-utils'
import { contractAddresses } from '../../tokens/lib/constants'
import { VbtcContract } from '../../tokens/lib/contracts.types'
import vbtcAbi from '../../tokens/lib/abi/vbtc.json'
import RelayAbi from '../../tokens/lib/abi/relayBCH.json'
import { Contract } from 'web3-eth-contract'

const XDAI_NETWORK_ID = 100

export interface BridgeProvider {
  contract: VbtcContract
  relayer: Contract
}

export const Context = createContext<BridgeProvider>({
  contract: undefined,
  relayer: undefined,
})

const BridgeProvider: React.FC = ({ children }) => {
  const [bridge, setBridge] = useState<BridgeProvider>()
  const { eth } = useETH()

  // @ts-ignore
  window.vbtc = bridge

  useEffect(() => {
    if (eth) {
      const Contract = require('web3-eth-contract')
      Contract.setProvider(eth.provider)
      const bridgeC = new Contract(
        vbtcAbi as AbiItem[],
        contractAddresses.bridge[XDAI_NETWORK_ID],
      )

      Contract.setProvider(process.env.REACT_APP_XDAI_PROVIDER)
      const relayerC = new Contract(
        RelayAbi as AbiItem[],
        contractAddresses.relay[XDAI_NETWORK_ID],
      )

      setBridge({ contract: bridgeC, relayer: relayerC })
    } else setBridge(undefined)
  }, [eth])

  return <Context.Provider value={bridge}>{children}</Context.Provider>
}

export default BridgeProvider
