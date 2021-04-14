import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import styled from 'styled-components'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'
import StrudelIcon from '../../../components/StrudelIcon'
import useAllEarnings from '../../../hooks/useAllEarnings'
import useAllStakedValue from '../../../hooks/useAllStakedValue'
import useFarms from '../../../hooks/useFarms'
import useVBTC from '../../../hooks/useVBTC'
import { getBalanceNumber } from '../../../utils/formatBalance'
import useETH from '../../../hooks/useETH'
import useInfura from '../../../hooks/useInfura'
import ValueBTC from '../../../components/ValueBTC'

const PendingRewards: React.FC = () => {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [scale, setScale] = useState(1)

  const allEarnings = useAllEarnings()
  let sumEarning = 0
  for (let earning of allEarnings) {
    sumEarning += new BigNumber(earning)
      .div(new BigNumber(10).pow(18))
      .toNumber()
  }

  const [farms] = useFarms()
  const allStakedValue = useAllStakedValue()

  if (allStakedValue && allStakedValue.length) {
    const sumWeth = farms.reduce(
      (c, { id }, i) => c + (allStakedValue[i].totalWethValue.toNumber() || 0),
      0,
    )
  }

  //hi
  useEffect(() => {
    setStart(end)
    setEnd(sumEarning)
  }, [sumEarning])

  return (
    <span
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'right bottom',
        transition: 'transform 0.5s',
        display: 'inline-block',
      }}
    >
      <CountUp
        start={start}
        end={end}
        decimals={end < 0 ? 4 : end > 1e5 ? 0 : 3}
        duration={1}
        onStart={() => {
          setScale(1.25)
          setTimeout(() => setScale(1), 600)
        }}
        separator=","
      />
    </span>
  )
}


const Multiplier: React.FC = () => {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [scale, setScale] = useState(1)

  let multiplier = new BigNumber(1);
  const allStakedValue = useAllStakedValue()

  if (allStakedValue && allStakedValue.length) {
    multiplier = allStakedValue[0].multiplier
  }

  //hi
  useEffect(() => {
    setEnd(multiplier.toNumber())
  }, [multiplier])

  return (
    <span
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'right bottom',
        transition: 'transform 0.5s',
        display: 'inline-block',
      }}
    >
      <CountUp
        start={start}
        end={end}
        decimals={end < 0 ? 4 : end > 1e5 ? 0 : 3}
        duration={1}
        onStart={() => {
          setScale(1.25)
          setTimeout(() => setScale(1), 600)
        }}
        separator=","
      />
    </span>
  )
}

const BalanceStrudel: React.FC = () => {
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [strudelBalance, setStrudelBalance] = useState<BigNumber>()
  const vbtc = useVBTC()
  // const strudelBalance = useTokenBalance(getStrudelAddress(vbtc))
  const { eth } = useETH()
  const account = eth?.account
  const infura = useInfura()
  const [acc, setAcc] = useState<any>()
  // !!! TODO: put that into provider
  const networkId = (window as any).ethereum?.networkVersion

  useEffect(() => {
    if (infura)
        infura.trdl.methods
          .totalSupply()
          .call()
          .then((balance: string) => {
            setTotalSupply(new BigNumber(balance))
          })
    
          if (eth?.account) {
            infura.trdl.methods
            .balanceOf(eth.account)
            .call()
            .then((balance: string) => {
              setStrudelBalance(new BigNumber(balance))
            })
          }
        }, [infura, eth?.account])

  return (
    <StyledWrapper>
      <Card>
        <CardContent>
          <StyledBalances>
            <StyledBalance>
              <StrudelIcon />
              <Spacer size="xs" />
              <div style={{ flex: 1 }}>
                <Label text="Your $TRDL Balance" />
                <ValueBTC
                  value={
                    (!!account && !!strudelBalance)
                      ? getBalanceNumber(strudelBalance)
                      : 'Locked'
                  }
                />
              </div>
            </StyledBalance>
          </StyledBalances>
        </CardContent>
       { 
        networkId == 1 &&
          <Footnote>
            Pending harvest
            <FootnoteValue>
              <PendingRewards /> $TRDL
            </FootnoteValue>
          </Footnote>
        }
      </Card>
      <Spacer/>
      <Card>
        <CardContent>
          <Label text="Total $TRDL Supply" />
          <ValueBTC
            value= {totalSupply ? getBalanceNumber(totalSupply) : 'Locked'}
          />
        </CardContent>
        {
          networkId == 1 &&
          <Footnote>
            <FootnoteValue>
              <Multiplier /> $TRDL / block
          </FootnoteValue>
          </Footnote>}
      </Card>
    </StyledWrapper>
  )
}

const Footnote = styled.div`
  font-size: 14px;
  padding: 16px 20px;
  color: ${(props) => 'rgba(37,37,44,0.48);'};
  position: relative;
  :after {
    content: " ";
    position: absolute;
    display: flex;
    width: calc(100% - 40px);
    height: 1px;
    border-top: solid 1px #E9E9E9;
    top: 0;
    border-top: solid 1px ${(props) => '#E9E9E9'};
  }
`
const FootnoteValue = styled.div`
    font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  float: right;
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

export default BalanceStrudel
