import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import useModal from '../../hooks/useModal'
import styled from 'styled-components'
import { Grid, withStyles } from '@material-ui/core'
import MuiContainer from '@material-ui/core/Container'
import Spacer from '../../components/Spacer'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import { formatAddress } from '../../utils'
import BurnModal from '../Home/components/BurnModal'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'
import useETH from '../../hooks/useETH'
import { BTCTransaction } from '../../types/types'
import WalletProviderModal from '../../components/WalletProviderModal'
import Page from '../../components/Page'

const Container = withStyles({
  root: {
    margin: 'auto',
    textAlign: 'center',
  },
})(MuiContainer)

const BTC: React.FC = () => {
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState(undefined)

  const { eth } = useETH()
  const account = eth?.account

  const usePrevious = (value: any) => {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }

  const checkAndRemoveLastRequest = () => {
    if (lastRequest !== undefined) {
      window.localStorage.removeItem(account)
      setLastRequest(undefined)
    }
  }

  const previousAccount = usePrevious(account)

  const handleSetLastRequest = (tx: BTCTransaction) => {
    setLastRequest(tx)
  }

  const handleLastRequestChange = (tx: BTCTransaction) => {
    setLastRequest(tx)
    window.localStorage.setItem(account, JSON.stringify(tx))
  }

  const [onPresentBurn, onDismiss] = useModal(
    <BurnModal
      onAddition={handleLastRequestChange}
      value={val}
      address={account}
      onConfirm={() => {}}
      coin="bitcoin"
    />,
  )

  const handleAmountChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    'provider',
  )

  const networkId = Number((window as any).ethereum?.networkVersion);

  let onWhichBlockchain;
  if (networkId === 1) { // ETH
    // onWhichBlockchain = "on ETH"
    onWhichBlockchain = "on Ethereum"
  }
  else if (networkId === 56) { // BSC
    // onWhichBlockchain = "on Binance Smart Chain"
    onWhichBlockchain = "on BSC"

  }
  else if (networkId === 1666600000) { // Harmony
    // onWhichBlockchain = "on Harmony Mainnet"
    onWhichBlockchain = "on Harmony"
  } else {
    onWhichBlockchain = "";
  }


  return (
    <>
      {account ? (
        <>
          <PageHeader
            // title="Enter the Strudel"
            title={`Enter the Strudel ${onWhichBlockchain}`}
            subtitle="Turn your BTC into vBTC, and earn $TRDL rewards."
          />
          <div className="custom-container btc">
            <Grid container spacing={2} className="txt-grid">
              <Grid item xs={12} sm={12} md={4} className="main-box-grid">
                <Container>
                  <AddressInput
                    address={formatAddress(account)}
                    value={formatAddress(account)}
                  />
                  <BurnAmountInput
                    onChange={handleAmountChange}
                    value={val}
                    symbol="BTC"
                  />
                  <Button
                    disabled={!Number(val)}
                    className="glow-btn orange"
                    text="Get vBTC"
                    onClick={onPresentBurn}
                  />
                </Container>
                <Spacer size="md" />

                <StyledInfo className="styled-info">
                  <span>Degen Tip</span>: Strudel only spins in one direction!
                </StyledInfo>
              </Grid>
              <Spacer size="lg" />
              <Grid item xs={12} sm={12} md={7} className="main-table-grid">
                <TransactionsTableContainer
                  account={account}
                  previousAccount={previousAccount}
                  lastRequest={lastRequest} // this is what matters
                  handleSetLastRequest={handleSetLastRequest}
                  checkAndRemoveLastRequest={checkAndRemoveLastRequest}
                  closeModal={onDismiss}
                  wallet={eth}
                />
              </Grid>
            </Grid>
          </div>
          <Spacer size="lg" />
          <CenteringDiv>
            <Button text="See Terra Farms" to="/farms" size="xl" />
          </CenteringDiv>
          <Spacer size="lg" />
        </>
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

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[500]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;

  > b {
    color: ${(props) => props.theme.color.grey[600]};
  }
`

// !!! TODO: create styled component that will replace all flex divs and place it in some top level component
export const CenteringDiv = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  text-align: center;
  justify-content: center;
`

export default BTC
