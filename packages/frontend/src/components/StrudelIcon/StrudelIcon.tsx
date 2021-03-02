import React from 'react'
import vbtc from '../../assets/img/Strudel-logo-Icon.png'

interface StrudelIconProps {
  size?: number
  v1?: boolean
}
const StrudelIcon: React.FC<StrudelIconProps> = ({size = 60, v1}) => (
  <img src={vbtc} height={size} />
)

export default StrudelIcon
