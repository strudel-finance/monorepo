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
        {tx.awaiting === 'btc-init' ? (
          <span>{`Waiting for BTC to be sent`}</span>
        ) : null}
        {tx.awaiting === 'btc-settle' ? (
          <span>
            BTC transaction confirming (
            {tx.confirmations === undefined || tx.confirmations < 0
              ? '...'
              : tx.confirmations}
            /{targetBtcConfs} complete)
          </span>
        ) : null}
        {!tx.awaiting ? <span>{`Complete`}</span> : null}
      </ReddishTextTypography>
    </React.Fragment>
  )
}
export default ConversionStatus
/*
{tx.awaiting === 'eth-init' ? (
  <span>{`Submit to Ethereum`}</span>
) : null}
{tx.awaiting === 'eth-settle' ? (
  <span>
    {tx.error ? `Submit to Ethereum` : `Submitting to Ethereum`}
  </span>
) : null}
*/
