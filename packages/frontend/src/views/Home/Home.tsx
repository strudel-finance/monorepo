import React, { useCallback, useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import WalletProviderModal from '../../components/WalletProviderModal'
import Countdown from 'react-countdown'
import Button from '../../components/Button'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import { StyledCount, RenderProps } from '../../utils/countHelper'
import Grid from '@material-ui/core/Grid'
import Balances from './components/BalancesBTC'
import BalanceStrudel from './components/BalanceStrudel'
import BalanceBCH from './components/BalancesBCH'
import BalancesBCHXDAI from './components/BalancesBCHXDAI'
import useModal from '../../hooks/useModal'
import Container from '@material-ui/core/Container'
import { StyledLink } from '../../components/Footer/components/Nav'
import { BTCTransaction } from '../../types/types'
import { makeStyles, withStyles } from '@material-ui/core'
import { startDate } from '../../constants/countdown'
import useETH from '../../hooks/useETH'
import { icons } from '../../helpers/icon'

const useStyles = makeStyles((theme) => ({
  container: {
    background: '#fff',
    border: '0.5px solid ' + theme.palette.divider,
    minHeight: 200,
    height: '100%',
  },
  titleWrapper: {
    paddingBottom: theme.spacing(2),
  },
  actionsCell: {
    minWidth: 150,
  },
  emptyMessage: {
    display: 'flex',
    paddingTop: theme.spacing(8),
    justifyContent: 'center',
    height: '100%',
  },
}))
const AstroGrid = withStyles({
  item: {
    lineHeight: 1,
    margin: 'auto',
    textAlign: 'center',
  },
})(Grid)
const MyStyledLink = styled(StyledLink)`
  display: none;
  @media (min-width: 600px) and (orientation: landscape) {
    display: block;
  }
  font-size: 50px;
`
const Home: React.FC = () => {
  const [isCountComplete, setCountComplete] = useState(false)

  const handleCountEnd = () => {
    setCountComplete(true)
  }
  // icon={<img src={strudel} height={120} />}
  const renderer = ({ days, hours, minutes, seconds }: RenderProps) => {
    // Render a countdown
    return (
      <StyledCount>
        {days}d:{hours}h:{minutes}min:{seconds}s
      </StyledCount>
    )
  }
  const isPast = startDate < new Date()
  return (
    <Page>
      {isCountComplete || isPast ? (
        <>
          <PageHeader
            className="page-header"
            title="Enter the Strudel"
            subtitle="Turn your BTC into vBTC, and earn $TRDL rewards."
          />
          <div
            className="main-head"
            style={{
              margin: '0 auto',
              display: 'flex',
            }}
          >
            <Button
              icon={icons.fire}
              className="glow-btn orange"
              text="GET vBTC"
              to="/BTC"
            />
            <Spacer size="lg" />
            <Button
              icon={icons.fire}
              className="glow-btn green"
              text="GET vBCH"
              to="/BCH"
            />
          </div>
          <Spacer size="md" />
          <>
            <Grid container spacing={1} className="txt-grid">
              <AstroGrid item lg={4} xs={1}></AstroGrid>
              <AstroGrid item lg={4} xs={8}>
                <StyledP>
                  The Strudel is the first one-way, trustless bridge linking
                  Bitcoin and Ethereum. The bravest explorers that arrive on the
                  other side will get extra $TRDL rewards. You can only enter
                  the Strudel from one direction so be aware! This action is
                  irreversible.
                </StyledP>
              </AstroGrid>
              <AstroGrid item lg={4} xs={1}></AstroGrid>
            </Grid>
            <Spacer size="lg" />
            <Container>
              <Balances />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalanceBCH />
              <Spacer size="lg" />
            </Container>
            <Container>
              <BalancesBCHXDAI />
              <Spacer size="lg" />
            </Container>
            <Container>
              <BalanceStrudel />
            </Container>
          </>
        </>
      ) : (
        <>
          <Countdown
            date={startDate}
            renderer={renderer}
            onComplete={handleCountEnd}
          />
          <MyStyledLink target="_blank" href="https://discord.gg/fBuHJCs">
            Join the Discord
          </MyStyledLink>
        </>
      )}
    </Page>
  )
}
const StyledLottieContainer = styled.div`
  width: 100%;
  z-index: -99;
  display: none;
  @media (min-width: 600px) and (orientation: landscape) {
    height: 50vh;
    display: block;
  }
`

const StyledLottieMobileContainer = styled.div`
  width: 100%;
  z-index: -99;
  height: 45vh;
  @media (min-width: 600px) and (orientation: landscape) {
    display: none;
  }
`

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[500]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;

  > b {
    color: ${(props) => props.theme.color.grey[600]};
  }
`
const StyledP = styled.p`
  color: rgba(37,37,44,0.48);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  padding: 0;
`
export default Home
