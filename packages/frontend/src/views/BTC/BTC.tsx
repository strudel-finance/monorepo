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
import { Transaction } from '../../types/types'

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

  const handleSetLastRequest = (tx: Transaction) => {
    setLastRequest(tx)
  }

  const handleLastRequestChange = (tx: Transaction) => {
    setLastRequest(tx)
    window.localStorage.setItem(account, JSON.stringify(tx))
  }

  const [onPresentBurn] = useModal(
    <BurnModal
      onAddition={handleLastRequestChange}
      value={val}
      address={account}
      onConfirm={() => { }}
    />,
  )

  const handleAmountChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  return (
    // <Switch>
    <>
      <PageHeader
        title="Enter the Strudel"
        subtitle="Turn your BCH into vBTC, and earn $TRDL rewards."
      />
{/* <<<<<<< HEAD
      {account && (
        <Container fixed maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={4}>
======= */}
      {account && (
        <div className='custom-container btc'>
          <Grid container spacing={2} className='txt-grid'>
            <Grid item xs={12} sm={12} md={4} className='main-box-grid'>
{/* >>>>>>> feature/bch-styling */}
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
                <Button className='glow-btn orange' text='Buy now vBTC' onClick={onPresentBurn} />
              </Container>
              <Spacer size="md" />

              <StyledInfo className='styled-info'>
                <span>Degen Tip</span>: Strudel only spins in one direction!
              </StyledInfo>
            </Grid>
            <Grid item xs={12} sm={12} md={7} className='main-table-grid'>
              <TransactionsTableContainer
                account={account}
                previousAccount={previousAccount}
                lastRequest={lastRequest}
                handleSetLastRequest={handleSetLastRequest}
                checkAndRemoveLastRequest={checkAndRemoveLastRequest}
                wallet={eth}
              />
            </Grid>
          </Grid>
        </div>
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

export default BTC
