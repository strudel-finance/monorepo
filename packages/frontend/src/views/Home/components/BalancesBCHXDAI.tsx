import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { getVbchAddress, getVbchSupply } from '../../../tokens/utils'
import { Vbch } from '../../../tokens/Vbch'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import ValueBTC from '../../../components/ValueBTC'
import VBTHIcon from '../../../components/VBTHIcon'
import useETH from '../../../hooks/useETH'

import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBCH from '../../../hooks/useVBCH'
import { getBalanceNumber } from '../../../utils/formatBalance'
import { contractAddresses } from '../../../tokens/lib/constants'
const Contract = require('web3-eth-contract')
const XDAI_NETWORK_ID = 100
const ERC20Abi = require('../../../tokens/lib/abi/erc20.json')

const BalancesBCHXDAI: React.FC = () => {
  const [totalVBCHSupply, setTotalVBCHSupply] = useState<BigNumber>()
  const [xDaiVBCHSupply, setXDaiVBCHSupply] = useState<BigNumber>()
  const [xDaiVBCHBalance, setXDaiVBCHBalance] = useState<BigNumber>()

  const { eth } = useETH()

  ;(Contract as any).setProvider(process.env.REACT_APP_XDAI_PROVIDER)

  const contract = new Contract(
    // add ABI item as type
    ERC20Abi as any[],
    contractAddresses.vbch[XDAI_NETWORK_ID],
  )

  // !!! TODO: FIX IT !!!

  useEffect(() => {
    if (eth?.account) {
      contract.methods
        .balanceOf(eth?.account)
        .call()
        .then((s: any) => {
          setXDaiVBCHBalance(new BigNumber(s))
        })
    } else {
      setTotalVBCHSupply(undefined)
    }
  }, [eth?.account])

  useEffect(() => {
    contract.methods
      .totalSupply()
      .call()
      .then((s: any) => setXDaiVBCHSupply(new BigNumber(s)))
  }, [])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <VBTHIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBCH Balance on Binance Smart Chain" />
                <ValueBTC
                  value={
                    !!eth?.account && totalVBCHSupply
                      ? getBalanceNumber(xDaiVBCHBalance)
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
          <Label text="Total vBCH Supply on Binance Smart Chain" />
          {/* <ValueBTC
            value={
              totalVBCHSupply ? getBalanceNumber(totalVBCHSupply) : 'Locked'
            }
          /> */}
          {/* add the styling */}
          <ValueBTC
            value={xDaiVBCHSupply ? getBalanceNumber(xDaiVBCHSupply) : 'Locked'}
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

export default BalancesBCHXDAI
