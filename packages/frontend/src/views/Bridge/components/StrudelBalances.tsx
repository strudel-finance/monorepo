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
import useBlock from '../../../hooks/useBlock'
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
import useStrudelOnBSC from '../../../hooks/useStrudelOnBSC'
const BLOCKS_PER_WEEK = 45850
const SECONDS_PER_BLOCK = 13.1908

const StrudelBalances: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const infura = useInfura()
  // const [gTrdlBalance, setGTrdlBalance] = useState<BigNumber>()
  const [endBlock, setEndBlock] = useState<number>(0)
  // !!! TODO: put that into provider
  const block = useBlock()
  const vbtc = useVBTC()
  const strudelOnBSC = useStrudelOnBSC()
  const strudelBalance = useTokenBalance(getStrudelAddress(vbtc))
  const [strudelOnBSCBalance, setStrudelOnBSCBalance] = useState<BigNumber>()

  // !!! TODO: FIX IT !!!

  useEffect(() => {
    if (strudelOnBSC && account)
      strudelOnBSC.methods
        .balanceOf(account)
        .call()
        .then((s: any) => {
          setStrudelOnBSCBalance(new BigNumber(s))
        })
  }, [account, strudelOnBSC])

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
                  <Label text="Your $TRDL Balance on ETH Mainnet" />
                  <ValueBTC
                    value={
                      !!account && !!strudelBalance
                        ? getBalanceNumber(strudelBalance)
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

export default StrudelBalances
