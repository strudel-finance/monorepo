import React, { useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'

import StrudelIcon from '../../components/StrudelIcon'
import AstroWave from '../../assets/img/astroWave.png'

import Button from '../../components/Button'
import Page from '../../components/Page'
import Countdown from 'react-countdown'
import { startDate, endRewardsDate } from '../../constants/countdown'

import { StyledCount, RenderProps } from '../../utils/countHelper'

import PageHeader from '../../components/PageHeader'
import WalletProviderModal from '../../components/WalletProviderModal'

import useModal from '../../hooks/useModal'

import Farm from '../Farm'
import styled from 'styled-components'
import { withStyles } from '@material-ui/core'

import FarmCards from './components/FarmCards'
import MuiContainer from '@material-ui/core/Container'

const Container = withStyles({
  root: {
    margin: 'auto',
    textAlign: 'center',
  },
})(MuiContainer)

const Farms: React.FC = () => {
  const [isCountComplete, setCountComplete] = useState(false)

  const { path } = useRouteMatch()
  const { account } = useWallet()
  const handleCountEnd = () => {
    setCountComplete(true)
  }
  const renderer = ({ days, hours, minutes, seconds }: RenderProps) => {
    // Render a countdown
    return (
      <>
        {days}d:{hours}h:{minutes}min:{seconds}s
      </>
    )
  }
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)
  const isPast = startDate < new Date()
  return (
    <Switch>
      <Page>
        {isCountComplete || isPast ? (
          <>
            {!!account ? (
              <>
                <Route exact path={path}>
                  <PageHeader
                    icon={<StrudelIcon size={90} />}
                    subtitle="Earn $TRDL tokens by staking LP Tokens."
                    title="Terra-Farms to Explore"
                  />
                  <Container maxWidth="md">
                    <StyledP>
                      🎉 4x $TRDL bonus for{' '}
                      <span>
                        <Countdown date={endRewardsDate} renderer={renderer} />
                      </span>
                      🎉
                    </StyledP>
                    <StyledP>
                      The Terra-Farms strengthen the protocol and the peg of
                      vBTC to BTC.
                    </StyledP>
                    <StyledP>
                      $TRDL is the crypto-econmical incentive to stake and earn
                      rewards by being short on BTC dominance and long on
                      Ethereum.  
                    </StyledP>
                  </Container>
                  <FarmCards />
                  <AstroWrapper>
                    <img src={AstroWave} height="150" />
                  </AstroWrapper>
                </Route>
                <Route path={`${path}/:farmId`}>
                  <Farm />
                </Route>
              </>
            ) : (
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Button
                  onClick={onPresentWalletProviderModal}
                  text="🔓 Unlock Wallet"
                />
              </div>
            )}
          </>
        ) : (
          <StyledCount>
            <Countdown
              date={startDate}
              renderer={renderer}
              onComplete={handleCountEnd}
            />
          </StyledCount>
        )}
      </Page>
    </Switch>
  )
}
const AstroWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  right: 10vw;
  margin: auto;
  z-index: -90000;
`

const StyledP = styled.p`
  text-align: center;
`

export default Farms
