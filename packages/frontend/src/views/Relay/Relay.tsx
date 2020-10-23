import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import Page from '../../components/Page'
import Button from '../../components/Button'
import WalletProviderModal from '../../components/WalletProviderModal'

import useModal from '../../hooks/useModal'

import useVBTC from '../../hooks/useVBTC'

import BidButton from './components/BidButton'
import WithdrawButton from './components/WithdrawButton'
import BidTable from './components/BidTable/BidTable'
import BidProgresBar from './components/BidProgress/BidProgressBar'
import showError, { handleErrors } from '../../utils/showError'
import RollbarErrorTracking from '../../errorTracking/rollbar'
import useInterval from '../../hooks/useInterval'
import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloProvider,
} from '@apollo/client'

const Relay: React.FC = () => {
  const { account } = useWallet()
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

  const vbtc = useVBTC()
  const { ethereum } = useWallet()

  const client = new ApolloClient({
    uri:
      'https://api.thegraph.com/subgraphs/name/strudel-finance/auction-relay',
    cache: new InMemoryCache(),
  })

  const [startBlock, setStartBlock] = useState(0)

  const blockHeight = () => {
    fetch('https://sochain.com/api/v2/get_info/BTC')
      .then(handleErrors)
      .then((response) => response.json())
      .then(({ data }) => {
        setStartBlock(data.blocks)
      })
      .catch((e) => {
        showError('SoChain API error: ' + e.message)
        RollbarErrorTracking.logErrorInRollbar(
          'SoChain confirmations: ' + e.message,
        )
        return undefined
      })
  }

  useEffect(blockHeight, [])
  useInterval(blockHeight, 5000)

  console.log('startBlock', startBlock)

  return (
    <Page>
      {!!account ? (
        <ApolloProvider client={client}>
          <BidProgresBar startBlock={startBlock} />
          <BidTable startBlock={startBlock} />
          <BidButton startBlock={startBlock} />
          <WithdrawButton />
        </ApolloProvider>
      ) : (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={onPresentWalletProviderModal}
            text="🔓 Unlock Wallet"
          />
        </div>
      )}
    </Page>
  )
}

export default Relay
