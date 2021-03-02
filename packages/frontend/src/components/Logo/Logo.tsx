import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import logoHeaderDark from '../../assets/img/logo-header-dark.svg'

const Logo: React.FC = () => {
  return (
    <StyledLogo to="/">
      <img src={logoHeaderDark} height="48" style={{ marginTop: -4 }} />
    </StyledLogo>
  )
}

const StyledLogo = styled(Link)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0;
  min-height: 44px;
  min-width: 44px;
  padding: 0;
  text-decoration: none;
`

const StyledText = styled.span`
  color: ${(props) => props.theme.color.grey[600]};
  font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.03em;
  margin-left: ${(props) => props.theme.spacing[2]}px;
  @media (max-width: 400px) {
    display: none;
  }
`

const MasterChefText = styled.span`
  font-family: 'Kaushan Script', sans-serif;
`

export default Logo
