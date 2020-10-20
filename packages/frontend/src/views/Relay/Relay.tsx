import React, { useEffect } from 'react'
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

const Relay: React.FC = () => {
  const { account } = useWallet()
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

  const vbtc = useVBTC()
  const { ethereum } = useWallet()

  return (
    <Page>
      {!!account ? (
        <>
          <div>
            <BidButton startBlock={653472} />
            <WithdrawButton />
          </div>
        </>
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
