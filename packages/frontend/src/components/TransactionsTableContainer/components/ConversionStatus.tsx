import { ReddishTextTypography } from '../TransactionsTableContainer'
import React from 'react'
import { useLocation } from 'react-router'
import { BTCTransaction, Confirmation } from '../../../types/types'

interface Props {
  tx: BTCTransaction
  confirmations?: Confirmation
}

const ConversionStatus: React.FC<Props> = ({ tx, confirmations }) => {
  const coin: 'BTC' | 'BCH' = useLocation().pathname.slice(1) as 'BTC' | 'BCH'
  const targetConfs = 6
  let isConfirmed = false
  let confirmation = undefined

  console.log(tx, confirmations, 'tx, confirmations')
  
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
        {tx.hasOwnProperty('confirmed') &&
          !tx.confirmed &&
          !isConfirmed &&
          confirmations && (
            <span>
              {coin} transaction confirming (
              {!confirmation ? '0' : confirmation}/{targetConfs} complete)
            </span>
          )}
        {tx.hasOwnProperty('confirmed') && confirmations == null && (
          <div className="loading">Fetching data</div>
        )}
        {tx.hasOwnProperty('confirmed') &&
          isConfirmed &&
          !tx.ethTxHash &&
          confirmations.isRelayed && <span>Submit to Ethereum</span>}
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
