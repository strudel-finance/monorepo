// eslint-disable jsx-a11y/anchor-is-valid

import {makeStyles} from '@material-ui/core'
import React from 'react'

import {Transaction} from '../TransactionsTableContainer'
import {ExternalLink} from './ExternalLink'

const useStyles = makeStyles((theme) => ({
  viewLink: {
    fontSize: 12,
    marginRight: theme.spacing(1),
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))

interface Props {
  tx: Transaction
}

export const ConversionActions: React.FC<Props> = ({tx}) => {
  const classes = useStyles()
  const {
    setShowGatewayModal,
    setGatewayModalTx,
    setShowCancelModal,
    setCancelModalTx,
  } = Store.useContainer()
  const {
    completeConvertToEthereum,
    initConvertFromEthereum,
    removeTx,
  } = TransactionStore.useContainer()

  const direction = tx.destNetwork === 'ethereum' ? 'in' : 'out'

  return (
    <React.Fragment>
      <div>
        {tx.btcTxHash && (
          <ExternalLink
            className={classes.viewLink}
            href={`https://sochain.com/tx/BTC/${tx.btcTxHash}`}
          >
            View BTC TX
          </ExternalLink>
        )}
        {direction === 'in' && tx.destTxHash ? (
          <ExternalLink
            className={classes.viewLink}
            href={
              'https://' +
              (tx.destNetworkVersion === 'testnet' ? 'kovan.' : '') +
              'etherscan.io/tx/' +
              tx.destTxHash
            }
          >
            View ETH TX
          </ExternalLink>
        ) : null}
        {direction === 'in' && tx.awaiting === 'btc-init' && !tx.error && (
          <React.Fragment>
            <a
              className={classes.viewLink}
              onClick={() => {
                // view modal
                setShowGatewayModal(true)
                setGatewayModalTx(tx.id)
              }}
            >
              View Gateway Address
            </a>
            <a
              className={classes.viewLink}
              onClick={() => {
                // are you sure modal
                setShowCancelModal(true)
                setCancelModalTx(tx.id)
              }}
            >
              Cancel
            </a>
          </React.Fragment>
        )}

        {direction === 'out' && tx.sourceTxHash ? (
          <ExternalLink
            className={classes.viewLink}
            href={
              'https://' +
              (tx.sourceNetworkVersion === 'testnet' ? 'kovan.' : '') +
              'etherscan.io/tx/' +
              tx.sourceTxHash
            }
          >
            View ETH TX
          </ExternalLink>
        ) : null}
        {direction === 'out' && !tx.awaiting && tx.destAddress && (
          <ExternalLink
            className={classes.viewLink}
            href={`https://sochain.com/address/BTC${
              tx.destNetworkVersion === 'testnet' ? 'TEST' : ''
            }/${tx.destAddress}`}
          >
            View BTC TX
          </ExternalLink>
        )}

        {((tx.error && tx.awaiting === 'eth-settle') ||
          tx.awaiting === 'eth-init') && (
          <React.Fragment>
            <a
              className={classes.viewLink}
              onClick={() => {
                if (direction === 'out') {
                  initConvertFromEthereum(tx)
                } else {
                  completeConvertToEthereum(tx)
                }
              }}
            >
              Submit
            </a>
            {direction === 'out' && (
              <a
                className={classes.viewLink}
                onClick={() => {
                  removeTx(tx)
                }}
              >
                Cancel
              </a>
            )}
          </React.Fragment>
        )}

        {!tx.awaiting && !tx.error && (
          <a
            className={classes.viewLink}
            onClick={() => {
              removeTx(tx)
            }}
          >
            Clear
          </a>
        )}

        {direction === 'out' && tx.error && tx.sourceTxHash && (
          <a
            className={classes.viewLink}
            onClick={() => {
              removeTx(tx)
            }}
          >
            Clear
          </a>
        )}
      </div>
    </React.Fragment>
  )
}
