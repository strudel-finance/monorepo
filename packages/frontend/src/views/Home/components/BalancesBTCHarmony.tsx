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
// import useInfura from '../../../hooks/useInfura'
import ERC20Abi from '../../../tokens/lib/abi/erc20.json'
import { contractAddresses } from '../../../tokens/lib/constants'
const Contract = require('web3-eth-contract')

// Extract it to a common variable?
const HARMONY_NETWORK_ID = 1666600000;

const Balances: React.FC = () => {
  const [totalVBTCSupply, setTotalVBTCSupply] = useState<BigNumber>()
  const [VBTCBalance, setVBTCBalance] = useState<BigNumber>()

  const { eth } = useETH()

  ;(Contract as any).setProvider(process.env.REACT_APP_HARMONY_PROVIDER)

  const contract = new Contract(
    // add ABI item as type
    ERC20Abi as any[],
    contractAddresses.vbtc[HARMONY_NETWORK_ID],
  )

  useEffect(() => {
    if (eth?.account) {
      contract.methods
        .balanceOf(eth?.account)
        .call()
        .then((s: any) => {
          // alert(s);
          setVBTCBalance(new BigNumber(s))
        })
    } else {
      setVBTCBalance(undefined)
    }
  }, [eth?.account])

  useEffect(() => {
    contract.methods
      .totalSupply()
      .call()
      .then((s: any) => setTotalVBTCSupply(new BigNumber(s)))
  }, [])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <VIcons.VBTCIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBTC Balance on Harmony mainnet" />
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
          <Label text="Total vBTC Supply on Harmony mainnet" />
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
