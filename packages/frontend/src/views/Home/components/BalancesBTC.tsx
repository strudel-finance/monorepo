import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'
import VIcons from '../../../components/VBTCIcon'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBTC from '../../../hooks/useVBTC'
import useVBCH from '../../../hooks/useVBCH'
import { getVbtcAddress } from '../../../tokens/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import useETH from '../../../hooks/useETH'
import useInfura from '../../../hooks/useInfura'

const Balances: React.FC = () => {
  const [totalVBTCSupply, setTotalVBTCSupply] = useState<BigNumber>()
  const [VBTCBalance, setVBTCBalance] = useState<BigNumber>()

  const infura = useInfura()

  // const vbtcBalance = useTokenBalance(getVbtcAddress(vbtc))
  const { eth } = useETH()

  useEffect(() => {
    if (infura)
      infura.vBTC.methods
        .totalSupply()
        .call()
        .then((s: string) => {
          setTotalVBTCSupply(new BigNumber(s))
        })

    if (eth?.account) {
      infura.vBTC.methods
        .balanceOf(eth.account)
        .call()
        .then((s: any) => {
          setVBTCBalance(new BigNumber(s))
        })
    }
  }, [infura, eth?.account])

  // useEffect(() => {
  //   if(infura) {
  //     infura.vBCH.methods
  //     .totalSupply()
  //     .call()
  //     .then((s: any) => {
  //       setTotalVBCHSupply(new BigNumber(s))
  //     })

  //     if (eth?.account) {
  //       infura.vBCH.methods
  //       .balanceOf(eth.account)
  //       .call()
  //       .then((s: any) => {
  //         setVbchBalanceMainnet(new BigNumber(s))
  //       })
  //     }
  //   }
  // }, [infura, eth?.account])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <VIcons.VBTCIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBTC Balance on ETH mainnet" />
                <ValueBTC
                  value={
                    !!eth?.account && !!VBTCBalance
                      ? getBalanceNumber(VBTCBalance)
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
          <Label text="Total vBTC Supply on ETH mainnet" />
          <ValueBTC
            value={
              totalVBTCSupply ? getBalanceNumber(totalVBTCSupply) : 'Locked'
            }
          />
        </CardContent>
      </Card>
    </StyledWrapper>
  )
}

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

export default Balances
