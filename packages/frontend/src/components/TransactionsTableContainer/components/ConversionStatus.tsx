import Typography from '@material-ui/core/Typography'
import React from 'react'

import {Transaction} from '../../../types/types'

import {ReddishTextTypography} from '../TransactionsTableContainer'

interface Props {
  tx: Transaction
  confirmation?: number
}

const ConversionStatus: React.FC<Props> = ({tx, confirmation}) => {
  const targetBtcConfs = 6
  const isConfirmed = confirmation >= targetBtcConfs
  return (
    <React.Fragment>
      <ReddishTextTypography variant="caption">
        {!tx.hasOwnProperty('confirmed') ? (
          <span>{`Waiting for BTC to be sent`}</span>
        ) : null}
        {tx.hasOwnProperty('confirmed') && !tx.confirmed && !isConfirmed ? (
          <span>
            BTC transaction confirming (
            {confirmation === undefined || confirmation < 0
              ? '...'
              : confirmation}
            /{targetBtcConfs} complete)
          </span>
        ) : null}
        {tx.hasOwnProperty('confirmed') && isConfirmed && !tx.ethTxHash ? (
          <span>Submit to Ethereum</span>
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
