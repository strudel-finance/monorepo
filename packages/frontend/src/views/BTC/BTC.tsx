import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'

import StrudelIcon from '../../components/StrudelIcon'
import AstroWave from '../../assets/img/astroWave.png'
import ThumbsUp from '../../assets/img/thumbs_up_astronaut.png'

import Button from '../../components/Button'
import Page from '../../components/Page'

import PageHeader from '../../components/PageHeader'
import WalletProviderModal from '../../components/WalletProviderModal'

import useModal from '../../hooks/useModal'

import Farm from '../Farm'
import styled from 'styled-components'
import { Grid, withStyles } from '@material-ui/core'
import MuiContainer from '@material-ui/core/Container'
import { TerraFarm } from '../../components/Lottie'
import Spacer from '../../components/Spacer'
import MuiPaper from '@material-ui/core/Paper'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import { formatAddress } from '../../utils'
import BurnModal from '../Home/components/BurnModal'
import { Transaction } from '../../contexts/Transactions/types'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'

const Container = withStyles({
  root: {
    margin: 'auto',
    textAlign: 'center',
  },
})(MuiContainer)

const BTC: React.FC = () => {
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState(undefined)

  const [isCountComplete, setCountComplete] = useState(false)

  const wallet = useWallet()
  const account = wallet.account

  useEffect(() => {
    console.log(wallet, 'efff BTC')

    //const seenDisclaimer = true
    if (!account) onPresentWalletProviderModal()
  }, [])

  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

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
      {account && wallet.status === 'connected' && (
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
                wallet={wallet}
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
