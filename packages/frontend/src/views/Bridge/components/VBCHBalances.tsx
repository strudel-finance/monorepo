import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
///Users/matic/Documents/LeapDao/monorepo/packages/frontend/src/components/VBCHIcon/VBCHIcon.tsx
import { VBCHMainnet, VBCHBinance } from '../../../components/VBCHIcon/VBCHIcon'
import ValueBTC from '../../../components/ValueBTC'
import useETH from '../../../hooks/useETH'
import { getBalanceNumber } from '../../../utils/formatBalance'
// import {
//   StrudelBinance,
//   StrudelMainnet,
// } from '../../../components/StrudelIcon/StrudelIcon'
interface Balances {
  vBCHonMainnetBalance: BigNumber
  vBCHonBSCBalance: BigNumber
}

const VBCHBalances: React.FC<Balances> = ({
  vBCHonMainnetBalance: vBCHBalanceMainnet,
  vBCHonBSCBalance,
}) => {
  const { eth } = useETH()
  const account = eth?.account

  return (
    <>
      <StyledWrapper>
        <Card>
          <CardContent>
            <StyledBalances>
              <StyledBalance>
                <VBCHMainnet />
                <Spacer size="xs" />
                <div style={{ flex: 1 }}>
                  <Label text="Your vBCH Balance on ETH Mainnet" />
                  <ValueBTC
                    value={
                      !!account && !!vBCHBalanceMainnet
                        ? getBalanceNumber(vBCHBalanceMainnet)
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
            <StyledBalances>
              <StyledBalance>
                <VBCHBinance />
                <Spacer size="xs" />
                <div style={{ flex: 1 }}>
                  <Label text="Your vBCH Balance on Binance Smart Chain" />
                  <ValueBTC
                    value={
                      !!account && !!vBCHonBSCBalance
                        ? getBalanceNumber(vBCHonBSCBalance)
                        : 'Locked'
                    }
                  />
                </div>
              </StyledBalance>
            </StyledBalances>
          </CardContent>
        </Card>
      </StyledWrapper>
    </>
  )
}

const StyledValue = styled.div`
  font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

export const FlexContainer = styled.div`
  display: flex;
`
// !!! TODO: remove - ugly
export const InlineBtn = styled(Button)<{ width: number }>`
  display: inline-block;
  width: ${(props) => props.width + 'px'};
`

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
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`

export default VBCHBalances
