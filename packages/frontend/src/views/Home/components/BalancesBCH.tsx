import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Vbch } from '../../../tokens/Vbch'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'
import VBTHIcon from '../../../components/VBTHIcon'
import useETH from '../../../hooks/useETH'
import { getBalanceNumber } from '../../../utils/formatBalance'
import useInfura from '../../../hooks/useInfura'

const BalanceBCH: React.FC = () => {
  const [totalVBCHSupply, setTotalVBCHSupply] = useState<BigNumber>()
  const [VBCHBalanceMainnet, setVCHBalanceMainnet] = useState<BigNumber>()
  // !!! TODO: type
  const infura = useInfura()
  const { eth } = useETH()

  useEffect(() => {
    if (infura) {
      infura.vBCH.methods
        .totalSupply()
        .call()
        .then((s: any) => {
          setTotalVBCHSupply(new BigNumber(s))
        })

      if (eth?.account) {
        infura.vBCH.methods
          .balanceOf(eth.account)
          .call()
          .then((s: any) => {
            setVCHBalanceMainnet(new BigNumber(s))
          })
      }
    }
  }, [infura, eth?.account])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <VBTHIcon fromEthereum={true} />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBCH Balance on ETH mainnet" />
                <ValueBTC
                  value={
                    !!eth?.account && !!VBCHBalanceMainnet
                      ? getBalanceNumber(VBCHBalanceMainnet)
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
          <Label text="Total vBCH Supply on ETH mainnet" />
          <ValueBTC
            value={
              totalVBCHSupply ? getBalanceNumber(totalVBCHSupply) : 'Locked'
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

export default BalanceBCH
