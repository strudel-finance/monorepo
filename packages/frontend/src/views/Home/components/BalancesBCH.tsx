import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import {
  getVbchSupply,
  getVbtcAddress,
  getVbtcSupply,
} from '../../../bridgeTokens/utils'
import { Vbch } from '../../../bridgeTokens/Vbch'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'
import VBTHIcon from '../../../components/VBTHIcon'
import useETH from '../../../hooks/useETH'

import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBCH from '../../../hooks/useVBTC'
import { getBalanceNumber } from '../../../utils/formatBalance'

const BalanceBCH: React.FC = () => {
  const [totalVBCHSupply, setTotalVBCHSupply] = useState<BigNumber>()
  const vbch = useVBCH()

  const vbchBalanceMainnet = useTokenBalance(getVbtcAddress(vbch))
  const { eth } = useETH()

  const fetchTotalSupply = async (vbch: Vbch) => {
    const vBCHSupply = await getVbchSupply(vbch)

    if (vBCHSupply !== totalVBCHSupply && eth?.account) {
      setTotalVBCHSupply(vBCHSupply)
    }
  }

  useEffect(() => {
    if (vbch && eth?.account) {
      fetchTotalSupply(vbch)
    } else {
      setTotalVBCHSupply(undefined)
    }
  }, [vbch, eth?.account])

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
                    !!eth?.account
                      ? getBalanceNumber(vbchBalanceMainnet)
                      : 'Locked'
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
          <Label text="Total vBCH Supply" />
          <ValueBTC
            value={
              totalVBCHSupply ? getBalanceNumber(totalVBCHSupply) : 'Locked'
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
