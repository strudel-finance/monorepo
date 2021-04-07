import { makeStyles, withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import MuiTableCell from '@material-ui/core/TableCell'
import MuiTableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import {
  Transaction,
  LoadingStatus,
  SoChainConfirmedGetTx,
  Confirmation,
} from '../../../types/types'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import React, { useState, useRef, useEffect } from 'react'
import sb from 'satoshi-bitcoin'
import { getRelayContract } from '../../../bridgeTokens/utils'
import { changeEndian } from '../../../utils/changeEndian'
import useVBTC from '../../../hooks/useVBTC'
import showError, { handleErrors } from '../../../utils/showError'
import RollbarErrorTracking from '../../../errorTracking/rollbar'
import useInterval from '../../../hooks/useInterval'
import { apiServer } from '../../../constants/backendAddresses'
import ConversionStatus from '../../../components/TransactionsTableContainer/components/ConversionStatus'
import ConversionActions from '../../../components/TransactionsTableContainer/components/ConversionActions'

export interface TransactionTableProps {
  account: any
  previousAccount: any
  lastRequest: Transaction | undefined
  handleSetLastRequest: any
  // (tx: Transaction) => void
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

const BCHTransactionsTableContainer: React.FC<TransactionTableProps> = ({
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
    const blockHashLittle = '0x' + changeEndian(blockHash)

    const bestKnownDigest = await relayContract.methods
      .getBestKnownDigest()
      .call()
    const heightTx = await relayContract.methods
      .findHeight(blockHashLittle)
      .call()
    // const heightDigest = await relayContract.methods
    //   .findHeight(bestKnownDigest)
    //   .call()

    return true
    // try {
    //   const bestKnownDigest = await relayContract.methods
    //     .getBestKnownDigest()
    //     .call()
    //   const heightTx = await relayContract.methods
    //     .findHeight(blockHashLittle)
    //     .call()
    //   const heightDigest = await relayContract.methods
    //     .findHeight(bestKnownDigest)
    //     .call()

    //   console.log(Number(heightDigest), Number(heightTx), 'eee')

    //   const offset = Number(heightDigest) - Number(heightTx)
    //   const GCD = await relayContract.methods
    //     .getLastReorgCommonAncestor()
    //     .call()
    //   const isAncestor = await relayContract.methods
    //     .isAncestor(blockHashLittle, GCD, 2500)
    //     .call()
    //   return offset >= 5 && isAncestor
    // } catch (e) {
    //   return false
    // }
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
    if (!account || previousAccount !== account) {
      setTransactions([])
      handleSetLastRequest(undefined)
    }
    if (!lastRequest && localStorage.hasOwnProperty(account)) {
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
    const abortProps = abortController
      ? {
          signal: abortController.signal,
        }
      : {}
    if (account) {
      const res = await fetch(
        `${apiServer}/production/account/${account}`,
        abortProps,
      )
        .then(handleErrors)
        .then((response) => response.json())
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
        const resNew: Transaction[] = []
        if (isAccountRequest(res)) {
          res.burns.map((tx, i) => {
            const txNew: Transaction = {
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
          const sortedRes = resNew.sort((txa, txb) =>
            (txa.txCreatedAt ?? 0) < (txb?.txCreatedAt ?? 0) ? 1 : -1,
          )
          if (!transactions.length) {
            if (
              lastRequest &&
              sortedRes[0].txCreatedAt > lastRequest.txCreatedAt
            ) {
              checkAndRemoveLastRequest()
            }
            setTransactions(sortedRes)
          } else if (sortedRes.length > transactions.length) {
            setTransactions(sortedRes)
            checkAndRemoveLastRequest()
          }
        }
      }
    }
  }

  const transactionMatching = async () => {
    if (account) {
      await handleTransactionUpdate()
      if (transactions.length) {
        // let transactionsT: Transaction[] = transactions
        const transactionsWithLowConfirmations = transactions.filter(
          (tx) =>
            !tx.confirmed &&
            (confirmations[tx.btcTxHash] < BTC_ACCEPTANCE ||
              confirmations[tx.btcTxHash] === undefined),
        )

        const highConfirmations = {}
        for (let key of Object.keys(confirmations)) {
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
              if (res) {
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
        }

        /**
         * {
  "status" : "success",
  "data" : {
    "network" : "BTC",
    "txid" : "88e3c5541525db408cc7ca05dbd2f58b201b21724a43eba1219cf03b29c584c7",
    "blockhash" : "000000000000000000002834ed5979c38e07bdfc72c7603c1f7ac901c79e1975",
    "confirmations" : 26748,
    "time" : 1601138185,
    "inputs" : [
      {
        "input_no" : 0,
        "value" : "0.00035136",
        "address" : "1NGQfz1N1RvcwZK4Cu8Y2y3spc25bniymt",
        "type" : "pubkeyhash",
        "script" : "304402207bc43b7491ad852ae38de1fe83bb067b61f36ae7a71a7a58cd399858c5d7c3e702207922661ba12ad58dbdbf074f623aa9abc3289cb2f02aa7772ba6e4476c16a07b01 032cd923031604836a6070972a29e98bfdc1620d671e4df00f93a6704dcbfc327b",
        "witness" : null,
        "from_output" : {
          "txid" : "d05142c0b09454f0b72b968f9f81684147a621cca86e16c686e3c73390cf07ca",
          "output_no" : 1
        }
      }
    ],
    "outputs" : [
      {
        "output_no" : 0,
        "value" : "0.00000500",
        "address" : "nonstandard",
        "type" : "nulldata",
        "script" : "OP_RETURN 07ffff8db6b632d743aef641146dc943acb64957155388"
      },
      {
        "output_no" : 1,
        "value" : "0.00020804",
        "address" : "1GAR51RHhwXB8rT8HC8KdZtRo2hk53TCE7",
        "type" : "pubkeyhash",
        "script" : "OP_DUP OP_HASH160 a651b8e729f18cee91b940e48b05b6e9cad74f04 OP_EQUALVERIFY OP_CHECKSIG"
      }
    ],
    "tx_hex" : "0200000001ca07cf9033c7e386c6166ea8cc21a6474168819f8f962bb7f05494b0c04251d0010000006a47304402207bc43b7491ad852ae38de1fe83bb067b61f36ae7a71a7a58cd399858c5d7c3e702207922661ba12ad58dbdbf074f623aa9abc3289cb2f02aa7772ba6e4476c16a07b0121032cd923031604836a6070972a29e98bfdc1620d671e4df00f93a6704dcbfc327bffffffff02f401000000000000196a1707ffff8db6b632d743aef641146dc943acb6495715538844510000000000001976a914a651b8e729f18cee91b940e48b05b6e9cad74f0488ac00000000",
    "size" : 225,
    "version" : 2,
    "locktime" : 0
  }
}
         */

        const newConfirmations: Record<string, Confirmation> = {}
        for (const transaction of transactionsWithLowConfirmations) {
          const res = await fetch(
            `https://sochain.com/api/v2/is_tx_confirmed/BTC/${transaction.btcTxHash}`,
          )
            .then(handleErrors)
            .then((response) => response.json())
            .catch((e) => {
              showError('SoChain API error: ' + e.message)
              RollbarErrorTracking.logErrorInRollbar(
                'SoChain confirmations: ' + e.message,
              )
              return undefined
            })

          if (!res || !res.data.confirmations) {
            continue
          }
          const confirmation: Confirmation = {
            confirmations: res.data.confirmations,
          }
          newConfirmations[transaction.btcTxHash] = confirmation
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
  }

  useInterval(transactionMatching, POLL_DURATION_TXS)

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
    fontFamily: 'azo-sans-web',
    fontSize: 16,
  },
})(Typography)

const ReddishBoldTextTypography = withStyles({
  root: {
    fontWeight: 700,
  },
})(ReddishTextTypography)

const TableCell = withStyles({
  stickyHeader: {
    background: 'transparent',
  },
})(MuiTableCell)

const TableHead = withStyles({
  root: {
    background: 'transparent',
  },
})(MuiTableHead)

const useStyles = makeStyles((theme) => ({
  container: {
    borderColor: 'none',
    background: '#FFFFFF',
    border: '1px solid #e2d6cfff',
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

export default BCHTransactionsTableContainer
