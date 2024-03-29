import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getMasterChefContract } from '../../tokens/utils'
import { getContract } from '../../utils/erc20'

import styled from 'styled-components'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import useFarm from '../../hooks/useFarm'
import useRedeem from '../../hooks/useRedeem'
import Button from '../../components/Button'
import useVBTC from '../../hooks/useVBTC'
import Harvest from './components/Harvest'
import Stake from './components/Stake'
import useETH from '../../hooks/useETH'

const Farm: React.FC = () => {
  const { farmId } = useParams()
  const {
    pid,
    lpToken,
    lpTokenAddress,
    tokenAddress,
    earnToken,
    name,
    icon,
  } = useFarm(farmId) || {
    pid: 0,
    lpToken: '',
    lpTokenAddress: '',
    tokenAddress: '',
    earnToken: '',
    name: '',
    icon: '',
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const vbtc = useVBTC()
  const { eth } = useETH()
  const provider = eth?.provider

  const lpContract = useMemo(() => {
    return getContract(provider, lpTokenAddress)
  }, [provider, lpTokenAddress])

  const { onRedeem } = useRedeem(getMasterChefContract(vbtc))

  const lpTokenName = useMemo(() => {
    return lpToken.toUpperCase()
  }, [lpToken])

  const earnTokenName = useMemo(() => {
    return earnToken.toUpperCase()
  }, [earnToken])

  const getSymbol = (icon: string): any => {
    switch (icon) {
      case '1':
        return ''
      case '2':
        return ''
      case '3':
        return ''
      default:
        return icon
    }
  }

  return (
    <>
      <PageHeader
        icon={getSymbol(icon)}
        subtitle={`Deposit ${lpTokenName}  Tokens and earn ${earnTokenName}`}
        title={name}
      />
      <Spacer size="sm" />
      <div style={{ margin: '0 auto' }}>
        <Button text="<- Back" to="/farms" variant="secondary" size="lg" />
      </div>
      <Spacer size="lg" />
      <StyledFarm>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Harvest pid={pid} />
          </StyledCardWrapper>
          <Spacer />
          <StyledCardWrapper>
            <Stake
              lpContract={lpContract}
              pid={pid}
              icon={icon}
              tokenName={lpToken.toUpperCase()}
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg" />
        <StyledInfo>
          ⭐️ Every time you stake and unstake LP tokens, the contract will
          automagically harvest $TRDL rewards for you!
        </StyledInfo>
        <Spacer size="lg" />
      </StyledFarm>
    </>
  )
}

const StyledFarm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default Farm
