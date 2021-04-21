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
import { TimerIcon, GStrudelIcon } from '../../../components/StrudelIcon'
import ValueBTC from '../../../components/ValueBTC'
import useBlock from '../../../hooks/useBlock'
import useETH from '../../../hooks/useETH'
import useInfura from '../../../hooks/useInfura'
import { getBalanceNumber } from '../../../utils/formatBalance'
import dayjs from 'dayjs'

const Lock: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const infura = useInfura()
  const [gTrdlBalance, setGTrdlBalance] = useState<BigNumber>()
  const [value, setValue] = useState<number | number[]>(0)
  const [endBlock, setEndBlock] = useState<number>(0)
  // !!! TODO: put that into provider
  const networkId = (window as any).ethereum?.networkVersion
  const block = useBlock()

  const handleValueChange = (event: any, newValue: number | number[]) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (eth?.account) {
      infura.gTrdl.methods
        .balanceOf('0x8db6b632d743aef641146dc943acb64957155388')
        .call()
        .then((balance: string) => {
          setGTrdlBalance(new BigNumber(balance))
        })

      infura.gTrdl.methods
        .getLock('0x8db6b632d743aef641146dc943acb64957155388')
        .call()
        .then(({ endBlock }: { endBlock: string }) => {
          setEndBlock(+endBlock)
        })
    }
  }, [eth?.account])

  const formatTime = (blocks: number) => {
    return dayjs()
      .add(blocks * 11.36, 'seconds')
      .format('MMMM DD, YYYY plit HH:mm:ss')
      .replace('plit', 'at')
  }

  const blockMargin = (endBlock: number, block: number) => {
    console.log(endBlock - block, 'endBlock - block')

    return endBlock - block
  }

  return (
    <>
      <Container>
        <StyledWrapper>
          <Card>
            <CardContent>
              <StyledBalances>
                <StyledBalance>
                  <GStrudelIcon />
                  <Spacer size="xs" />
                  <div>
                    <Label text="g$TRDL Available for voting" />
                    <ValueBTC
                      value={
                        !!account && !!gTrdlBalance
                          ? getBalanceNumber(gTrdlBalance)
                          : 'Locked'
                      }
                    />
                  </div>
                </StyledBalance>
              </StyledBalances>
            </CardContent>
          </Card>
        </StyledWrapper>
      </Container>

      <Spacer size="lg" />

      <Container>
        <StyledWrapper>
          <Card>
            <CardContent>
              <StyledBalances>
                <StyledBalance>
                  <TimerIcon />
                  <Spacer size="xs" />
                  <div>
                    <Label text="You can expect your unlock on:  " />
                    <StyledValue>
                      {formatTime(blockMargin(endBlock, block))}
                    </StyledValue>
                  </div>
                  <Spacer size="xs" />
                  <InlineBtn
                    className="glow-btn orange"
                    disabled={blockMargin(endBlock, block) > 0}
                    width={200}
                    text="Unlock $TRDL"
                  />
                </StyledBalance>
              </StyledBalances>
            </CardContent>
          </Card>
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
`

export default Lock
