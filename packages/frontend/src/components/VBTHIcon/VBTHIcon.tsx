import React from 'react'
import vbth from '../../assets/img/Strudel-BitcoinCash-Icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}

const VBTHIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbth} alt="vBTC Icon" height={size} />
)

export default VBTHIcon
