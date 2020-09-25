import Typography from '@material-ui/core/Typography'
import React from 'react'

import {Transaction, ReddishTextTypography} from '../TransactionsTableContainer'

interface Props {
  tx: Transaction
}

const ConversionStatus: React.FC<Props> = ({tx}) => {
  const targetBtcConfs = 6
  return (
    <React.Fragment>
      <ReddishTextTypography variant="caption">
        {!tx.hasOwnProperty('confirmed') ? (
          <span>{`Waiting for BTC to be sent`}</span>
        ) : null}
        {tx.hasOwnProperty('confirmed') && !tx.confirmed ? (
          <span>
            BTC transaction confirming (
            {tx.confirmations === undefined || tx.confirmations < 0
              ? '...'
              : tx.confirmations}
            /{targetBtcConfs} complete)
          </span>
        ) : null}
        {tx.hasOwnProperty('confirmed') && tx.confirmed && !tx.ethTxHash ? (
          <span>Submit to Ethereum</span>
        ) : null}
        {tx.hasOwnProperty('confirmed') && tx.confirmed && tx.ethTxHash ? (
          <span>{`Complete`}</span>
        ) : null}
      </ReddishTextTypography>
    </React.Fragment>
  )
}
export default ConversionStatus
