import BigNumber from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'

import VBTCIcon from '../../../components/VBTCIcon'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBTC from '../../../hooks/useVBTC'
import {getVbtcAddress, getVbtcSupply} from '../../../vbtc/utils'
import {getBalanceNumber} from '../../../utils/formatBalance'

const Balances: React.FC = () => {
  const [totalVBTCSupply, setTotalVBTCSupply] = useState<BigNumber>()
  const vbtc = useVBTC()
  const vbtcBalance = useTokenBalance(getVbtcAddress(vbtc))
  const {account}: {account: any} = useWallet()

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
              <VBTCIcon />
              <Spacer />
              <div style={{flex: 1}}>
                <Label text="Your vBTC Balance" />
                <ValueBTC
                  value={!!account ? getBalanceNumber(vbtcBalance) : 'Locked'}
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
