import React from 'react'
import bitcoin from '../../assets/img/Bitcoin.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}

const BitcoinIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={bitcoin} height={size} />
)

export default BitcoinIcon
