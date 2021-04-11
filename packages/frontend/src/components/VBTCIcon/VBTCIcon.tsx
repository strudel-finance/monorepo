import React from 'react'
import vbtc from '../../assets/img/Strudel-Bitcoin-Icon.png'
import vbch from '../../assets/img/Strudel-BitcoinCash-Icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}

const VBTCIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbtc} alt="vBTC Icon" height={size} />
)

const VBCHIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbch} alt="vBCH Icon" height={size} />
)

export default { VBTCIcon, VBCHIcon }
