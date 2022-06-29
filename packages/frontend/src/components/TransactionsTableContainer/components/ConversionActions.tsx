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
import {
  getHarmonyRelayContract,
  getHarmonyVbtcContract,
  // getRelayContract,
  getVbchContract,
  getVbtcContract,
  proofOpReturnAndMint,
  proofOpReturnAndMintBCH,
  proofOpReturnAndMintHarmony,
} from '../../../tokens/utils'
import showError, { handleErrors } from '../../../utils/showError'
import showInfo from '../../../utils/showInfo'

import RollbarErrorTracking from '../../../errorTracking/rollbar'
import { useLocation } from 'react-router'
import { 
  VbtcContract ,
  HarmonyVbtcContract, 
} from '../../../tokens/lib/contracts.types'
import { Vbtc } from '../../../tokens'
import useETH from '../../../hooks/useETH'
import { Vbch } from '../../../tokens/Vbch'
import useVBCH from '../../../hooks/useVBCH'
import useBridge from '../../../hooks/useBridge'
// import ERC20Abi from '../../../tokens/lib/abi/erc20.json'
// import { contractAddresses } from '../../../tokens/lib/constants'
import Web3 from 'web3'
// import Modal from '../../Modal'
// import AccountModal from '../../TopBar/components/AccountModal'
import NetworkModal from './NetworkModal'
import { changeEndian } from '../../../utils/changeEndian'
import formatAddress from '../../../utils/formatAddress'

const useStyles = makeStyles((theme) => ({
  viewLink: {
    fontSize: 14,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))
interface pushEthParam {
  ethTxHash: string,
  blockchainNetworkId: string, 
}

const pushEthTxHash = async (
  ethParam: pushEthParam,
  tx: BTCTransaction | BCHTransaction,
  coin: 'BTC' | 'BCH',
): Promise<Response> => {
  const url =
    apiServer +
    '/payment/' +
    (coin === 'BTC'
      ? (tx as BTCTransaction).btcTxHash
      : (tx as BCHTransaction).bchTxHash) +
    '/output/' +
    tx.burnOutputIndex +
    '/addEthTx'

  // console.log("payload url");
  // console.log(url); 

  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(ethParam),
  }

  // console.log("payload json");
  // console.log(opts);

  return fetch(url, opts)
}

const getProof = async (
  tx_data: string,
  tx_hash: string,
  block_hash: string,
): Promise<Response> => {
  // console.log("block_hash");
  // console.log(block_hash);
  
  const url = apiServer + '/proof/' + tx_hash + '/' + block_hash
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txData: tx_data }),
  }

  return fetch(url, opts)
}

const getRawTx = (tx_hash: string): Promise<Response> => {
  const url = `https://api.fullstack.cash/v4/rawtransactions/getRawTransaction/${tx_hash}?verbose=false`
  return fetch(url)
}

const getProofBCH = (
  rawTx: string,
  tx_hash: string,
  block_hash: string,
): Promise<Response> => {
  const url = apiServer + '/bch/proof/' + tx_hash + '/' + block_hash
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

const callProofHelperHarmony = async (
  height: string,
  proof: Proof,
  burnOutputIndex: number,
  account: string,
  harmonyVbtcContract: HarmonyVbtcContract,
): Promise<string> => {
  return await proofOpReturnAndMintHarmony(
    height,
    harmonyVbtcContract,
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
    xDaiBridgeContract,
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
  blockchainNetworkId: string,
) => {
  try {
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
            'proof fet` ching problem' + e.message,
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
      // console.log("vbtcContract");
      // console.log(vbtcContract);

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
      // Is this necessary?
      tx.ethTxHash = ethTxHash.transactionHash

      await pushEthTxHash({ ethTxHash: ethTxHash.transactionHash, blockchainNetworkId }, tx, 'BTC')
        .then(handleErrors)
        .catch((e) => {
          RollbarErrorTracking.logErrorInRollbar(
            'Problem pushing ETH tx hash to DB: ' + e.message,
          )
          showError('Problem pushing ETH tx hash to DB: ' + e.message)
        })
    }
  } catch (error) {
    // Without this, app halts
    alert(error);
  }
}

const callProofOpReturnAndMintHarmony = async (
  height: string,
  tx: BTCTransaction,
  handleLoading: (ls: LoadingStatus) => void,
  account: string,
  harmonyVbtcContract: HarmonyVbtcContract,
  vbtc: Vbtc,
  blockHash: string,
  tx_hex: string,
  blockchainNetworkId: string,
) => {
  // alert("callProofOpReturnAndMintHarmony");

  try {
    let loadingStatus = { tx: tx.btcTxHash, status: true }
    handleLoading(loadingStatus) // Shows loading
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

    let ethTxHash = await callProofHelperHarmony(
      height,
      proof,
      Number(tx.burnOutputIndex),
      account,
      harmonyVbtcContract,
    ).catch((e) => {
      RollbarErrorTracking.logErrorInRollbar(e.message)
      showError(e.message)
      return undefined
    })

    if (ethTxHash === undefined) {
      // The user rejected vBTC -> BTC at the metamask or another wallet
      // and it shows the error with react toaster
      handleLoading(loadingStatus)
      return;
    }

    handleLoading(loadingStatus)

    showInfo(`vBTC and $TRDL were minted at Harmony mainnet (${formatAddress(ethTxHash.transactionHash)}), please wait until you see 'Complete on Harmony' status`, "bottom-right", 6000)

    // alert("ethTxHash");
    // alert(ethTxHash); // object
    // alert(ethTxHash.transactionHash);
    // alert((ethTxHash !== undefined &&
    //   ethTxHash.transactionHash !== undefined &&
    //   (await waitForTxReceipt(ethTxHash.transactionHash, vbtc))) === 1);

    if (
      (ethTxHash !== undefined &&
        ethTxHash.transactionHash !== undefined &&
        (await waitForTxReceipt(ethTxHash.transactionHash, vbtc))) === 1
    ) {
      // Is this necessary?
      tx.ethTxHash = ethTxHash.transactionHash;

      // alert(`ethTxHash.transactionHash is ${ethTxHash.transactionHash}`);
      // alert("pushEthTxHash") // Worked until this
      // console.log("{ ethTxHash, blockchainNetworkId }, tx, 'BTC'");
      // console.log({
      //   ethTxHash,
      //   blockchainNetworkId,
      //   tx,
      //   BTC: "BTC",
      // });

      showInfo("We are about to save your tx to the Harmony BTC to vBTC bridge, please contact Strudel team if you had any issue.")

      // Should be ethTxHash: ethTxHash.transactionHash instead also?
      // or use ethTxHash instead

      // export const handleErrors = (response: any) => {
      //   if (!response.ok) {
      //     throw Error(response.status)
      //   }
      //   return response
      // }

      const response = await pushEthTxHash({ ethTxHash: ethTxHash.transactionHash, blockchainNetworkId }, tx, 'BTC')
      if (response.ok) {
        showInfo(`We saved your tx ${formatAddress(ethTxHash.transactionHash)} to the Harmony BTC to vBTC bridge`)
        return
      }

      // @ts-ignore
      const error = Error(response.status);
      
      RollbarErrorTracking.logErrorInRollbar(
        'Problem pushing Harmony tx hash to DB: ' + error.message, // Showed this error
        )
      showError(`Problem pushing Harmony tx hash to DB: ${error.message}`)
      showError("vBTC and $TRDL were minted ok, but please contact $TRDL team to save your tx to BTC to vBTC bridge")

      // transactionHash
      // Use ethTxHash.transactionHash instead of ethTxHash here
      // const response = await pushEthTxHash({ ethTxHash: ethTxHash.transactionHash, blockchainNetworkId }, tx, 'BTC')
      // await pushEthTxHash({ ethTxHash: ethTxHash.transactionHash, blockchainNetworkId }, tx, 'BTC')
      //   .then(handleErrors)
      //   .catch((e) => {
      //     RollbarErrorTracking.logErrorInRollbar(
      //       'Problem pushing Harmony tx hash to DB: ' + e.message, // Showed this error
      //     )
      //     showError('Problem pushing Harmony tx hash to DB: ' + e.message)
      //   })

    }
  } catch (error) {
    // TypeError: Cannot read properties of undefined(reading 'transactionHash')
    alert(error);
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

  blockchainNetworkId: string,
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

  const web3 = new Web3(process.env.REACT_APP_BSC_PROVIDER)

  handleLoading(loadingStatus)
  if (
    (ethTxHash !== undefined &&
      ethTxHash.transactionHash !== undefined &&
      (await waitForTxReceipt(ethTxHash.transactionHash, { web3 } as any))) === 1
  ) {
    // do things
    tx.ethTxHash = ethTxHash.transactionHash

    await pushEthTxHash({ ethTxHash: ethTxHash.transactionHash, blockchainNetworkId }, tx, 'BCH')
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
  const blockchainNetworkId: string = tx.blockchainNetworkId || (window as any).ethereum?.networkVersion
  let onWhichBlockchain: string;
  let blockchainExplorer: string;
  if (blockchainNetworkId === "1") {
    onWhichBlockchain = 'ETH'
    blockchainExplorer = 'https://etherscan.io'
  }
  else if (blockchainNetworkId === "56") {
    onWhichBlockchain = 'BSC';
    blockchainExplorer = 'https://bscscan.com'
  }
  else if (blockchainNetworkId === "1666600000") {
    onWhichBlockchain = 'Harmony';
    blockchainExplorer = 'https://explorer.harmony.one'
  }

  const { eth } = useETH()
  const vbtc = useVBTC()
  const vbch = useVBCH()
  const bridgeContract = useBridge()
  const vbchContract = getVbchContract(vbch)
  
  const vbtcContract: VbtcContract = getVbtcContract(vbtc)

  const harmonyVbtcContract: HarmonyVbtcContract = getHarmonyVbtcContract(vbtc);

  const coin: 'BTC' | 'BCH' = useLocation().pathname.slice(1) as 'BTC' | 'BCH'
  
  // This should be 7 for Harmony relayer?
  const targetConfs = 6

  const BSC_NETWORK_ID = 56

  const [onPresentBurn, onDismiss] = useModal(<NetworkModal />)

  let isConfirmed = false
  if (confirmation && confirmation.hasOwnProperty('confirmations')) {
    isConfirmed = confirmation.confirmations >= targetConfs
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

  const showQR = (e: any) => {
    e.preventDefault()
    showModal()
  }

  return (
    <React.Fragment>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {!tx.hasOwnProperty('confirmed') && (
          <React.Fragment>
            <a
              href=""
              onClick={(e) => {
                showQR(e)
              }}
            >
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
            href={`${blockchainExplorer}/tx/${tx.ethTxHash}`}
          >
            View {onWhichBlockchain} TX
          </ExternalLink>
        )}
        {(tx.confirmed || isConfirmed) &&
          !tx.ethTxHash &&
          confirmation.isRelayed && (
            <React.Fragment>
              {!isLoading[tx.btcTxHash] ? (
                (() => {
                  if (coin === 'BTC') {
                    // ETH Mainnet
                    if (blockchainNetworkId === "1") {
                      return (
                        <Button
                          size="xs"
                          onClick={() => {
                            // alert("ETH callProofOpReturnAndMint");
                            callProofOpReturnAndMint(
                              tx,
                              handleLoading,
                              eth?.account,
                              vbtcContract,
                              vbtc,
                              confirmation.blockHash,
                              confirmation.tx_hex,
                              blockchainNetworkId,
                            )
                          }}
                        >
                          Claim v{coin} & $TRDL
                        </Button>
                      )
                    }

                    // Harmony Mainnet
                    if (blockchainNetworkId === "1666600000") {
                      return (
                        <Button
                          size="xs"
                          onClick={async () => {
                            // console.log("Harmony vBTC & $STRDL");
                            // console.log(tx);
                            // console.log(eth?.account);
                            // console.log(vbtcContract);
                            // console.log(vbtc);
                            // console.log(confirmation.blockHash); // You can find height with this
                            // console.log(confirmation.tx_hex);
                            
                            showInfo("vBTC and $TRDL mint started at Harmony, please confirm and wait at this page until you see 'Complete on Harmony' status")
                            // showInfo("vBTC and Strudel were minted at Harmony, please wait until you see 'Complete on Harmony' and 'View Harmony TX'")
                            // showInfo("We are about to save your tx for the Harmony BTC to vBTC bridge, please contact Strudel team if you had any issue.", "bottom-right", 6000)

                            let blockHashLittle = '0x' + changeEndian(confirmation.blockHash)
                            const harmonyRelayContract = getHarmonyRelayContract(vbtc)
                            const height = await harmonyRelayContract.methods.getBlockHeight(blockHashLittle).call()

                            callProofOpReturnAndMintHarmony(
                              height,
                              tx,
                              handleLoading,
                              eth?.account,
                              harmonyVbtcContract,
                              vbtc,
                              confirmation.blockHash,
                              confirmation.tx_hex,
                              blockchainNetworkId,
                            )

                          }}
                        >
                          Claim v{coin} & $TRDL
                        </Button>
                      )
                    }

                    return (<Button
                     size="xs"
                    >
                      Claim vBTC on ETH mainnet
                    </Button>);
                  }

                  if (coin === 'BCH') {
                    if (eth.provider.networkVersion == BSC_NETWORK_ID) {
                      return (
                        <Button
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
                              blockchainNetworkId,
                            )
                          }}
                        >
                          Claim v{coin} & $TRDL
                        </Button>
                      )
                    }

                    return (
                      <Button size="xs" onClick={onPresentBurn}>
                        Claim vBCH on BSC
                      </Button>
                    )
                  }
                })()
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