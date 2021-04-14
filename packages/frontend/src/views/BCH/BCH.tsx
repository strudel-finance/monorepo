import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { BCHTransaction } from '../../types/types'
import BCHTransactionsTableContainer from './components/BCHTransactionTable'
import useETH from '../../hooks/useETH'
import Button from '../../components/Button'
import Page from '../../components/Page'
import WalletProviderModal from '../../components/WalletProviderModal'
import { CenteringDiv } from '../BTC/BTC'

const Container = withStyles({
  root: {
    margin: 'auto',
    textAlign: 'center',
  },
})(MuiContainer)

const BCH: React.FC = () => {
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState<BCHTransaction>(undefined)

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

  const handleSetLastRequest = (tx: BCHTransaction) => {
    setLastRequest(tx)
  }

  const handleLastRequestChange = (tx: BCHTransaction) => {
    setLastRequest(tx)
    window.localStorage.setItem(account, JSON.stringify(tx))
  }
  const [onPresentBurn, onDismiss] = useModal(
    <BurnModal
      onAddition={handleLastRequestChange}
      value={val}
      address={account}
      onConfirm={() => {}}
      coin="bitcoincash"
    />,
  )

  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    'provider',
  )

  const handleAmountChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  return (
    <>
      {account ? (
        <>
          <PageHeader
            title="Enter the Strudel"
            subtitle="Turn your BCH into vBCH, and earn $TRDL rewards."
          />
          <div className="custom-container bch">
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
                    symbol="BCH"
                  />
                  <Button
                    disabled={!Number(val)}
                    className="glow-btn green"
                    text="Get vBCH"
                    onClick={onPresentBurn}
                  />
                </Container>
                <Spacer size="md" />

                <StyledInfo className="styled-info">
                  <span>Degen Tip</span>: Strudel only spins in one direction!
                </StyledInfo>
              </Grid>
              <Grid item xs={12} sm={12} md={7} className="main-table-grid">
                <BCHTransactionsTableContainer
                  account={account}
                  previousAccount={previousAccount}
                  lastRequest={lastRequest}
                  handleSetLastRequest={handleSetLastRequest}
                  checkAndRemoveLastRequest={checkAndRemoveLastRequest}
                  wallet={eth}
                  closeModal={onDismiss}
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

export default BCH
