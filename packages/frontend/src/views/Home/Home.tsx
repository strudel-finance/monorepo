import React, { useCallback, useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { makeStyles, withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'

import BalancesBTC from './components/BalancesBTC'
import BalancesBTCHarmony from './components/BalancesBTCHarmony'
import BalanceStrudel from './components/BalanceStrudel'
import BalanceStrudelHarmony from './components/BalanceStrudelHarmony'

import BalanceBCH from './components/BalancesBCH'
import BalancesBCHXDAI from './components/BalancesBCHXDAI'
import Button from '../../components/Button'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import { StyledCount, RenderProps } from '../../utils/countHelper'
import { StyledLink } from '../../components/Footer/components/Nav'
import { startDate } from '../../constants/countdown'

// const useStyles = makeStyles((theme) => ({
//   container: {
//     background: '#fff',
//     border: '0.5px solid ' + theme.palette.divider,
//     minHeight: 200,
//     height: '100%',
//   },
//   titleWrapper: {
//     paddingBottom: theme.spacing(2),
//   },
//   actionsCell: {
//     minWidth: 150,
//   },
//   emptyMessage: {
//     display: 'flex',
//     paddingTop: theme.spacing(8),
//     justifyContent: 'center',
//     height: '100%',
//   },
// }))

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
      {/* {isCountComplete || isPast ? ( */}
        {/* <> */}
          <PageHeader
            className="page-header"
            title="Enter the Strudel"
            subtitle="Turn your BTC into vBTC or BCH into vBCH, and earn $TRDL rewards."
          />
          <div
            className="main-head"
            style={{
              margin: '0 auto',
              display: 'flex',
            }}
          >
          {/* <Button
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
          />*/}
          <Button
            icon='fa-thin fa-fire'
            className="glow-btn orange"
            text="GET vBTC"
            to="/BTC"
          />
          <Spacer size="lg" />
          <Button
            icon='fa-thin fa-fire'
            className="glow-btn green"
            text="GET vBCH"
            to="/BCH"
          /> 
          </div>
          <Spacer size="md" />
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
              <BalancesBTC />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalancesBTCHarmony />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalanceBCH />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalancesBCHXDAI />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalanceStrudel />
            </Container>
            <Spacer size="lg" />
            <Container>
              <BalanceStrudelHarmony />
            </Container>
            <Spacer size="lg" />

        {/* </> */}
      {/* ) : (
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
      )} */}
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