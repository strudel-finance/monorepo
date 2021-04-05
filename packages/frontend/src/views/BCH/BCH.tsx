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
import { icons } from '../../helpers/icon'

const Container = withStyles({
  root: {
    margin: 'auto',
    textAlign: 'center',
  },
})(MuiContainer)

const BCH: React.FC = () => {
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState(undefined)

  const [isCountComplete, setCountComplete] = useState(false)

  const wallet = useWallet()
  const account = wallet.account

  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)
  useEffect(() => {
    console.log(wallet, 'efff BCH')

    //const seenDisclaimer = true
    if (!account) onPresentWalletProviderModal()
  }, [])

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
    <BurnModal value={val} address={account} onConfirm={() => { }} />,
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
        <div className='custom-container bch'>
          <Grid container spacing={2} className='txt-grid'>
            <Grid item xs={12} sm={12} md={4} className='main-box-grid'>
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
                <Button className='glow-btn green' text='Buy now vBCH' onClick={onPresentBurn} BCH={true} />
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
                wallet={wallet}
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

export default BCH
