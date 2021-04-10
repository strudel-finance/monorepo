import sb from 'satoshi-bitcoin'

export const urlAssembler = (
  coin: 'bitcoin' | 'bitcoincash',
  address: string,
  value: string | number,
) => {
  if (coin === 'bitcoincash')
    return `bitcoincash:?r=${
      process.env.REACT_APP_API_URL
    }/bch/syn/${address}/${sb.toSatoshi(value).toString()}`
  if (coin === 'bitcoin')
    return `bitcoin:?r=${
      process.env.REACT_APP_API_URL
    }/syn/${address}/${sb.toSatoshi(value).toString()}`
}
