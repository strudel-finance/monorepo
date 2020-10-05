import React, { useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'

import StrudelIcon from '../../components/StrudelIcon'

import Button from '../../components/Button'
import Page from '../../components/Page'
import Countdown from 'react-countdown'
import { startDate } from '../../constants/countdown'

import { StyledCount, RenderProps } from '../../utils/countHelper'

import PageHeader from '../../components/PageHeader'
import WalletProviderModal from '../../components/WalletProviderModal'

import useModal from '../../hooks/useModal'

import Farm from '../Farm'

import FarmCards from './components/FarmCards'

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
      <StyledCount>
        {days}:{hours}:{minutes}:{seconds}
      </StyledCount>
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
                    subtitle="Earn STRDL tokens by staking Uniswap V2 LP Tokens."
                    title="Select Your Favorite Mine"
                  />
                  <FarmCards />
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
          <Countdown
            date={startDate}
            renderer={renderer}
            onComplete={handleCountEnd}
          />
        )}
      </Page>
    </Switch>
  )
}

export default Farms
