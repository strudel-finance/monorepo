import React from 'react'
import vbtc from '../../assets/img/Strudel-Bitcoin-Icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}

const VBTCIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbtc} alt="vBTC Icon" height={size} />
)

export default VBTCIcon
