import { CircularProgress, Slider, withStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { value } from 'numeral'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Container from '../../../components/Container'
import Input from '../../../components/Input'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import { StrudelIcon } from '../../../components/StrudelIcon'
import ValueBTC from '../../../components/ValueBTC'
import useETH from '../../../hooks/useETH'
import useInfura from '../../../hooks/useInfura'
import { getBalanceNumber } from '../../../utils/formatBalance'
import { ReddishTextTypography } from '../../BCH/components/BCHTransactionTable'
import BalanceStrudel from '../../Home/components/BalanceStrudel'
import showError, { closeError } from '../../../utils/showError'
import BurnAmountInput from '../../../components/BurnAmountInput'
import useTokenBalance from '../../../hooks/useTokenBalance'
import { getGStrudelContract, getStrudelAddress } from '../../../tokens/utils'
import useVBTC from '../../../hooks/useVBTC'
import { decToBn } from '../../../utils/index'
import { getAllowance } from '../../../utils/erc20'
import { ethers } from 'ethers'
const MAX_LOCK_DURATION = 52

const Lock: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  // const [strudelBalance, setStrudelBalance] = useState<BigNumber>()
  const [weeks, setWeeks] = useState<number | number[]>(1)
  const [amount, setAmonut] = useState<string>('0')
  const [inProgress, setInProgress] = useState<boolean>(false)
  // !!! TODO: put that into provider
  const vbtc = useVBTC()

  const strudelBalance = useTokenBalance(getStrudelAddress(vbtc))

  const gStrdudelContract = getGStrudelContract(vbtc)

  const handleValueChange = (event: any, newValue: number | number[]) => {
    setWeeks(newValue)
  }

  const onAmountChange = (event: any) => {
    const value = event.target.value.replace(/^0+/, '')

    if (value === '') {
      setAmonut('')
    } else if (getBalanceNumber(strudelBalance) >= +event.target.value) {
      setAmonut(value)
    } else {
      closeError()
      showError('Insufficient amount')
    }
  }

  // !!! TODO: add types for lp contract
  // const approve = async () => {
  //   await gStrdudelContract.methods
  //     .approve(gStrdudelContract.options.address, ethers.constants.MaxUint256)
  //     .send({ from: account })
  // }

  // const allowance = async () => {
  //   return await getAllowance(gStrdudelContract, gStrdudelContract, account)
  // }

  const lockStrudel = async () => {
    setInProgress(true)

    const blocksLock =
      Number(process.env.REACT_APP_BLOCKS_PER_WEEK) * (weeks as number)
    const amountBigNum = decToBn(Number(amount))

    console.log(
      account,
      amountBigNum,
      blocksLock,
      'account, amountBigNum, blocksLock, false',
    )

    await gStrdudelContract.methods
      .lock(account, amountBigNum, blocksLock, false)
      .send()

    setInProgress(false)
  }

  const calculateGStrudel = (weeks: number, amount: number) => {
    return (
      ((MAX_LOCK_DURATION * 2 - weeks) * weeks * amount) /
        (MAX_LOCK_DURATION * MAX_LOCK_DURATION) +
      amount
    )
  }

  const marks = [
    {
      value: 1,
      label: '1 week',
    },
    {
      value: 52,
      label: '52 weeks',
    },
  ]

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
                    <Label text="$TRDL Available for locking:  " />
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
        </StyledWrapper>
      </Container>
      <Spacer size="lg" />

      <Container>
        <Card>
          <CardContentRow>
            {inProgress && (
              <>
                <OpacityContainer>
                  <CircularProgress
                    disableShrink
                    size={80}
                    style={{ color: 'rgba(229, 147, 16, 1)' }}
                  />
                </OpacityContainer>
              </>
            )}
            <ColumnFlexContainer align={'flex-start'}>
              <div style={{ width: '100%', maxWidth: '300px' }}>
                <StyledTokenAdornmentWrapper>
                  <StyledInfo>Duration</StyledInfo>
                </StyledTokenAdornmentWrapper>
                <StyledSlider
                  defaultValue={1}
                  marks={marks}
                  onChange={handleValueChange}
                  aria-labelledby="discrete-slider-small-steps"
                  step={1}
                  min={1}
                  max={52}
                  valueLabelDisplay="auto"
                />
              </div>
              <BurnAmountInput
                onChange={onAmountChange}
                value={amount}
                symbol="TRDL"
              />
            </ColumnFlexContainer>
            <hr style={{ margin: '0 15px' }} />
            <ColumnFlexContainer align="flex-start">
              <StyledTokenAdornmentWrapper>
                <StyledTokenSymbol>
                  {' '}
                  Locking {Number(amount).toFixed(2)} $TRDL for{' '}
                  {weeks != 1 ? weeks + ' weeks ' : weeks + ' week '} will{' '}
                  return{' '}
                  {calculateGStrudel(weeks as number, +amount).toFixed(2)}{' '}
                  g$TRDL
                </StyledTokenSymbol>
              </StyledTokenAdornmentWrapper>
              <Spacer size="lg" />
              {/* <FlexContainer align="flex-start" flexDirection={'row'}> */}
              {/* <InlineBtn
                  text="Approve"
                  className="glow-btn orange"
                  width={150}
                  size={'xl'}
                  // disabled={!Number(amount)}
                  onClick={approve}
                /> */}
              <InlineBtn
                text="Lock $TRDL for g$TRDL"
                className="glow-btn orange"
                // width={150}
                // size={'xl'}
                disabled={!Number(amount)}
                onClick={lockStrudel}
              />
              {/* </FlexContainer> */}
            </ColumnFlexContainer>
          </CardContentRow>
        </Card>
      </Container>
    </>
  )
}

const StyledTokenSymbol = styled.span`
  color: rgba(37, 37, 44, 0.48);
  font-weight: 700;
`

const CardContentRow = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  padding: ${(props) => props.theme.spacing[5]}px;
`

const ColumnFlexContainer = styled.div<{
  align: string
}>`
  box-sizing: border-box;
  max-width: 400px;
  word-wrap: break-word;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: ${(props) => props.align};
`

const StyledSlider = withStyles({
  root: {
    boxShadow: '#FFF',
    color: 'black',
    margin: '13px 0 20px 23px',
    width: '268px',
  },
  thumb: {
    '&:hover': { boxShadow: 'none' },
  },
  focusVisible: {
    '&:focus': { boxShadow: 'none' },
  },
})(Slider)

export const InlineBtn = styled(Button)<{ width?: number }>`
  display: inline-block;
  width: ${(props) => props.width + 'px'};
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

const OpacityContainer = styled.div`
  z-index: 1;
  background: rgb(255, 255, 255, 0.8);
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
`

export default Lock
