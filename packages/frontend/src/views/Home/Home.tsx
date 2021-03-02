import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import WalletProviderModal from '../../components/WalletProviderModal'
import Countdown from 'react-countdown'
import strudel from '../../assets/img/Strudel.png'
import Button from '../../components/Button'
//import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import { StyledCount, RenderProps } from '../../utils/countHelper'
import Grid from '@material-ui/core/Grid'
import Balances from './components/Balances'
import BalanceStrudel from './components/BalanceStrudel'
import Lottie, { MobileLottie } from '../../components/Lottie'
import formatAddress from '../../utils/formatAddress'
import useModal from '../../hooks/useModal'
import BurnModal from './components/BurnModal'
import Container from '@material-ui/core/Container'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'
import { StyledLink } from '../../components/Footer/components/Nav'
import { Transaction, LoadingStatus } from '../../types/types'

import { makeStyles, withStyles } from '@material-ui/core'
import { startDate } from '../../constants/countdown'
import AstroFlying from '../../assets/img/AstroFlying.png'

import useVBTC from '../../hooks/useVBTC'
const useStyles = makeStyles((theme) => ({
  container: {
    background: '#fff',
    border: '0.5px solid ' + theme.palette.divider,
    minHeight: 200,
    height: '100%',
  },
  titleWrapper: {
    paddingBottom: theme.spacing(2),
  },
  actionsCell: {
    minWidth: 150,
  },
  emptyMessage: {
    display: 'flex',
    paddingTop: theme.spacing(8),
    justifyContent: 'center',
    height: '100%',
  },
}))
const AstroGrid = withStyles({
  item: {
    lineHeight: 1,
    margin: 'auto',
    textAlign: 'center',
  },
})(Grid)
const MyStyledLink = styled(StyledLink)`
  display: none;
  @media (min-width: 600px) and (orientation: landscape) {
    display: block;
  }
  font-size: 50px;
`
const Home: React.FC = () => {
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState(undefined)

  const [isCountComplete, setCountComplete] = useState(false)

  const wallet = useWallet()
  const account = wallet.account
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

  const handleLastRequestChange = (tx: Transaction) => {
    setLastRequest(tx)
    window.localStorage.setItem(account, JSON.stringify(tx))
  }

  const handleSetLastRequest = (tx: Transaction) => {
    setLastRequest(tx)
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
  const handleCountEnd = () => {
    setCountComplete(true)
  }
  // icon={<img src={strudel} height={120} />}
  const renderer = ({ days, hours, minutes, seconds }: RenderProps) => {
    // Render a countdown
    return (
      <StyledCount>
        {days}d:{hours}h:{minutes}min:{seconds}s
      </StyledCount>
    )
  }
  const isPast = startDate < new Date()
  return (
    <Page>
      {isCountComplete || isPast ? (
        <>
          <PageHeader
            title="Enter the Strudel"
            subtitle="Turn your BTC into vBTC, and earn $TRDL rewards."
          />
          {account && wallet.status === 'connected' ? (
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
          ) : (
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button
                  borderButton={true}
                  onClick={onPresentWalletProviderModal}
                  text="Unlock Wallet"
                />
              </div>
            )}
          <>
            <Spacer size="lg" />

            <Grid container spacing={1}>
              <AstroGrid item lg={4} xs={1}>

              </AstroGrid>
              <AstroGrid item lg={4} xs={10}>
                <StyledP>
                  The Strudel is the first one-way, trustless bridge linking Bitcoin and Ethereum.
                  The bravest explorers that arrive on the other side will get extra $TRDL rewards.
                  You can only enter the Strudel from one direction so be aware! This action is irreversible.
                </StyledP>
              </AstroGrid>
              <AstroGrid item lg={4} xs={1}></AstroGrid>
            </Grid>
            <Spacer size="lg" />

            <Container>
              <Balances />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalanceStrudel />
            </Container>
            <Spacer size="lg" />
            <div
              style={{
                margin: '0 auto',
              }}
            >
              <Button
                borderButton={true}
                text="See Terra Farms"
                to="/farms"
                variant="secondary"
              />
            </div>
          </>
        </>
      ) : (
          <>
            <Countdown
              date={startDate}
              renderer={renderer}
              onComplete={handleCountEnd}
            />
            <MyStyledLink target="_blank" href="https://discord.gg/fBuHJCs">
              Join the Discord
          </MyStyledLink>
          </>
        )}
    </Page>
  )
}
const StyledLottieContainer = styled.div`
  width: 100%;
  z-index: -99;
  display: none;
  @media (min-width: 600px) and (orientation: landscape) {
    height: 50vh;
    display: block;
  }
`

const StyledLottieMobileContainer = styled.div`
  width: 100%;
  z-index: -99;
  height: 45vh;
  @media (min-width: 600px) and (orientation: landscape) {
    display: none;
  }
`

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
const StyledP = styled.p`
  color: rgba(37,37,44,0.48);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  padding: 0;
`
export default Home
