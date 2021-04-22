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
import {
  getGStrudelAddress,
  getGStrudelContract,
  getStrudelAddress,
} from '../../../tokens/utils'
import useVBTC from '../../../hooks/useVBTC'
import useTokenBalance from '../../../hooks/useTokenBalance'
const BLOCKS_PER_WEEK = 45850
const SECONDS_PER_BLOCK = 13.1908

const Lock: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const infura = useInfura()
  // const [gTrdlBalance, setGTrdlBalance] = useState<BigNumber>()
  const [endBlock, setEndBlock] = useState<number>(0)
  // !!! TODO: put that into provider
  const block = useBlock()
  const vbtc = useVBTC()
  const gStrudelContract = getGStrudelContract(vbtc)
  const gTrdlBalance = useTokenBalance(getGStrudelAddress(vbtc))

  useEffect(() => {
    if (eth?.account && gStrudelContract) {
      // gStrudelContract.methods
      //   .balanceOf(account)
      //   .call()
      //   .then((balance: string) => {
      //     setGTrdlBalance(new BigNumber(balance))
      //   })

      gStrudelContract.methods
        .getLock(account)
        .call()
        .then(({ endBlock }: { endBlock: string }) => {
          setEndBlock(+endBlock)
        })
    }
  }, [eth?.account, gStrudelContract, gTrdlBalance])

  const formatTime = (blocks: number) => {
    return dayjs()
      .add(blocks * SECONDS_PER_BLOCK, 'seconds')
      .format('MMMM DD, YYYY plit HH:mm:ss')
      .replace('plit', 'at')
  }

  const blockMargin = (endBlock: number, block: number) => {
    return endBlock - block
  }

  const unlockStrudel = async () => {
    const gStrdudelContract = getGStrudelContract(vbtc)
    console.log(gStrdudelContract.methods, 'locklock')
    await gStrdudelContract.methods.unlock().send()
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
                      {!endBlock || !block
                        ? 'You have no $TRDL locked'
                        : blockMargin(endBlock, block) > 0
                        ? formatTime(blockMargin(endBlock, block))
                        : 'You can unlock you $TRDL now'}
                    </StyledValue>
                  </div>
                  <Spacer size="xs" />
                  <InlineBtn
                    className="glow-btn orange"
                    disabled={
                      !endBlock || !block || blockMargin(endBlock, block) >= 0
                    }
                    width={200}
                    text="Unlock $TRDL"
                    onClick={unlockStrudel}
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
