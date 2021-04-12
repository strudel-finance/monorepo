import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  getVbchAddress,
  getVbchSupply,

} from '../../../tokens/utils'
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
import useInfura from '../../../hooks/useInfura'
import ERC20Abi from '../../../tokens/lib/abi/erc20.json'
const Contract = require('web3-eth-contract')
const XDAI_NETWORK_ID = 100

const BalanceBCH: React.FC = () => {
  const [totalVBCHSupply, setTotalVBCHSupply] = useState<BigNumber>()
  const [VBCHBalanceMainnet, setVCHBalanceMainnet] = useState<BigNumber>()
  // !!! TODO: type
  const infura = useInfura()

  // const vbchBalanceMainnet = useTokenBalance(getVbchAddress(vbch))

  const { eth } = useETH()

  // const fetchTotalSupply = async (vbch: Vbch) => {
  //   const vBCHSupply = await getVbchSupply(vbch)

  //   if (vBCHSupply !== totalVBCHSupply && eth?.account) {
  //     setTotalVBCHSupply(vBCHSupply)
  //   }
  // }

  // ;(Contract as any).setProvider(process.env.REACT_APP_XDAI_PROVIDER)

  // const contract = new Contract(
  //   // add ABI item as type
  //   ERC20Abi as any[],
  //   contractAddresses.vbch[XDAI_NETWORK_ID],
  // )

  // useEffect(() => {
  //   if (vbch && eth?.account) {
  //     fetchTotalSupply(vbch)
  //   } else {
  //     setTotalVBCHSupply(undefined)
  //   }
  // }, [vbch, eth?.account])

  useEffect(() => {
    if(infura) {
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
              <VBTHIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your vBCH Balance on ETH mainnet" />
                <ValueBTC
                  value={
                    (!!eth?.account && !!VBCHBalanceMainnet)
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
