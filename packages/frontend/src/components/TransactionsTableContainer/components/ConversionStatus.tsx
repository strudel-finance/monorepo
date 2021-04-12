import Typography from '@material-ui/core/Typography'
import React from 'react'
import { useLocation } from 'react-router'

import { BTCTransaction, Confirmation } from '../../../types/types'

import { ReddishTextTypography } from '../TransactionsTableContainer'

interface Props {
  tx: BTCTransaction
  confirmations?: Confirmation
}

const ConversionStatus: React.FC<Props> = ({ tx, confirmations }) => {
  const coin: 'BTC' | 'BCH' = useLocation().pathname.slice(1) as 'BTC' | 'BCH'
  const targetConfs = coin === 'BTC' ? 6 : 3
  let isConfirmed = false
  let confirmation = undefined
  if (confirmations && confirmations.hasOwnProperty('confirmations')) {
    isConfirmed = confirmations.confirmations >= targetConfs
    confirmation = confirmations.confirmations
  }

  return (
    <React.Fragment>
      <ReddishTextTypography variant="caption">
        {!tx.hasOwnProperty('confirmed') && (
          <span>{`Waiting for ${coin} to be sent`}</span>
        )}
        {tx.hasOwnProperty('confirmed') && !tx.confirmed && !isConfirmed ? (
          <span>
            {coin} transaction confirming ({!confirmation ? '0' : confirmation}/
            {targetConfs} complete)
          </span>
        ) : null}
        {tx.hasOwnProperty('confirmed') &&
        isConfirmed &&
        !tx.ethTxHash &&
        confirmations.isRelayed ? (
          <span>Submit to Ethereum</span>
        ) : null}
        {tx.hasOwnProperty('confirmed') &&
        isConfirmed &&
        !tx.ethTxHash &&
        !confirmations.isRelayed ? (
          <span>Waiting on Relayer</span>
        ) : null}
        {tx.hasOwnProperty('confirmed') &&
        (tx.confirmed || isConfirmed) &&
        tx.ethTxHash ? (
          <span>{`Complete`}</span>
        ) : null}
      </ReddishTextTypography>
    </React.Fragment>
  )
}
export default ConversionStatus
