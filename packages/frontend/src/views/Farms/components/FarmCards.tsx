import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import styled from 'styled-components'
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
import StrudelImg from '../../../assets/img/Strudel-logo-Icon.png'
import BTCImg from '../../../assets/img/Strudel-Bitcoin-Icon.png'
import OneBTCImg from '../../../assets/img/onevBTC.png'

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
  const STRUDEL_PER_BLOCK = new BigNumber(1)

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
            .times(stakedValue[i].multiplier)
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
        return StrudelImg
      case '2':
        return BTCImg
      case '3':
        return BTCImg
      case '4':
        return OneBTCImg
      default:
        return icon
    }
  }

  const poolActive = true // startTime * 1000 - Date.now() <= 0

  return (
    <StyledCardWrapper style={{ opacity: rowIndex === 1 && '0.5' }}>
      {farm.pid == 1 && <StyledCardAccent />}
      <Card>
        <CardContent>
          <StyledContent>
            <CardIcon>
              <img style={{ height: 48 }} src={getSymbol(farm.icon)} />
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

const StyledCardAccent = styled.div`
  background-size: 300% 300%;
  border-radius: 12px;
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
