import React from 'react'
import vbch from '../../assets/img/Strudel-BitcoinCash-Icon.png'
import vbchBinance from '../../assets/img/Strudel-BitcoinCash-Binance-Icon.png'
import vbchETH from '../../assets/img/Strudel-BitcoinCash-Etherium-Icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}

export const VBCHIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbch} alt="vBCH Icon" height={size} />
)

export const VBCHMainnet: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbchETH} alt="vBCH Icon" height={size} />
)

export const VBCHBinance: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbchBinance} alt="vBCH Icon" height={size} />
)
