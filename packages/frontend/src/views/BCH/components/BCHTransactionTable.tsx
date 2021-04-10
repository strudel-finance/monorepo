import { makeStyles, withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import MuiTableCell from '@material-ui/core/TableCell'
import MuiTableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import {
  BTCTransaction,
  LoadingStatus,
  AccountRequest,
  BCHTransaction,
} from '../../../types/types'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import React, { useState, useRef, useEffect } from 'react'
import sb from 'satoshi-bitcoin'
import { getRelayContract } from '../../../bridgeTokens/utils'
import { changeEndian } from '../../../utils/changeEndian'
import showError, { handleErrors } from '../../../utils/showError'
import RollbarErrorTracking from '../../../errorTracking/rollbar'
import useInterval from '../../../hooks/useInterval'
import { apiServer } from '../../../constants/backendAddresses'
import ConversionStatus from '../../../components/TransactionsTableContainer/components/ConversionStatus'
import ConversionActions from '../../../components/TransactionsTableContainer/components/ConversionActions'
import useVBCH from '../../../hooks/useVBCH'
import { Vbch } from '../../../bridgeTokens/Vbch'

export interface TransactionTableProps {
  account: any
  previousAccount: any
  lastRequest: BTCTransaction | undefined
  handleSetLastRequest: (tx: BCHTransaction) => void
  checkAndRemoveLastRequest: () => void
  wallet: any
}
interface SoChainConfirmed {
  status: string
  data: {
    confirmations: number
  }
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
  const BCH_ACCEPTANCE = 60
  const [isLoading, setLoading] = useState({})
  const [transactions, setTransactions] = useState([])
  const [confirmed, setConfirmed] = useState({})
  const vbch = useVBCH()

  const handleLoading = (ls: LoadingStatus) => {
    let tempLoading = isLoading
    tempLoading[ls.tx] = ls.status
    setLoading(tempLoading)
  }

  const getInclusion = async (
    blockHash: string,
    vbch: Vbch,
  ): Promise<boolean> => {
    const relayContract = getRelayContract(vbch)
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
      // change with .env
      const res: AccountRequest = await fetch(
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
      if (!res) {
        return
      }
      if (passedAccount.current === account) {
        const resNew: BCHTransaction[] = []
        if (isAccountRequest(res)) {
          res.bchBurns.map((tx, i) => {
            const txNew: BCHTransaction = {
              ethAddress: account,
              value: sb.toBitcoin(tx.amount),
              txCreatedAt: new Date(tx.dateCreated),
              bchTxHash: tx.bchTxHash,
              burnOutputIndex: tx.burnOutputIndex,
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
        console.log(transactions, confirmed,'transactions transactions');
        
        const transactionsWithLowConfirmations = transactions.filter(
          (tx) => {
            console.log(
              confirmed,
              tx.bchTxHash,
              confirmed[tx.bchTxHash],
              confirmed[tx.bchTxHash]?.confirmations < BCH_ACCEPTANCE, 'aaaa');
            
            return  (
              !confirmed[tx.bchTxHash] ||
              confirmed[tx.bchTxHash]?.confirmations < BCH_ACCEPTANCE)}
        )

        const newConfirmations: {
          blockHash: string,
          confirmations: number,
          isRelayed: boolean
        } | {} = {}
        
        for (const transaction of transactionsWithLowConfirmations) {
          const res = await fetch(
            `https://rest.bitcoin.com/v2/transaction/details/${transaction.bchTxHash}`,
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

          if (!res || !res.confirmations) continue

          const {confirmations, blockhash} = res
          const {bchTxHash} = transaction
          
          newConfirmations[bchTxHash] = {
            confirmations,
          }
          
          console.log(newConfirmations,bchTxHash, 'BCHtxHash');

          if (res.confirmations >= BCH_ACCEPTANCE) {
                console.log(res, 'res.data res.data res.data');
                
                newConfirmations[bchTxHash].blockHash = blockhash
                // newConfirmations[bchTxHash].tx_hex = txid
            if (
              newConfirmations[bchTxHash].blockHash &&
              !newConfirmations[bchTxHash].isRelayed
            ) {
              // highConfirmations[bchTxHash].isRelayed = await getInclusion(
              //   highConfirmations[bchTxHash].blockHash,
              //   vbch,
              // )
            }
          }

          console.log(newConfirmations,'newConfirmations');

          if (passedAccount.current === account) {
            setConfirmed(newConfirmations)
          }
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
              {/* <TableCell>
                <div className={classes.actionsCell}></div>
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {lastRequest && (
              <TableRow key="stub">
                <TableCell align="left">
                  <ReddishTextTypography variant="caption">
                    {lastRequest.value} BCH → vBCH
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
                      {tx.value} BCH → vBCH
                    </ReddishTextTypography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      <ConversionStatus
                        tx={tx}
                        confirmations={confirmed[tx.bchTxHash]}
                      />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Grid container justify="flex-end">
                      <ConversionActions
                        tx={tx}
                        confirmation={confirmed[tx.bchTxHash]}
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
