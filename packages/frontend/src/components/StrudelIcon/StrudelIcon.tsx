import React from 'react'
import Strudel from '../../assets/img/Strudel-logo-Icon.png'
import Gtrdl from '../../assets/img/g14.png'
import Timer from '../../assets/img/timer-icon-15.png'
import StrudelB from '../../assets/img/Strudel-Binance-Icon.png'
import StrudelETH from '../../assets/img/Strudel-Etherium-Icon.png'
interface StrudelIconProps {
  size?: number
  v1?: boolean
}
export const StrudelIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={Strudel} height={size} />
)

export const GStrudelIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={Gtrdl} height={size} />
)

export const TimerIcon: React.FC<StrudelIconProps> = ({ size = 60, v1 }) => (
  <img src={Timer} height={size} />
)

export const StrudelBinance: React.FC<StrudelIconProps> = ({
  size = 60,
  v1,
}) => <img src={StrudelB} height={size} />

export const StrudelMainnet: React.FC<StrudelIconProps> = ({
  size = 60,
  v1,
}) => <img src={StrudelETH} height={size} />
