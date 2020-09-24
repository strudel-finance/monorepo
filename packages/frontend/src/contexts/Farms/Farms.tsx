import React, {useCallback, useEffect, useState} from 'react'

import {useWallet} from 'use-wallet'
import useVBTC from '../../hooks/useVBTC'

import {bnToDec} from '../../utils'
import {getMasterChefContract, getEarned} from '../../vbtc/utils'
import {getFarms} from '../../vbtc/utils'

import Context from './context'
import {Farm} from './types'

const Farms: React.FC = ({children}) => {
  const [unharvested, setUnharvested] = useState(0)

  const vbtc = useVBTC()
  const {account} = useWallet()

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
