import React, { useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { StrudelIcon } from '../../components/StrudelIcon'
import AstroWave from '../../assets/img/astroWave.png'
import ThumbsUp from '../../assets/img/thumbs_up_astronaut.png'

import Button from '../../components/Button'
import Page from '../../components/Page'

import PageHeader from '../../components/PageHeader'
import WalletProviderModal from '../../components/WalletProviderModal'

import useModal from '../../hooks/useModal'

import Farm from '../Farm'
import styled from 'styled-components'
import { withStyles } from '@material-ui/core'

import FarmCards from './components/FarmCards'
import MuiContainer from '@material-ui/core/Container'
import { TerraFarm } from '../../components/Lottie'
import Spacer from '../../components/Spacer'
import MuiPaper from '@material-ui/core/Paper'
import useETH from '../../hooks/useETH'

const Paper = withStyles({
  rounded: {
    'border-radius': '10px',
  },
  root: {
    margin: 'auto',
    '@media (min-width: 500px)': {
      width: '70%',
    },
    '& > *': {
      padding: '10px',
    },
  },
})(MuiPaper)
const Container = withStyles({
  root: {
    margin: 'auto',
    textAlign: 'center',
  },
})(MuiContainer)

const Farms: React.FC = () => {
  const { path } = useRouteMatch()
  const { eth } = useETH()
  const account = eth?.account

  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)
  return (
    <Switch>
      <Page>
        {!!account && eth.provider.networkVersion != 1 ? (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            To se Terra-Farms, please go to Ethereum mainnet.
          </div>
        ) : !!account ? (
          <>
            <Route exact path={path}>
              <PageHeader
                iconSize={200}
                subtitle="Earn $TRDL by staking LP Tokens."
                title="Terra-Farms to Explore"
              />
              <Container maxWidth="md" className="farm-container">
                <StyledP>
                  The Terra-Farms strengthen the protocol and the peg of vBTC to
                  BTC.
                </StyledP>
                <StyledP>
                  $TRDL is the crypto-economical incentive to stake and earn
                  rewards.
                </StyledP>
              </Container>
              <Spacer size="sm" />
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
              boxShadowGlow={true}
              onClick={onPresentWalletProviderModal}
              text="Unlock Wallet"
            />
          </div>
        )}
      </Page>
    </Switch>
  )
}

const StyledP = styled.p`
  text-align: center;
`

const StyledMulti = styled.span`
  font-size: 35px;
  font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  font-weight: 700;
`

const StyledMoving = styled.div`
  & > div {
    height: 200px;
  }
`

export default Farms
