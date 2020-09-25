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

const proofOpReturnAndMint = async (tx: Transaction) => {
  const txHash = await new Promise<string>((res, rej) => {
    res('0x89AB6D3C799d35f5b17194Ee7F07253856A67949')
  })
  tx.ethTxHash = txHash
  // call to server
  //
  console.log('click')
}

interface Props {
  tx: Transaction
}

const ConversionActions: React.FC<Props> = ({tx}) => {
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
        {tx.confirmed && !tx.ethTxHash && (
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
