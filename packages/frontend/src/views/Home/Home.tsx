import React, {useCallback, useState, useMemo, useEffect, useRef} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import WalletProviderModal from '../../components/WalletProviderModal'

import astronaut from '../../assets/img/Astronaut.png'
import Button from '../../components/Button'
//import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import Balances from './components/Balances'
import BalanceStrudel from './components/BalanceStrudel'

import formatAddress from '../../utils/formatAddress'
import showError, {handleErrors} from '../../utils/showError'
import useModal from '../../hooks/useModal'
import BurnModal from './components/BurnModal'
import useInterval from '../../hooks/useInterval'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import TransactionsTableContainer from '../../components/TransactionsTableContainer'
import {makeStyles} from '@material-ui/core'
import {Transaction, LoadingStatus} from '../../types/types'
import sb from 'satoshi-bitcoin'
import {apiServer} from '../../constants/backendAddresses'
import RollbarErrorTracking from '../../errorTracking/rollbar'

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
  const POLL_DURATION_TXS = 1500
  const BTC_ACCEPTANCE = 6
  const [val, setVal] = useState('0')
  const [lastRequest, setLastRequest] = useState(undefined)
  const [transactions, setTransactions] = useState([])
  const [confirmations, setConfirmations] = useState({})
  const [address, setAddress] = useState(
    '0x0000000000000000000000000000000000000000',
  )
  const [isLoading, setLoading] = useState({})

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
        burnOutputIndex: string
        ethTxHash?: string
      },
    ]
  }
  const usePrevious = (value: any) => {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }

  const isAccountRequest = (
    res: AccountRequest | void,
  ): res is AccountRequest => {
    if ((res as AccountRequest).burns) {
      return true
    }
    return false
  }
  const checkAndRemoveLastRequest = () => {
    if (lastRequest !== undefined) {
      window.localStorage.removeItem(account)
      setLastRequest(undefined)
    }
  }
  const handleLoading = (ls: LoadingStatus) => {
    let tempLoading = isLoading
    tempLoading[ls.tx] = ls.status
    setLoading(tempLoading)
  }

  const handleTransactionUpdate = async () => {
    if (wallet.status === 'connected') {
      let res = await fetch(`${apiServer}/production/account/${account}`)
        .then(handleErrors)
        .then((response) => response.json())
        .then((res: AccountRequest) => res)
        .catch((e) => {
          //forget error
          if (e.message != 404) {
            showError('Problem fetching account: ' + e.message)
            RollbarErrorTracking.logErrorInRollbar(
              'Problem fetching account: ' + e.message,
            )
          }
          return undefined
        })
      if (res === undefined) {
        return
      }
      let resNew: Transaction[] = []
      if (isAccountRequest(res)) {
        res.burns.map((tx, i) => {
          let txNew: Transaction = {
            ethAddress: account,
            value: sb.toBitcoin(tx.amount),
            txCreatedAt: new Date(tx.dateCreated),
            btcTxHash: tx.btcTxHash,
            burnOutputIndex: tx.burnOutputIndex,
            confirmed: tx.status === 'paid' ? true : false,
          }
          if (tx.ethTxHash) {
            txNew.ethTxHash = tx.ethTxHash
          }
          resNew.push(txNew)
        })
        resNew = resNew.sort((txa, txb) => {
          return (txa.txCreatedAt ?? 0) < (txb?.txCreatedAt ?? 0) ? 1 : -1
        })
        if (transactions.length === 0) {
          if (
            lastRequest !== undefined &&
            resNew[0].txCreatedAt > lastRequest.txCreatedAt
          ) {
            checkAndRemoveLastRequest()
          }
          setTransactions(resNew)
        } else if (resNew.length > transactions.length) {
          setTransactions(resNew)
          checkAndRemoveLastRequest()
        }
      }
    }
  }
  const previousAccount = usePrevious(account)

  useEffect(() => {
    if (account === null || previousAccount !== account) {
      setTransactions([])
      setLastRequest(undefined)
    }
    if (previousAccount !== account) {
      if (lastRequest === undefined && localStorage.hasOwnProperty(account)) {
        let tx = JSON.parse(window.localStorage.getItem(account))
        tx.txCreatedAt = new Date(tx.txCreatedAt)
        setLastRequest(tx)
      }
      // get transactions at first
      handleTransactionUpdate()
    }
  }, [account])

  useInterval(async () => {
    await handleTransactionUpdate()
    if (transactions.length > 0) {
      let transactionsT: Transaction[] = transactions
      let transactionsWithLowConfirmations = transactionsT.filter(
        (tx) =>
          !tx.confirmed &&
          (confirmations[tx.btcTxHash] < BTC_ACCEPTANCE ||
            confirmations[tx.btcTxHash] === undefined),
      )

      let highConfirmations = {}
      Object.keys(confirmations).forEach((key) => {
        if (confirmations[key] >= BTC_ACCEPTANCE) {
          highConfirmations[key] = confirmations[key]
        }
      })
      let newConfirmations = {}
      for (let i = 0; i < transactionsWithLowConfirmations.length; i++) {
        let res = await fetch(
          `https://sochain.com/api/v2/is_tx_confirmed/BTC/${transactionsWithLowConfirmations[i].btcTxHash}`,
        )
          .then(handleErrors)
          .then((response) => response.json())
          .then((res: SoChainConfirmed) => res)
          .catch((e) => {
            showError('SoChain API error: ' + e.message)
            RollbarErrorTracking.logErrorInRollbar(
              'SoChain confirmations: ' + e.message,
            )
            return undefined
          })

        if (res === undefined) {
          continue
        }
        newConfirmations[transactionsWithLowConfirmations[i].btcTxHash] =
          res.data.confirmations
      }
      const confirmationsRecombined = {
        ...highConfirmations,
        ...newConfirmations,
      }
      setConfirmations(confirmationsRecombined)
    }
  }, POLL_DURATION_TXS)

  const handleLastRequestChange = (tx: Transaction) => {
    setLastRequest(tx)
    window.localStorage.setItem(account, JSON.stringify(tx))
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
        icon={<img src={astronaut} height={120} />}
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
                confirmations={confirmations}
                handleLoading={handleLoading}
                isLoading={isLoading}
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
      <Container>
        <BalanceStrudel />
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
