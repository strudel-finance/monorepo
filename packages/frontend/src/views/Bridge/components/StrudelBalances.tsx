import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import {
  StrudelBinance,
  StrudelMainnet,
} from '../../../components/StrudelIcon/StrudelIcon'
import ValueBTC from '../../../components/ValueBTC'
import useETH from '../../../hooks/useETH'
import { getBalanceNumber } from '../../../utils/formatBalance'

interface Balances {
  strudelOnMainnetBalance: BigNumber
  strudelOnBSCBalance: BigNumber
}

const StrudelBalances: React.FC<Balances> = ({
  strudelOnMainnetBalance,
  strudelOnBSCBalance,
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
                <StrudelMainnet />
                <Spacer size="xs" />
                <div style={{ flex: 1 }}>
                  <Label text="Your $TRDL Balance on ETH Mainnet" />
                  <ValueBTC
                    value={
                      !!account && !!strudelOnMainnetBalance
                        ? getBalanceNumber(strudelOnMainnetBalance)
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
                <StrudelBinance />
                <Spacer size="xs" />
                <div style={{ flex: 1 }}>
                  <Label text="Your $TRDL Balance on Binance Smart Chain" />
                  <ValueBTC
                    value={
                      !!account && !!strudelOnBSCBalance
                        ? getBalanceNumber(strudelOnBSCBalance)
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

export default StrudelBalances
