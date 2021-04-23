import React, { useCallback, useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import WalletProviderModal from '../../components/WalletProviderModal'
import { icons } from '../../helpers/icon'
import useETH from '../../hooks/useETH'
import useModal from '../../hooks/useModal'
import { ReddishTextTypography } from '../BCH/components/BCHTransactionTable'
import Lock from './components/Lock'
import Unlock from './components/Unlock'

const Governance: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    'provider',
  )

  return (
    <>
      {account ? (
        <Page>
          <PageHeader
            className="page-header"
            title="Enter the Strudel"
            subtitle="Turn your BTC into vBTC or BCH into vBCH, and earn $TRDL rewards."
          />
          <StyledWrapper>
            <Button
              className="glow-btn orange"
              text="Discuss governance proposals"
              href="https://gov.strudel.finance/"
              size="xl"
            />
            <Spacer />
            <Button
              className="glow-btn orange"
              text="Vote in governance with g$TRDL"
              href="https://snapshot.org/#/strudel.eth"
              size="xl"
            />
          </StyledWrapper>
          <Spacer size="lg" />
          <Lock />
          <Spacer size="lg" />
          <div>
            <Button
              size="xl"
              href="https://studio.dutchswap.com/auctions"
              text="Get g$TRDL on Peg Auctions"
            ></Button>
          </div>
          <Spacer size="lg" />
          <Unlock />
        </Page>
      ) : (
        <Page>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Button
              boxShadowGlow={true}
              onClick={onPresentWalletProviderModal}
              text="Unlock Wallet"
            />
          </div>
        </Page>
      )}
    </>
  )
}

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 900px) {
    width: 100%;
    flex-flow: column nowrap;
  }
`

export default Governance
