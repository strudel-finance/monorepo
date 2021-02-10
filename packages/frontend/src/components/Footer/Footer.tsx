import React from 'react'
import styled from 'styled-components'

import Nav from './components/Nav'
import FooterLogo from '../../assets/img/logo-bottom.png'
const Footer: React.FC = () => (
  <StyledFooter>
    <StyledFooterInner>
      <FooterLogoSection>
        <img src={FooterLogo} />
      </FooterLogoSection>
      <Nav />
    </StyledFooterInner>
  </StyledFooter>
)
const FooterLogoSection = styled.div`
  margin-top: 30px;
  margin-bottom: 30px;
`
const StyledFooter = styled.footer`
  align-items: center;
  display: flex;
  justify-content: center;
`
const StyledFooterInner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: ${props => props.theme.siteWidth}px;
  width: 100%;

  margin-bottom: 30px;
`
//height: ${props => props.theme.topBarSize}px;  set footer height on current
export default Footer