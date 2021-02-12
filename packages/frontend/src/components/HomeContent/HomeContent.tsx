import React from 'react'
import styled from 'styled-components'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import VideoSection from './components/VideoSection'
import HomeStrudel from './components/HomeStrudel'
import WhyStrudel from './components/WhyStrudel'
import HowDoesItWorks from './components/HowDoesItWorks'
import Tokenomics from './components/Tokenomics'
import StrudelTeam from './components/StrudelTeam'
import LegalNotice from './components/LegalNotice'

const HomeContent: React.FC = () => (
  <Grid container spacing={1}>
    <VideoSection>
    </VideoSection>
        <HomeStrudel></HomeStrudel>
        <WhyStrudel></WhyStrudel>
        <HowDoesItWorks></HowDoesItWorks>
        <Tokenomics></Tokenomics>
        <StrudelTeam></StrudelTeam>
        <LegalNotice></LegalNotice>
  </Grid>
)



export default HomeContent