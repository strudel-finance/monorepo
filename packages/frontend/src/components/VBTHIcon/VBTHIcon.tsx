import React from 'react'
import vbth from '../../assets/img/Strudel-BitcoinCash-Icon.png'
import vbthBinance from '../../assets/img/Strudel-BitcoinCash-Binance-Icon.png'
import vbthEthereum from '../../assets/img/Strudel-BitcoinCash-Etherium-Icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean,
  fromBinance?: boolean,
  fromEthereum?: boolean
}

const VBTHIcon: React.FC<StrudelIconProps> = ({ size = 60, v1, fromBinance, fromEthereum }) => (
  <img src={fromBinance ? vbthBinance : fromEthereum ? vbthEthereum : vbth} alt="vBTC Icon" height={size} />
)

export default VBTHIcon
