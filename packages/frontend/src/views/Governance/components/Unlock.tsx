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
import StrudelIcon from '../../../components/StrudelIcon'
import ValueBTC from '../../../components/ValueBTC'
import useETH from '../../../hooks/useETH'
import useInfura from '../../../hooks/useInfura'
import { getBalanceNumber } from '../../../utils/formatBalance'
import { ReddishTextTypography } from '../../BCH/components/BCHTransactionTable'
import BalanceStrudel from '../../Home/components/BalanceStrudel'

const Lock: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const infura = useInfura()
  const [strudelBalance, setStrudelBalance] = useState<BigNumber>()
  const [value, setValue] = useState<number | number[]>(0)
  // !!! TODO: put that into provider
  const networkId = (window as any).ethereum?.networkVersion

  const handleValueChange = (event: any, newValue: number | number[]) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (eth?.account) {
      infura.trdl.methods
        .balanceOf(eth.account)
        .call()
        .then((balance: string) => {
          setStrudelBalance(new BigNumber(balance))
        })
    }
  }, [eth?.account])
  return (
    <>
      <Container>
        <StyledWrapper>
          <Card>
            <CardContent>
              <StyledBalances>
                <StyledBalance>
                  <StrudelIcon />
                  <Spacer size="xs" />
                  <div>
                    <Label text="g$TRDL Available for voting" />
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
        </StyledWrapper>
      </Container>

      <Spacer size="lg" />

      <Container>
        <StyledWrapper>
          <Card>
            <CardContent>
              <StyledBalances>
                <StyledBalance>
                  <StrudelIcon />
                  <Spacer size="xs" />
                  <div>
                    <Label text="Lock duration:  " />
                    <StyledValue>24:00:00</StyledValue>
                  </div>
                </StyledBalance>
              </StyledBalances>
            </CardContent>
          </Card>
          <Spacer />
        </StyledWrapper>
      </Container>
    </>
  )
}

const StyledValue = styled.div`
  font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledTokenSymbol = styled.span`
  color: rgba(37, 37, 44, 0.48);
  font-weight: 700;
`

export const FlexContainer = styled.div`
  display: flex;
`

export const InlineBtn = styled(Button)`
  display: inline-block;
`

const StyledInfo = styled(StyledTokenSymbol)`
  margin-right: 10px;
`

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
  position: relative;
  top: -1px;
`

const Footnote = styled.div`
  font-size: 14px;
  padding: 16px 20px;
  color: ${(props) => 'rgba(37,37,44,0.48);'};
  position: relative;
  :after {
    content: ' ';
    position: absolute;
    display: flex;
    width: calc(100% - 40px);
    height: 1px;
    border-top: solid 1px #e9e9e9;
    top: 0;
    border-top: solid 1px ${(props) => '#E9E9E9'};
  }
`
const FootnoteValue = styled.div`
  font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  float: right;
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
`

export default Lock
