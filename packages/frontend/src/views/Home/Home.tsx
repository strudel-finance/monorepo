import React, {useCallback, useState, useMemo} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import WalletProviderModal from '../../components/WalletProviderModal'

import chef from '../../assets/img/chef.png'
import Button from '../../components/Button'
//import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import Balances from './components/Balances'
import formatAddress from '../../utils/formatAddress'
import useModal from '../../hooks/useModal'
import BurnModal from './components/BurnModal'

import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'
import {makeStyles} from '@material-ui/core'
import {Transaction} from '../../components/TransactionsTableContainer'

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

const Home: React.FC = () => {
  const [val, setVal] = useState('0')

  const [address, setAddress] = useState(
    '0x0000000000000000000000000000000000000000',
  )
  const wallet = useWallet()
  const account = wallet.account
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

  const [onPresentBurn] = useModal(
    <BurnModal value={val} address={account} onConfirm={() => {}} />,
  )

  const handleAmountChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )
  const txTest: Array<Transaction> = [
    {
      txCreatedAt: new Date(1700948128765),
      value: 0.2,
      confirmed: false,
      confirmations: 1,
      awaiting: 'btc-settle',
    },
    {
      txCreatedAt: new Date(1600948128765),
      value: 0.1,
      confirmed: false,
      confirmations: 1,
      awaiting: 'btc-settle',
    },
    {
      txCreatedAt: new Date(1600948128765),
      value: 0.1,
      confirmed: false,
      confirmations: 1,
      awaiting: 'btc-settle',
    },
    {
      txCreatedAt: new Date(1600948128765),
      value: 0.1,
      confirmed: false,
      confirmations: 1,
      awaiting: 'btc-settle',
    },
  ]
  return (
    <Page>
      <PageHeader
        icon={<img src={chef} height={120} />}
        title="The Vortex is ready"
        subtitle="Burn BTC to receive vBTC and $STRDL!"
      />
      {wallet.status === 'connected' ? (
        <Container fixed maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={4}>
              <Container>
                <AddressInput address={account} value={account} />
                <BurnAmountInput
                  onChange={handleAmountChange}
                  value={val}
                  symbol="BTC"
                />
                <Button text={'Get vBTC'} onClick={onPresentBurn} />
              </Container>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <TransactionsTableContainer transactions={txTest} />
            </Grid>
          </Grid>
        </Container>
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
      <Spacer size="lg" />
      <StyledInfo>
        🏆<b>Degen Tip</b>: Strudel only works in one direction.
      </StyledInfo>
      <Spacer size="lg" />
      <Container>
        <Balances />
      </Container>
      <Spacer size="lg" />
      <div
        style={{
          margin: '0 auto',
        }}
      >
        <Button text="🔪 See the Menu" to="/farms" variant="secondary" />
      </div>
    </Page>
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

export default Home
