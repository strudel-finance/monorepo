// eslint-disable jsx-a11y/anchor-is-valid

import { makeStyles } from '@material-ui/core'
import React from 'react'
import { ExternalLink } from './ExternalLink'
import {
  Proof,
  BTCTransaction,
  LoadingStatus,
  Confirmation,
  BCHTransaction,
} from '../../../types/types'
import useModal from '../../../hooks/useModal'
import { apiServer } from '../../../constants/backendAddresses'

import BurnModal from '../../../views/Home/components/BurnModal'
import Button from '../../Button'

import useVBTC from '../../../hooks/useVBTC'
import { getVbchContract, getVbtcContract, proofOpReturnAndMint, proofOpReturnAndMintBCH } from '../../../tokens/utils'
import showError, { handleErrors } from '../../../utils/showError'
import RollbarErrorTracking from '../../../errorTracking/rollbar'
import { useLocation } from 'react-router'
import { VbtcContract } from '../../../tokens/lib/contracts.types'
import { Vbtc } from '../../../tokens'
import useETH from '../../../hooks/useETH'
import { Vbch } from '../../../tokens/Vbch'
import useVBCH from '../../../hooks/useVBCH'
import useBridge from '../../../hooks/useBridge'
import ERC20Abi from '../../../tokens/lib/abi/erc20.json'
import { contractAddresses } from '../../../tokens/lib/constants'
import Web3 from 'web3'
const XDAI_NETWORK_ID = 100

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
  tx: BTCTransaction | BCHTransaction,
  coin: 'BTC' | 'BCH',
): Promise<Response> => {
  const url =
    process.env.REACT_APP_API_URL +
    '/payment/' +
    (coin === 'BTC'
      ? (tx as BTCTransaction).btcTxHash
      : (tx as BCHTransaction).bchTxHash) +
    '/output/' +
    tx.burnOutputIndex +
    '/addEthTx'

  console.log(url, 'urlurlurlurl')

  console.log(
    JSON.stringify(ethParam),
    'JSON.stringify(ethParam)JSON.stringify(ethParam)',
  )

  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(ethParam),
  }

  console.log(url, 'urlurlurlurl')

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

const getRawTx = (tx_hash: string): Promise<Response> => {
  const url = `https://api.fullstack.cash/v4/rawtransactions/getRawTransaction/${tx_hash}?verbose=false`
  return fetch(url)
}

const  getProofBCH = (
  rawTx: string,
  tx_hash: string,
  block_hash: string,
): Promise<Response> => {
  const url = apiServer + '/production/bch/proof/' + tx_hash + '/' + block_hash
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({ txData: rawTx }),
  }
  return fetch(url, opts)
}

const callProofHelper = async (
  proof: Proof,
  burnOutputIndex: number,
  account: string,
  vbtcContract: VbtcContract,
): Promise<string> => {
  return await proofOpReturnAndMint(
    vbtcContract,
    account,
    proof,
    burnOutputIndex,
  )
}

const callProofHelperBCH = async (
  proof: Proof,
  burnOutputIndex: number,
  account: string,
  // !!! TODO: type
  vbchContract: any,
  //TYPE
  xDaiBridgeContract: VbtcContract,
): Promise<string> => {
  return await proofOpReturnAndMintBCH(
    vbchContract,
    account,
    proof,
    burnOutputIndex,
    xDaiBridgeContract
  )
}

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

const waitForTxReceipt = async (
  transactionHash: string,
  vCoin: Vbtc | Vbch,
): Promise<number> => {
  const expectedBlockTime = 1000
  let transactionReceipt = null
  while (transactionReceipt == null) {
    console.log(vCoin);
    
    // Waiting expectedBlockTime until the transaction is mined
    transactionReceipt = await vCoin.web3.eth
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
  tx: BTCTransaction,
  handleLoading: (ls: LoadingStatus) => void,
  account: string,
  vbtcContract: VbtcContract,
  vbtc: Vbtc,
  blockHash: string,
  tx_hex: string,
) => {
  let loadingStatus = { tx: tx.btcTxHash, status: true }
  handleLoading(loadingStatus)
  loadingStatus.status = false
  let proof

  if (!tx.hasOwnProperty('proof')) {
    //TODO: add confirmations
    proof = await getProof(tx_hex, tx.btcTxHash, blockHash)
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

    await pushEthTxHash({ ethTxHash }, tx, 'BTC')
      .then(handleErrors)
      .catch((e) => {
        RollbarErrorTracking.logErrorInRollbar(
          'Problem pushing ETH to DB: ' + e.message,
        )
        showError('Problem pushing ETH to DB: ' + e.message)
      })
  }
}

const callProofOpReturnAndMintBCH = async (
  tx: BCHTransaction,
  handleLoading: (ls: LoadingStatus) => void,
  account: string,
  // !!! TODO: type !!!
  vbchContract: any,
  vbch: Vbch,
  blockHash: string,
  bridge: VbtcContract,
) => {
  let loadingStatus = { tx: tx.bchTxHash, status: true }
  handleLoading(loadingStatus)
  loadingStatus.status = false
  let proof
  
  if (!tx.hasOwnProperty('proof')) {
    //TODO: add confirmations

    const rawTx = await getRawTx(tx.bchTxHash)
      .then(handleErrors)
      .then((response1) => response1.json())
      .catch((e) => {
        RollbarErrorTracking.logErrorInRollbar(
          'proof fetching problem' + e.message,
        )
        showError('Problem fetching proof: ' + e.message)
        return undefined
      })

    proof = await getProofBCH(rawTx, tx.bchTxHash, blockHash)
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

  let ethTxHash = await callProofHelperBCH(
    proof,
    Number(tx.burnOutputIndex),
    account,
    vbchContract,
    bridge,
  ).catch((e) => {
    RollbarErrorTracking.logErrorInRollbar(e.message)
    showError(e.message)
    return undefined
  })

  const web3 = new Web3(process.env.REACT_APP_XDAI_PROVIDER)


  handleLoading(loadingStatus)
  if (
    (ethTxHash !== undefined &&
      ethTxHash.transactionHash !== undefined &&
      (await waitForTxReceipt(ethTxHash.transactionHash, {web3} as any))) === 1
  ) {
    // do things
    tx.ethTxHash = ethTxHash.transactionHash

    console.log(ethTxHash, 'ethTxHashethTxHashethTxHashethTxHash')

    await pushEthTxHash({ ethTxHash: ethTxHash.transactionHash }, tx, 'BCH')
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
  // !! TODO
  tx: any
  // BTCTransaction | BCHTransaction
  confirmation?: Confirmation
  handleLoading?: (ls: LoadingStatus) => void
  isLoading?: any
}

const ConversionActions: React.FC<Props> = ({
  tx,
  confirmation,
  handleLoading,
  isLoading,
}) => {  
  const { eth } = useETH()
  const vbtc = useVBTC()
  const vbch = useVBCH()
  const bridgeContract = useBridge()
  const vbchContract = getVbchContract(vbch)
  const vbtcContract = getVbtcContract(vbtc)
  const coin = useLocation().pathname.slice(1)
  
  const targetBtcConfs = 6
  let isConfirmed = false
  if (confirmation && confirmation.hasOwnProperty('confirmations')) {
    isConfirmed = confirmation.confirmations >= targetBtcConfs
  }
  const classes = useStyles()
  const [showModal] = useModal(
    <BurnModal
      value={tx.value}
      address={tx.ethAddress}
      continueV={true}
      coin={coin === 'BTC' ? 'bitcoin' : 'bitcoincash'}
    />,
  )

  return (
    <React.Fragment>
      <div style={{
        textAlign: 'center',
        display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center', }}>
        {!tx.hasOwnProperty('confirmed') && (
          <React.Fragment>
            <a href="" onClick={showModal}>
              View Bridge Address
            </a>
          </React.Fragment>
        )}
        {(tx.btcTxHash || tx.bchTxHash) && (
          <ExternalLink
            className={classes.viewLink}
            href={
              coin === 'BTC'
                    ? `https://sochain.com/tx/BTC/${tx.btcTxHash}`
                : `https://explorer.bitcoin.com/bch/tx/${tx.bchTxHash}`
            }
          >
            View {coin} TX
          </ExternalLink>
        )}
        {tx.ethTxHash && (
          <ExternalLink
            className={classes.viewLink}
            href={
              coin === 'BTC'
                    ? `https://etherscan.io/tx/${tx.ethTxHash}`
                : `https://blockscout.com/xdai/mainnet/tx/${tx.ethTxHash}`
            }
          >
            View ETH TX
          </ExternalLink>
        )}
        {(tx.confirmed || isConfirmed) &&
          !tx.ethTxHash &&
          confirmation.isRelayed && (
            <React.Fragment>
            {!isLoading[tx.btcTxHash] ?
             (() => {
            if(coin === 'BTC') {
               return (<Button
                  size="xs"
                  onClick={() => {
                    callProofOpReturnAndMint(
                          tx,
                          handleLoading,
                          eth?.account,
                          vbtcContract,
                          vbtc,
                          confirmation.blockHash,
                          confirmation.tx_hex,
                        )
                      
                  }}
                > 
                  Claim v{coin} & $TRDL
                </Button>) }

                if (coin === 'BCH') {
                  if(eth.provider.networkVersion == 100) {
                    return (<Button
                      size="xs"
                      onClick={() => {
                            callProofOpReturnAndMintBCH(
                              tx,
                              handleLoading,
                              eth?.account,
                              vbchContract,
                              vbch,
                              confirmation.blockHash,
                              bridgeContract.contract,
                            )
                      }}
                    >
                      Claim v{coin} & $TRDL
                      </Button>)
                }}

                return (<Button
                  size="xs"

                >
                  GO TO xDai
                  </Button>)

            })()
              : 
                <a className={classes.viewLink} href="">
                  Loading
                </a>
              }
            </React.Fragment>
          )}
      </div>
    </React.Fragment>
  )
}

export default ConversionActions
