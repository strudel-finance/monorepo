import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import styled, { keyframes } from 'styled-components'
import { useWallet } from 'use-wallet'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import Loader from '../../../components/Loader'
import Spacer from '../../../components/Spacer'
import { Farm } from '../../../contexts/Farms'
import useAllStakedValue, {
  StakedValue,
} from '../../../hooks/useAllStakedValue'
import useFarms from '../../../hooks/useFarms'
import useVBTC from '../../../hooks/useVBTC'
import { getEarned, getMasterChefContract } from '../../../vbtc/utils'
import { bnToDec } from '../../../utils'
import { StrudelMoving, VBTCSpin } from '../../../components/Lottie'

import Farm1 from '../../../assets/img/Farm1.png'
import Farm2 from '../../../assets/img/Farm2.png'
import Farm3 from '../../../assets/img/Farm3.png'
import Farm4 from '../../../assets/img/Farm4.png'
import Farm5 from '../../../assets/img/Farm5.png'

interface FarmWithStakedValue extends Farm, StakedValue {
  isBalancer?: boolean
  url?: string
  apy: BigNumber
  percentage: string
}

const FarmCards: React.FC = () => {
  const [farms] = useFarms()
  const { account } = useWallet()
  const stakedValue = useAllStakedValue()

  const strudelIndex = farms.findIndex(
    ({ tokenSymbol }) => tokenSymbol === 'STRDL',
  )

  const strudelPrice =
    strudelIndex >= 0 && stakedValue[strudelIndex]
      ? stakedValue[strudelIndex].tokenPriceInWeth
      : new BigNumber(0)
  //console.log(strudelPrice.toString())
  const BLOCKS_PER_YEAR = new BigNumber(2336000)
  const STRUDEL_PER_BLOCK = new BigNumber(4)

  const rows = farms.reduce<FarmWithStakedValue[][]>(
    (farmRows, farm, i) => {
      const farmWithStakedValue = {
        ...farm,
        ...stakedValue[i],
        apy: stakedValue[i]
          ? strudelPrice
              .times(STRUDEL_PER_BLOCK)
              .times(BLOCKS_PER_YEAR)
              .times(stakedValue[i].poolWeight)
              .div(stakedValue[i].totalWethValue)
          : null,
        percentage: stakedValue[i]
          ? Number(Number(stakedValue[i].poolWeight) * Number(100))
              .toFixed(2)
              .toString()
          : null,
      }
      const newFarmRows = [...farmRows]

      if (i <= 2) {
        newFarmRows[0].push(farmWithStakedValue)
      } else {
        newFarmRows[1].push(farmWithStakedValue)
      }
      return newFarmRows
    },
    [[], []],
  )

  return (
    <StyledCards>
      {!!rows[0].length ? (
        rows.map((farmRow, i) => (
          <StyledRow key={i}>
            {farmRow.map((farm, j) => (
              <React.Fragment key={j}>
                <FarmCard farm={farm} index={i + j} rowIndex={i} />
              </React.Fragment>
            ))}
          </StyledRow>
        ))
      ) : (
        <StyledLoadingWrapper>
          <Loader text="Exploring new planets ..." />
        </StyledLoadingWrapper>
      )}
    </StyledCards>
  )
}

interface FarmCardProps {
  farm: FarmWithStakedValue
  index: number
  rowIndex: number
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, index, rowIndex }) => {
  const [startTime, setStartTime] = useState(0)
  const [harvestable, setHarvestable] = useState(0)

  const { account } = useWallet()
  const { lpTokenAddress } = farm
  const vbtc = useVBTC()

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span style={{ width: '100%' }}>
        {paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    )
  }
  const getBackground = (): string => {
    switch (index % 5) {
      case 0:
        return Farm1
      case 1:
        return Farm2
      case 2:
        return Farm3
      case 3:
        return Farm4
      case 4:
        return Farm5
    }
  }

  useEffect(() => {
    async function fetchEarned() {
      if (vbtc) return
      const earned = await getEarned(
        getMasterChefContract(vbtc),
        lpTokenAddress,
        account,
      )
      setHarvestable(bnToDec(earned))
    }
    if (vbtc && account) {
      fetchEarned()
    }
  }, [vbtc, lpTokenAddress, account, setHarvestable])

  const getSymbol = (icon: string): any => {
    switch (icon) {
      case '1':
        return <StrudelMoving />
      case '2':
        return <VBTCSpin />
      case '3':
        return <VBTCSpin />
      default:
        return icon
    }
  }

  const poolActive = true // startTime * 1000 - Date.now() <= 0

  return (
    <StyledCardWrapper style={{ opacity: rowIndex === 1 && '0.5' }}>
      {farm.isBalancer && <StyledCardAccent />}
      <Card style={{ backgroundImage: `url(${getBackground()})` }}>
        <CardContent>
          <StyledContent>
            <CardIcon>
              <StyledMoving>{getSymbol(farm.icon)}</StyledMoving>
            </CardIcon>

            <StyledTitle>{farm.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>
                Deposit{' '}
                <a href={farm.url} target="_blank">
                  {farm.lpToken.toUpperCase()}
                </a>
              </StyledDetail>
              <StyledDetail style={{ paddingTop: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '24px' }}>
                  {farm.percentage}%
                </span>{' '}
                <br />
                of {farm.earnToken.toUpperCase()} rewards
              </StyledDetail>
            </StyledDetails>
            <Spacer />
            <Button
              disabled={!poolActive}
              text={poolActive ? 'Select' : undefined}
              to={`/farms/${farm.id}`}
            >
              {!poolActive && (
                <Countdown
                  date={new Date(startTime * 1000)}
                  renderer={renderer}
                />
              )}
            </Button>
            <StyledInsight>
              <span>APY</span>
              <span>
                {farm.apy
                  ? `${farm.apy
                      .times(new BigNumber(100))
                      .toNumber()
                      .toLocaleString('en-US')
                      .slice(0, -1)}%`
                  : 'Loading ...'}
              </span>
              {/* <span>
                {farm.tokenAmount
                  ? (farm.tokenAmount.toNumber() || 0).toLocaleString('en-US')
                  : '-'}{' '}
                {farm.tokenSymbol}
              </span>
              <span>
                {farm.wethAmount
                  ? (farm.wethAmount.toNumber() || 0).toLocaleString('en-US')
                  : '-'}{' '}
                ETH
              </span> */}
            </StyledInsight>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  )
}

const RainbowLight = keyframes`

	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  background-size: 300% 300%;
  animation: ${RainbowLight} 2s linear infinite;
  border-radius: 12px;
  filter: blur(6px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`

const StyledCards = styled.div`
  width: 1240px;
  @media (max-width: 1240px) {
    width: 100%;
  }
`

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  margin: 12px;
  width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
`

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  background-size: 100%;
`

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-top: ${(props) => props.theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${(props) => props.theme.color.grey[500]};
`

const StyledInsight = styled.div`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  border-radius: 8px;
  background: #fffdfa;
  color: #aa9584;
  width: 100%;
  margin-top: 12px;
  line-height: 32px;
  font-size: 13px;
  border: 1px solid #e6dcd5;
  text-align: center;
  padding: 0 12px;
`
const StyledMoving = styled.div`
  & > div {
    height: 60px;
  }
`

export default FarmCards
