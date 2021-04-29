import { Slider } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Container from '../../../components/Container'
import Input from '../../../components/Input'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import {
  TimerIcon,
  GStrudelIcon,
  StrudelIcon,
} from '../../../components/StrudelIcon'
import ValueBTC from '../../../components/ValueBTC'
import useVBCHonBSC from '../../../hooks/bridgeHooks/useVBCHonBSC'
import useETH from '../../../hooks/useETH'
import useInfura from '../../../hooks/useInfura'
import { getBalanceNumber } from '../../../utils/formatBalance'
import dayjs from 'dayjs'
import {
  getGStrudelAddress,
  getGStrudelContract,
  getStrudelAddress,
} from '../../../tokens/utils'
import useVBTC from '../../../hooks/useVBTC'
import useTokenBalance from '../../../hooks/useTokenBalance'
const BLOCKS_PER_WEEK = 45850
const SECONDS_PER_BLOCK = 13.1908

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
                <StrudelIcon />
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
                <StrudelIcon />
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
