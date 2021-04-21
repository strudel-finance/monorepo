import React from 'react'
import vbtc from '../../assets/img/Strudel-logo-Icon.png'
import Gtrdl from '../../assets/img/g14.png'
import Timer from '../../assets/img/timer-icon-15.png'
interface StrudelIconProps {
  size?: number
  v1?: boolean
}
export const StrudelIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={vbtc} height={size} />
)

export const GStrudelIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={Gtrdl} height={size} />
)

export const TimerIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={Timer} height={size} />
)
