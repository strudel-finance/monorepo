import { makeStyles, TableContainer, withStyles } from '@material-ui/core'
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
  BTCTransaction,
  LoadingStatus,
  SoChainConfirmedGetTx,
  Confirmation,
} from '../../types/types'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import React, { useState, useRef, useEffect } from 'react'

import RollbarErrorTracking from '../../errorTracking/rollbar'
import showError from '../../utils/showError'
import useInterval from '../../hooks/useInterval'
import sb from 'satoshi-bitcoin'
import { changeEndian } from '../../utils/changeEndian'
import { getHarmonyRelayContract, getRelayContract } from '../../tokens/utils'
import useVBTC from '../../hooks/useVBTC'
import { apiServer } from '../../constants/backendAddresses'

// Extract this to a file, it is same to ConversionActions.tsx/getProof
const getBitcoinTxProofDetails = async (
  tx_data: string,
  tx_hash: string,
  block_hash: string,
): Promise<Response> => {
  const url = apiServer + '/proof/' + tx_hash + '/' + block_hash
  // const url = apiServer + '/production/proof/' + tx_hash + '/' + block_hash
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txData: tx_data }),
  }

  return fetch(url, opts)
}

export interface TransactionTableProps {
  account: any
  previousAccount: any
  lastRequest: BTCTransaction | undefined
  handleSetLastRequest: (tx: BTCTransaction) => void
  checkAndRemoveLastRequest: () => void
  wallet: any
  closeModal: () => void
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

      // Shouldn't be optional but uses ? here because the previous tx records doesn't have it
      blockchainNetworkId?: string
    },
  ]
}

const BTCTransactionsTableContainer: React.FC<TransactionTableProps> = ({
  account,
  previousAccount,
  lastRequest,
  handleSetLastRequest,
  checkAndRemoveLastRequest,
  wallet,
  closeModal,
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
    tx_data: string,
    tx_hash: string,
    blockHash: string,
    vbtc: any,
  ): Promise<boolean> => {
    let blockHashLittle = '0x' + changeEndian(blockHash) //
    
    try {
      const relayContract = getRelayContract(vbtc)
      const networkId = Number((window as any).ethereum?.networkVersion);

      if (networkId == 1 || networkId == 56) { // ETH or BSC
        const bestKnownDigest = await relayContract.methods
          .getBestKnownDigest()
          .call()
        console.log("bestKnwonDigest");
        console.log(bestKnownDigest);

        const heightTx = await relayContract.methods
          .findHeight(blockHashLittle)
          .call()
        console.log("heightTx");
        console.log(heightTx);

        const heightDigest = await relayContract.methods
          .findHeight(bestKnownDigest)
          .call()

        const offset = Number(heightDigest) - Number(heightTx)
        console.log("offset");
        console.log(offset);

        const GCD = await relayContract.methods
          .getLastReorgCommonAncestor()
          .call()

        // https://github.com/summa-tx/relays/blob/master/solidity/contracts/Relay.sol#L113
        const maxNumberOfBlocksToVerify = 10000; // Valid for about 70 days

        // Why this is false?
        const isAncestor = await relayContract.methods
          .isAncestor(blockHashLittle, GCD, maxNumberOfBlocksToVerify)
          .call()


        const isRelayed = offset >= 5 && isAncestor

        return isRelayed;
      }
      else if (networkId == 1666600000) { // Harmony

        const harmonyRelayContract = getHarmonyRelayContract(vbtc)
        const height = await harmonyRelayContract.methods.getBlockHeight(blockHashLittle).call(); 
        
        let response = await getBitcoinTxProofDetails(tx_data, tx_hash, blockHash);
        response = await response.json(); // string
        response = JSON.parse(`${response}`); // object

        // console.log("getBitcoinTxProofDetails response");
        // console.log(response);
        // alert(response);
        // Need these datas and along with txid
        // const version = undefined; // proof.version
        // const _locktime = undefined; // proof.locktime
        // const _vin = undefined; // proof.vin,
        // const _vout = undefined; // proof.vout,

        // @ts-ignore
        const { index, tx_id: txid, header, proof } = response;

        const confirmations = 6;
        const insecure = false;

        // Harmony Mainnet
        const isRelayed = await harmonyRelayContract.methods.verifyTx(
          height, // uint32
          index,
          txid, // bytes32 txid
          header, // bytes calldata header
          proof, // bytes calldata proof

          // Not important here
          confirmations,
          insecure,
        ).call();

        return isRelayed;
      }

    } catch (e) { 
      console.log("getInclusion error");
      console.error(e);
      
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
    if (account) {
      let res = await fetch(
        `${apiServer}/account/${account}`,
        abortProps,
      )
        // .then(handleErrors)
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

      // alert(res);
      // console.log("res");
      // console.log(res);
      // blockchainNetworkId is involved here

      if (passedAccount.current === account) {
        let resNew: BTCTransaction[] = []
        if (isAccountRequest(res)) {
          res.burns.map((tx, i) => {
            let txNew: BTCTransaction = {
              ethAddress: account,
              value: sb.toBitcoin(tx.amount),
              txCreatedAt: new Date(tx.dateCreated),
              btcTxHash: tx.btcTxHash,
              burnOutputIndex: tx.burnOutputIndex,
              confirmed: tx.status === 'paid' ? true : false,
              
              blockchainNetworkId: tx.blockchainNetworkId,
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
            closeModal()
          }
        }
      }
    }
  }

  useInterval(async () => {
    if (account != null) {
      await handleTransactionUpdate()
      if (transactions.length > 0) {
        let transactionsT: BTCTransaction[] = transactions
        let transactionsWithLowConfirmations = transactionsT.filter(
          (tx) =>
            !tx.confirmed &&
            (!confirmations[tx.btcTxHash] ||
              confirmations[tx.btcTxHash]?.confirmations < BTC_ACCEPTANCE),
        )

        let highConfirmations = {}

        await Object.keys(confirmations).forEach(async (key) => {
          if (confirmations[key].confirmations >= BTC_ACCEPTANCE) {
            highConfirmations[key] = confirmations[key]
            if (!highConfirmations[key].blockHash) {
              let res = await fetch(
                `https://sochain.com/api/v2/get_tx/BTC/${key}`,
              )
                // .then(handleErrors)
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
              console.log("highConfirmations");
              console.log(highConfirmations);
              
              // alert("getInclusion");
              // console.log("key");
              // console.log(key);
              // console.log("highConfirmations[key]");
              // console.log(highConfirmations[key]);

              const tx_hex = highConfirmations[key].tx_hex;
              const tx_data = key;
              const blockHash = highConfirmations[key].blockHash;

              highConfirmations[key].isRelayed = await getInclusion(
                tx_hex,
                tx_data,
                blockHash,
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
            // .then(handleErrors)
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

  // !!! TODO: inline styles to styled components
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <SimpleBar>
        <TableContainer style={{ height: 360 }}>
          <Table color="white" stickyHeader={true}>
            <colgroup>
              <col style={{ width: '27%' }} />
              <col style={{ width: '48%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
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
                  <ReddishBoldTextTypography style={{ textAlign: 'center' }}>
                    Actions
                  </ReddishBoldTextTypography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lastRequest && (
                <TableRow style={{ height: 95 }}>
                  <TableCell align="left">
                    <ReddishTextTypography variant="caption">
                      {lastRequest.value} BTC → vBTC
                    </ReddishTextTypography>
                  </TableCell>
                  <TableCell>
                    <ConversionStatus tx={lastRequest} />
                  </TableCell>
                  <TableCell>
                    <Grid container justify="center">
                      <ConversionActions tx={lastRequest} />
                    </Grid>
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((tx, i) => {
                return (
                  <TableRow key={i} style={{ height: 95 }}>
                    <TableCell align="left" style={{ width: 225 }}>
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
                      <Grid container justify="center">
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
        </TableContainer>
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
    background: 'white',
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
    // border: '1px solid #e2d6cfff',
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

export default BTCTransactionsTableContainer