// eslint-disable jsx-a11y/anchor-is-valid

import {makeStyles} from '@material-ui/core'
import React from 'react'

import {Transaction} from '../TransactionsTableContainer'
import {ExternalLink} from './ExternalLink'

import useModal from '../../../hooks/useModal'
import BurnModal from '../../../views/Home/components/BurnModal'

const useStyles = makeStyles((theme) => ({
  viewLink: {
    fontSize: 12,
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
    'https://j3x0y5yg6c.execute-api.eu-west-1.amazonaws.com/production/payment/' +
    tx.btcTxHash +
    '/output/' +
    tx.outputIndex +
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

const proofOpReturnAndMint = async (tx: Transaction) => {
  const txHash = await new Promise<string>((res, rej) => {
    res('0x89AB6D3C799d35f5b17194Ee7F07253856A67949')
  })
  tx.ethTxHash = txHash

  // post call to server with ethTxHash, in the beginning this will have no error handling if the post goes wrong
  // to be replaced with subgraph
  //tx.ethAddress
  /*
  // Example POST method implementation:
  async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  postData('https://example.com/answer', { answer: 42 })
    .then(data => {
      console.log(data); // JSON data parsed by `data.json()` call
    });
  */
  //

  console.log('click')
}

interface Props {
  tx: Transaction
  confirmation?: number
}

const ConversionActions: React.FC<Props> = ({tx, confirmation}) => {
  const targetBtcConfs = 6
  const isConfirmed = confirmation >= targetBtcConfs
  const classes = useStyles()
  const [showModal] = useModal(
    <BurnModal value={tx.value} address={tx.ethAddress} continueV={true} />,
  )
  return (
    <React.Fragment>
      <div>
        {!tx.hasOwnProperty('confirmed') && (
          <React.Fragment>
            <a className={classes.viewLink} onClick={showModal}>
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
            <a
              className={classes.viewLink}
              onClick={() => {
                proofOpReturnAndMint(tx)
              }}
            >
              Claim vBTC
            </a>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  )
}

export default ConversionActions
