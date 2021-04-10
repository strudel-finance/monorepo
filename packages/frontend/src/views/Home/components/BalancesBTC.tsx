import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'
import VBTCIcon from '../../../components/VBTCIcon'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBTC from '../../../hooks/useVBTC'
import useVBCH from '../../../hooks/useVBCH'
import {
  getVbchSupply,
  getVbtcAddress,
  getVbtcSupply,
} from '../../../bridgeTokens/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import useETH from '../../../hooks/useETH'
import { Vbtc } from '../../../bridgeTokens'
import { Vbch } from '../../../bridgeTokens/Vbch'

const Balances: React.FC = () => {
  const [totalVBTCSupply, setTotalVBTCSupply] = useState<BigNumber>()
  const vbtc = useVBTC()

  const vbtcBalance = useTokenBalance(getVbtcAddress(vbtc))
  const { eth } = useETH()

  const fetchTotalSupply = async (vbtc: Vbtc) => {
    const vBTCSupply = await getVbtcSupply(vbtc)

    if (vBTCSupply !== totalVBTCSupply && eth?.account) {
      setTotalVBTCSupply(vBTCSupply)
    }
  }

  useEffect(() => {
    if (vbtc && eth?.account) {
      fetchTotalSupply(vbtc)
    } else {
      setTotalVBTCSupply(undefined)
    }
  }, [vbtc, eth?.account])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <VBTCIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBTC Balance" />
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
          <Label text="Total vBTC Supply" />
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

export default Balances