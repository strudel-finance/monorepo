import { makeStyles, withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import MuiTableCell from '@material-ui/core/TableCell'
import MuiTableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import ConversionStatus from './components/ConversionStatus'
import ConversionActions from './components/ConversionActions'
import {
  Transaction,
  LoadingStatus,
  SoChainConfirmedGetTx,
  Confirmation,
} from '../../types/types'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import React, { useState, useRef, useEffect } from 'react'
import { apiServer } from '../../constants/backendAddresses'
import RollbarErrorTracking from '../../errorTracking/rollbar'
import showError, { handleErrors } from '../../utils/showError'
import useInterval from '../../hooks/useInterval'
import sb from 'satoshi-bitcoin'
import { changeEndian } from '../../utils/changeEndian'
import { Contract } from 'web3-eth-contract'
import { getRelayContract } from '../../vbtc/utils'
import useVBTC from '../../hooks/useVBTC'

export interface TransactionTableProps {
  account: any
  previousAccount: any
  lastRequest: Transaction | undefined
  handleSetLastRequest: (tx: Transaction) => void
  checkAndRemoveLastRequest: () => void
  wallet: any
}
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

const TransactionsTableContainer: React.FC<TransactionTableProps> = ({
  account,
  previousAccount,
  lastRequest,
  handleSetLastRequest,
  checkAndRemoveLastRequest,
  wallet,
}) => {
  const POLL_DURATION_TXS = 1500
  const BTC_ACCEPTANCE = 6
  const [isLoading, setLoading] = useState({})
  const [transactions, setTransactions] = useState([])
  const [confirmations, setConfirmations] = useState({})
  const vbtc = useVBTC()

  const handleLoading = (ls: LoadingStatus) => {
    let tempLoading = isLoading
    tempLoading[ls.tx] = ls.status
    setLoading(tempLoading)
  }

  const getInclusion = async (
    blockHash: string,
    vbtc: any,
  ): Promise<boolean> => {
    const relayContract = getRelayContract(vbtc)
    let blockHashLittle = '0x' + changeEndian(blockHash)
    try {
      const bestKnownDigest = await relayContract.methods
        .getBestKnownDigest()
        .call()
      const heightTx = await relayContract.methods
        .findHeight(blockHashLittle)
        .call()
      const heightDigest = await relayContract.methods
        .findHeight(bestKnownDigest)
        .call()
      const offset = Number(heightDigest) - Number(heightTx)
      const GCD = await relayContract.methods
        .getLastReorgCommonAncestor()
        .call()
      const isAncestor = await relayContract.methods
        .isAncestor(blockHashLittle, GCD, 2500)
        .call()
      return offset >= 5 && isAncestor
    } catch (e) {
      return false
    }
  }

  const isAccountRequest = (
    res: AccountRequest | void,
  ): res is AccountRequest => {
    if ((res as AccountRequest).burns) {
      return true
    }
    return false
  }

  useEffect(() => {
    const abortController = new AbortController()
    if (account == null || previousAccount !== account) {
      setTransactions([])
      handleSetLastRequest(undefined)
    }
    if (lastRequest === undefined && localStorage.hasOwnProperty(account)) {
      let tx = JSON.parse(window.localStorage.getItem(account))
      tx.txCreatedAt = new Date(tx.txCreatedAt)
      handleSetLastRequest(tx)
    }
    if (previousAccount !== account) {
      // get transactions at first
      handleTransactionUpdate(abortController)
    }
    return () => {
      abortController.abort()
    }
  }, [account])

  const passedAccount = useRef()
  passedAccount.current = account

  const handleTransactionUpdate = async (abortController?: any) => {
    let abortProps = abortController
      ? {
          signal: abortController.signal,
        }
      : {}
    if (wallet.status === 'connected') {
      let res = await fetch(
        `${apiServer}/production/account/${account}`,
        abortProps,
      )
        .then(handleErrors)
        .then((response) => response.json())
        .then((res: AccountRequest) => res)
        .catch((e) => {
          //forget error
          if (e.message != 404) {
            if (
              (abortController && !abortController.signal.aborted) ||
              !abortController
            ) {
              showError('Problem fetching account: ' + e.message)
              RollbarErrorTracking.logErrorInRollbar(
                'Problem fetching account: ' + e.message,
              )
            }
          }
          return undefined
        })
      if (res === undefined) {
        return
      }
      if (passedAccount.current === account) {
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
  }

  useInterval(async () => {
    if (account != null) {
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
        await Object.keys(confirmations).forEach(async (key) => {
          if (confirmations[key].confirmations >= BTC_ACCEPTANCE) {
            highConfirmations[key] = confirmations[key]
            if (!highConfirmations[key].blockHash) {
              let res = await fetch(
                `https://sochain.com/api/v2/get_tx/BTC/${key}`,
              )
                .then(handleErrors)
                .then((response) => response.json())
                .then((res: SoChainConfirmedGetTx) => res)
                .catch((e) => {
                  RollbarErrorTracking.logErrorInRollbar(
                    'SoChain fetch tx error' + e.message,
                  )
                  showError('SoChain API Error: ' + e.message)
                  return undefined
                })
              if (res !== undefined) {
                highConfirmations[key].blockHash = res.data.blockhash
                highConfirmations[key].tx_hex = res.data.tx_hex
              }
            }
            if (
              highConfirmations[key].blockHash &&
              !highConfirmations[key].isRelayed
            ) {
              highConfirmations[key].isRelayed = await getInclusion(
                highConfirmations[key].blockHash,
                vbtc,
              )
            }
          }
        })
        let newConfirmations: Record<string, Confirmation> = {}
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

          if (res === undefined || res.data.confirmations === undefined) {
            continue
          }
          let confirmation: Confirmation = {
            confirmations: res.data.confirmations,
          }
          newConfirmations[
            transactionsWithLowConfirmations[i].btcTxHash
          ] = confirmation
        }
        const confirmationsRecombined = {
          ...highConfirmations,
          ...newConfirmations,
        }
        if (passedAccount.current === account) {
          setConfirmations(confirmationsRecombined)
        }
      }
    }
  }, POLL_DURATION_TXS)

  const classes = useStyles()
  return (
    <div className={classes.container}>
      <SimpleBar style={{ maxHeight: 250 }}>
        <Table color="white" stickyHeader={true}>
          <TableHead>
            <TableRow>
              <TableCell align="left">
                <ReddishBoldTextTypography>
                  Transaction
                </ReddishBoldTextTypography>
              </TableCell>
              <TableCell>
                <ReddishBoldTextTypography>Status</ReddishBoldTextTypography>
              </TableCell>
              <TableCell>
                <div className={classes.actionsCell}></div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lastRequest !== undefined && (
              <TableRow key="stub">
                <TableCell align="left">
                  <ReddishTextTypography variant="caption">
                    {lastRequest.value} BTC → vBTC
                  </ReddishTextTypography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    <ConversionStatus tx={lastRequest} />
                  </Typography>
                </TableCell>
                <TableCell>
                  <Grid container justify="flex-end">
                    <ConversionActions tx={lastRequest} />
                  </Grid>
                </TableCell>
              </TableRow>
            )}
            {transactions.map((tx, i) => {
              return (
                <TableRow key={i}>
                  <TableCell align="left">
                    <ReddishTextTypography variant="caption">
                      {tx.value} BTC → vBTC
                    </ReddishTextTypography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      <ConversionStatus
                        tx={tx}
                        confirmations={confirmations[tx.btcTxHash]}
                      />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Grid container justify="flex-end">
                      <ConversionActions
                        tx={tx}
                        confirmation={confirmations[tx.btcTxHash]}
                        handleLoading={handleLoading}
                        isLoading={isLoading}
                      />
                    </Grid>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </SimpleBar>
    </div>
  )
}

export const ReddishTextTypography = withStyles({
  root: {
    color: '#322015',
    fontFamily: 'Noto Sans',
    fontSize: 16,
  },
})(Typography)

const ReddishBoldTextTypography = withStyles({
  root: {
    fontWeight: 700,
  },
})(ReddishTextTypography)

const TableCell = withStyles({
  root: {
    borderBottom: 'none',
  },
  stickyHeader: {
    background: 'white',
  },
})(MuiTableCell)

const TableHead = withStyles({
  root: {
    background: 'white',
  },
})(MuiTableHead)

const useStyles = makeStyles((theme) => ({
  container: {
    borderColor: 'none',
    background: '#d0e0fe',
    border: '1px solid #e2d6cfff',
    boxShadow: 'inset 1px 1px 0px #f7f4f2',
    borderRadius: '12px',
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

export default TransactionsTableContainer
