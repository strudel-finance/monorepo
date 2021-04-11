import React from 'react'
import bitcoin from '../../assets/img/Bitcoin.png'
import bitcoinCash from '../../assets/img/Bitcoin-Cash-BCH-icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}

const BitcoinIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={bitcoin} alt="Bitcoin Icon" height={size} />
)

const BitcoinCashIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={bitcoinCash} alt="BitcoinCash Icon" height={size} />
)

export default { BitcoinIcon, BitcoinCashIcon }
