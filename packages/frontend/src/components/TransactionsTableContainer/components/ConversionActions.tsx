// eslint-disable jsx-a11y/anchor-is-valid

import { makeStyles } from '@material-ui/core'
import React from 'react'

import { ExternalLink } from './ExternalLink'
import {
  SoChainConfirmedGetTx,
  Proof,
  Transaction,
  LoadingStatus,
} from '../../../types/types'
import useModal from '../../../hooks/useModal'
import { apiServer } from '../../../constants/backendAddresses'

import BurnModal from '../../../views/Home/components/BurnModal'
import Button from '../../Button'

import useVBTC from '../../../hooks/useVBTC'
import { getVbtcContract, proofOpReturnAndMint } from '../../../vbtc/utils'
import { useWallet } from 'use-wallet'
import showError, { handleErrors } from '../../../utils/showError'
import RollbarErrorTracking from '../../../errorTracking/rollbar'

const useStyles = makeStyles((theme) => ({
  viewLink: {
    fontSize: 14,
    marginRight: theme.spacing(1),
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))

interface pushEthParam {
  ethTxHash: string
}

const pushEthTxHash = async (
  ethParam: pushEthParam,
  tx: Transaction,
): Promise<Response> => {
  const url =
    apiServer +
    '/production/payment/' +
    tx.btcTxHash +
    '/output/' +
    tx.burnOutputIndex +
    '/addEthTx'
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(ethParam),
  }
  return fetch(url, opts)
}

const getProof = async (
  tx_data: string,
  tx_hash: string,
  block_hash: string,
): Promise<Response> => {
  const url = apiServer + '/production/proof/' + tx_hash + '/' + block_hash
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({ txData: tx_data }),
  }
  return fetch(url, opts)
}

const callProofHelper = async (
  proof: Proof,
  burnOutputIndex: number,
  account: any,
  vbtcContract: any,
): Promise<string> => {
  return await proofOpReturnAndMint(
    vbtcContract,
    account,
    proof,
    burnOutputIndex,
  )
  // TODO: errors
}
const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

const waitForTxReceipt = async (
  transactionHash: string,
  vbtc: any,
): Promise<number> => {
  const expectedBlockTime = 1000
  let transactionReceipt = null
  while (transactionReceipt == null) {
    // Waiting expectedBlockTime until the transaction is mined
    transactionReceipt = await vbtc.web3.eth
      .getTransactionReceipt(transactionHash)
      .catch((e: any) => {
        RollbarErrorTracking.logErrorInRollbar(e)
        showError(e)
        return -1
      })
    await sleep(expectedBlockTime)
  }
  return transactionReceipt !== -1 ? 1 : -1
}

const callProofOpReturnAndMint = async (
  tx: Transaction,
  handleLoading: (ls: LoadingStatus) => void,
  account: any,
  vbtcContract: any,
  vbtc: any,
) => {
  let loadingStatus = { tx: tx.btcTxHash, status: true }
  handleLoading(loadingStatus)
  loadingStatus.status = false
  let proof

  if (!tx.hasOwnProperty('proof')) {
    let res = await fetch(
      `https://sochain.com/api/v2/get_tx/BTC/${tx.btcTxHash}`,
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
    if (res === undefined) {
      handleLoading(loadingStatus)
      return
    }
    proof = await getProof(res.data.tx_hex, tx.btcTxHash, res.data.blockhash)
      .then(handleErrors)
      .then((response1) => response1.json())
      .then((result: string) => JSON.parse(result))
      .catch((e) => {
        RollbarErrorTracking.logErrorInRollbar(
          'proof fetching problem' + e.message,
        )
        showError('Problem fetching proof: ' + e.message)
        return undefined
      })
    if (proof === undefined) {
      handleLoading(loadingStatus)
      return
    }
    tx.proof = proof
  } else {
    proof = tx.proof
  }

  let ethTxHash = await callProofHelper(
    proof,
    Number(tx.burnOutputIndex),
    account,
    vbtcContract,
  ).catch((e) => {
    RollbarErrorTracking.logErrorInRollbar(e.message)
    showError(e.message)
    return undefined
  })

  handleLoading(loadingStatus)
  if (
    (ethTxHash !== undefined &&
      ethTxHash.transactionHash !== undefined &&
      (await waitForTxReceipt(ethTxHash.transactionHash, vbtc))) === 1
  ) {
    // do things
    tx.ethTxHash = ethTxHash.transactionHash

    await pushEthTxHash({ ethTxHash: ethTxHash }, tx)
      .then(handleErrors)
      .catch((e) => {
        RollbarErrorTracking.logErrorInRollbar(
          'Problem pushing ETH to DB: ' + e.message,
        )
        showError('Problem pushing ETH to DB: ' + e.message)
      })
  }
}

interface Props {
  tx: Transaction
  confirmation?: number
  handleLoading?: (ls: LoadingStatus) => void
  isLoading?: any
}

const ConversionActions: React.FC<Props> = ({
  tx,
  confirmation,
  handleLoading,
  isLoading,
}) => {
  const { account } = useWallet()
  const vbtc = useVBTC()
  const vbtcContract = getVbtcContract(vbtc)

  const targetBtcConfs = 6
  const isConfirmed = confirmation >= targetBtcConfs
  const classes = useStyles()
  const [showModal] = useModal(
    <BurnModal value={tx.value} address={tx.ethAddress} continueV={true} />,
  )

  return (
    <React.Fragment>
      <div style={{ textAlign: 'center' }}>
        {!tx.hasOwnProperty('confirmed') && (
          <React.Fragment>
            <a className={classes.viewLink} href="" onClick={showModal}>
              View Bridge Address
            </a>
          </React.Fragment>
        )}
        {tx.btcTxHash && (
          <ExternalLink
            className={classes.viewLink}
            href={`https://sochain.com/tx/BTC/${tx.btcTxHash}`}
          >
            View BTC TX
          </ExternalLink>
        )}
        {tx.ethTxHash && (
          <ExternalLink
            className={classes.viewLink}
            href={'https://etherscan.io/tx/' + tx.ethTxHash}
          >
            View ETH TX
          </ExternalLink>
        )}
        {(tx.confirmed || isConfirmed) && !tx.ethTxHash && (
          <React.Fragment>
            {!isLoading[tx.btcTxHash] ? (
              <Button
                size="xs"
                onClick={() => {
                  callProofOpReturnAndMint(
                    tx,
                    handleLoading,
                    account,
                    vbtcContract,
                    vbtc,
                  )
                }}
              >
                Claim vBTC & $TRDL
              </Button>
            ) : (
              <a className={classes.viewLink} href="">
                Loading
              </a>
            )}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  )
}

export default ConversionActions
