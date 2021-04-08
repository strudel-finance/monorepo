import { useCallback, useContext, useEffect, useState } from 'react'
import { InjectedConnector } from '@web3-react/injected-connector'
import { useWeb3React } from '@web3-react/core'
import { ConnectorUpdate } from '@web3-react/types'

export const injected = new InjectedConnector({
  supportedChainIds: [1, 5],
})

export const getEth = async (activate: 'active' | 'inactive'): Promise<ConnectorUpdate<
  string | number
  > | null | void> => {
  const isAuthorized = await injected.isAuthorized()
  if (isAuthorized) return activate === 'active' ? await injected.activate() : injected.deactivate()
  return null
}
