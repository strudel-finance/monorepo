import React, {useCallback, useState, useMemo, useEffect} from 'react'
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
import useInterval from '../../hooks/useInterval'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'
import {makeStyles} from '@material-ui/core'
import {Transaction} from '../../components/TransactionsTableContainer'
import sb from 'satoshi-bitcoin'

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
  const txTest: Array<Transaction> = [
    {
      txCreatedAt: new Date(1600948128765),
      value: '0.1',
      confirmed: true,
      confirmations: 1,
      btcTxHash:
        'fe45455d3a033da656a973119fc970b68091f867fe4ec6054a66d95783d2fee7',
    },
    {
      txCreatedAt: new Date(1600948139765),
      value: '0.7',
      confirmed: false,
      btcTxHash:
        'f9fb0605bda597ff0f65ae33b8fb5d9d515568d7c781ca37396c1974654ae97f',
    },
  ]
  const POLL_DURATION_TXS = 1500
  const BTC_ACCEPTANCE = 6
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState(undefined)
  const [transactions, setTransactions] = useState([])
  const [address, setAddress] = useState(
    '0x0000000000000000000000000000000000000000',
  )
  const wallet = useWallet()
  const account = wallet.account
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

  interface SoChainConfirmed {
    status: string
    data: {
      confirmations: number
    }
  }
  interface AccountRequest {
    account: string
    burns: [
      {
        amount: string // satoshis
        dateCreated: Date
        btcTxHash: string
        status: string
        ethTxHash?: string
      },
    ]
  }
  /*
  let res = {
  account: "0x",
  burns: [
    {
      txCreatedAt: "1600948128765",
      amount: '10000000',
      status: 'd',
      btcTxHash:
        'fe45455d3a033da656a973119fc970b68091f867fe4ec6054a66d95783d2fee7',
    },
    {
      txCreatedAt: "1600948139765",
      amount: '10000000',
      status: 'paid',
      btcTxHash:
        'f9fb0605bda597ff0f65ae33b8fb5d9d515568d7c781ca37396c1974654ae97f',
      ethTxHash: '0xce3ade4a1b5416ddf0f4cd735f3c45fb8b331a14c81756a177ac0345004a490e'
    },
  ]
}
  */
  const handleTransactionUpdate = async () => {
    if (wallet.status === 'connected') {
      /*
      let res = await fetch(
        `/account/${account}`,
      )
        .then((response) => response.json())
        .then((res: AccountRequest) => res)
        .catch(error => {
         return;
      })
        let resNew = []
        res.burns.map((tx, i) => {
          let txNew = {
          value: sb.toBitcoin(tx.amount),
          txCreatedAt: new Date(tx.dateCreated),
          btcTxHash: tx.btcTxHash,
          confirmed: (tx.status === 'paid') ? true : false
          }
          if(tx.ethTxHash) txNew.ethTxHash = tx.ethTxHash;
          resNew.push(txNew)
        })
        if(transactions.length === 0){
        setTransactions(resNew);
      } else {
      if(data.length > transactions.length){
          setTransactions(resNew)
          window.localStorage.removeItem('lastRequest');
          setLastRequest(undefined);
      }
    }
      })
      */
    }
  }

  useEffect(() => {
    if (lastRequest === undefined) {
      let tx = JSON.parse(window.localStorage.getItem('lastRequest'))
      tx.txCreatedAt = new Date(tx.txCreatedAt)
      setLastRequest(tx)
    }
    // get transactions at first
    handleTransactionUpdate()
  }, [])

  useInterval(async () => {
    await handleTransactionUpdate()
    let transactionsT: Transaction[] = transactions
    let transactionsWithLowConfirmations = transactionsT.filter(
      (tx) => !tx.confirmed,
    )
    let transactionsWithHighConfirmations = transactionsT.filter(
      (tx) => tx.confirmed,
    )
    for (let i = 0; i < transactionsWithLowConfirmations.length; i++) {
      let res = await fetch(
        `https://sochain.com/api/v2/is_tx_confirmed/BTC/${transactionsWithLowConfirmations[i].btcTxHash}`,
      )
        .then((response) => response.json())
        .then((res: SoChainConfirmed) => res)
      transactionsWithLowConfirmations[i].confirmations = res.data.confirmations
      if (res.data.confirmations >= BTC_ACCEPTANCE) {
        transactionsWithLowConfirmations[i].confirmed = true
      }
    }
    const transactionsRecombined = [
      ...transactionsWithLowConfirmations,
      ...transactionsWithHighConfirmations,
    ]
    setTransactions(transactionsRecombined)
  }, POLL_DURATION_TXS)

  const handleLastRequestChange = (tx: Transaction) => {
    setLastRequest(tx)
    window.localStorage.setItem('lastRequest', JSON.stringify(tx))
  }
  const [onPresentBurn] = useModal(
    <BurnModal
      onAddition={handleLastRequestChange}
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
              <TransactionsTableContainer
                transactions={transactions}
                lastRequest={lastRequest}
              />
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
