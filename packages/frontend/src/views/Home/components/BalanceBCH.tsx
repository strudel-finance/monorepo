import BigNumber from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import { getVbtcAddress, getVbtcSupply } from '../../../bridgeTokens/utils'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'
import VBTHIcon from '../../../components/VBTHIcon'
import useETH from '../../../hooks/useETH'

import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBTC from '../../../hooks/useVBTC'
import {getBalanceNumber} from '../../../utils/formatBalance'

const BalanceBCH: React.FC = () => {
  const [totalVBTCSupply, setTotalVBTCSupply] = useState<BigNumber>()
  const vbtc = useVBTC()
  const vbtcBalance = useTokenBalance(getVbtcAddress(vbtc))
  const {eth} = useETH()

  useEffect(() => {
    async function fetchTotalSupply() {
      const supply = await getVbtcSupply(vbtc)
      setTotalVBTCSupply(supply)
    }
    if (vbtc) {
      fetchTotalSupply()
    }
  }, [vbtc, setTotalVBTCSupply])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <VBTHIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBCH Balance" />
                <ValueBTC
                  value={
                    
                    !!eth?.account ? getBalanceNumber(vbtcBalance) : 'Locked'
                  
                  }
                />
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>
      </Card>
      <Spacer />

      <Card>
        <CardContent>
          <Label text="Total vBTH Supply" />
          <ValueBTC
            value={
              totalVBTCSupply ? getBalanceNumber(totalVBTCSupply) : 'Locked'
            }
          />
        </CardContent>
      </Card>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: stretch;
  }
`

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`

export default BalanceBCH
