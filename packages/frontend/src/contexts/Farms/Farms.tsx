import React, {useState} from 'react'

import {useWallet} from 'use-wallet'
import useVBTC from '../../hooks/useVBTC'

import { getFarms } from '../../bridgeTokens/utils'

import Context from './context'

const Farms: React.FC = ({children}) => {
  const [unharvested, setUnharvested] = useState(0)

  const vbtc = useVBTC()

  const farms = getFarms(vbtc)

  return (
    <Context.Provider
      value={{
        farms,
        unharvested,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default Farms
