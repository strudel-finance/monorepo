import sb from 'satoshi-bitcoin'
import { apiServer } from '../constants/backendAddresses'

export const urlAssembler = (
  coin: 'bitcoin' | 'bitcoincash',
  address: string,
  value: string | number,
) => {
  if (coin === 'bitcoincash')
    return `bitcoincash:?r=${
      apiServer
    }/bch/syn/${address}/${sb.toSatoshi(value).toString()}`

    
  if (coin === 'bitcoin')
    return `bitcoin:?r=${
      apiServer
    }/syn/${address}/${sb.toSatoshi(value).toString()}`
}
