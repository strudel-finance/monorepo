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
import BidProgressBar from './components/BidProgress/BidProgressBar'
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

  const client = new ApolloClient({
    uri:
      'https://api.thegraph.com/subgraphs/name/strudel-finance/auction-relay',
    cache: new InMemoryCache(),
  })

  const [currentBlock, setCurrentBlock] = useState(0)
  const [startBlock, setStartBlock] = useState(0)

  const SLOT_LENGTH = 144
  const getNextStart = (startBlock: number) => {
    const nextStartBlock =
      startBlock + (SLOT_LENGTH - (startBlock % SLOT_LENGTH))
    setStartBlock(nextStartBlock)
  }

  const blockHeight = () => {
    fetch('https://sochain.com/api/v2/get_info/BTC')
      .then(handleErrors)
      .then((response) => response.json())
      .then(({ data }) => {
        // data.blocks = current block
        setCurrentBlock(data.blocks)
        getNextStart(data.blocks)
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

  return (
    <Page>
      {!!account ? (
        <ApolloProvider client={client}>
          <BidProgressBar currentBlock={currentBlock} />
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
