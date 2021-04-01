import BigNumber from 'bignumber.js'
import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'

import VBTCIcon from '../../../components/VBTCIcon'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBTC from '../../../hooks/useVBTC'
import useVBCH from '../../../hooks/useVBCH'
import {getVbchSupply, getVbtcAddress, getVbtcSupply} from '../../../bridgeTokens/utils'
import {getBalanceNumber} from '../../../utils/formatBalance'

const Balances: React.FC = () => {
  const [totalVBTCSupply, setTotalVBTCSupply] = useState<BigNumber>()
  const [totalVBCHSupply, setTotalVBCHSupply] = useState<BigNumber>()
  const vbtc = useVBTC()
  const vbch = useVBCH()
  
  const vbtcBalance = useTokenBalance(getVbtcAddress(vbtc))
  const vbchBalanceMainnet = useTokenBalance(
    getVbtcAddress(vbch)
  )

  const { account }: { account: any } = useWallet()

  useEffect(() => {
    async function fetchTotalSupply() {
      const [vBTCSupply, vBCHSupply] = await Promise.all([getVbtcSupply(vbtc), getVbchSupply(vbch)])
      
      setTotalVBTCSupply(vBTCSupply)
      setTotalVBCHSupply(vBCHSupply)
    }
    if (vbtc && vbch) {
      fetchTotalSupply()
    }
  }, [vbtc, setTotalVBTCSupply])

  return (
    <>
      {/* BTC */}

      <StyledWrapper>
        <Card>
          <CardContent>
            <StyledBalances>
              <StyledBalance>
                <VBTCIcon />
                <Spacer size="xs" />
                <div style={{ flex: 1 }}>
                  <Label text="Your vBTC Balance" />
                  <ValueBTC
                    value={!!account ? getBalanceNumber(vbtcBalance) : 'Locked'}
                  />
                </div>
              </StyledBalance>
            </StyledBalances>
          </CardContent>
        </Card>
        <Spacer />

        <Card>
          <CardContent>
            <Label text="Total vBTC Supply" />
            <ValueBTC
              value={
                totalVBTCSupply ? getBalanceNumber(totalVBTCSupply) : 'Locked'
              }
            />
          </CardContent>
        </Card>
      </StyledWrapper>

      {/* BCH */}
      <StyledWrapper>
        <Card>
          <CardContent>
            <StyledBalances>
              <StyledBalance>
                <VBTCIcon />
                <Spacer size="xs" />
                <div style={{ flex: 1 }}>
                  <Label text="Your vBCH Balance" />
                  <ValueBTC
                    value={
                      !!account
                        ? getBalanceNumber(vbchBalanceMainnet)
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
            <Label text="Total vBCH Supply" />
            <ValueBTC
              value={
                totalVBCHSupply ? getBalanceNumber(totalVBCHSupply) : 'Locked'
              }
            />
          </CardContent>
        </Card>
      </StyledWrapper>
    </>
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
