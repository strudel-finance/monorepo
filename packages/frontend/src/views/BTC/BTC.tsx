import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'

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
import { Transaction } from '../../contexts/Transactions/types'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'
import useETH from '../../hooks/useETH'

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

  const [onPresentBurn] = useModal(
    <BurnModal
      // onAddition={handleLastRequestChange}
      value={val}
      address={account}
      onConfirm={() => {}}
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
      {account && (
        <Container fixed maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={4}>
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
                <Button text={'Get vBTC'} onClick={onPresentBurn} />
              </Container>
              <Spacer size="md" />

              <StyledInfo>
                ☝️︎ <b>Degen Tip</b>: Strudel only spins in one direction!
              </StyledInfo>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
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
        </Container>
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
