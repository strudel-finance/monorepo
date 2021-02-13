import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink exact activeClassName="active" to="/">
        Home
      </StyledLink>
      <StyledAbsoluteLink
        href="https://medium.com/@strudelfinance/strudel-manifesto-580759f9634b"
        target="_blank"
      >
        About
      </StyledAbsoluteLink>
      <StyledLink exact activeClassName="active" to="/farms">
        Terra-Farms
      </StyledLink>
      {false && (
        <StyledLink exact activeClassName="active" to="/staking">
          Gravity Bags
        </StyledLink>
      )}
      <StyledAbsoluteLink
        href="https://medium.com/@strudelfinance/how-to-bridge-the-bridge-679891dd0ae8"
        target="_blank"
      >
        Help
      </StyledAbsoluteLink>

    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
  width:100%;
  justify-content: space-around;
`

const StyledLink = styled(NavLink)`
  color: white;
  font-weight: 700;
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: #fdb400;
  }
  &.active {
    color: ${(props) => props.theme.color.primary.main};
    position: relative;
  }
  &.active:after {
    content: '';
    position:absolute;
    top: 44px;
    width:100%;
    left: 0;
    border:2px solid #fdb400;
  }
  @media (max-width: 400px) {
    padding-left: ${(props) => props.theme.spacing[2]}px;
    padding-right: ${(props) => props.theme.spacing[2]}px;
  }
`

const StyledAbsoluteLink = styled.a`
  color: white;
  font-weight: 700;
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: #fdb400;
  }
  &.active {
    color: #fdb400;
  }
  
  @media (max-width: 400px) {
    padding-left: ${(props) => props.theme.spacing[2]}px;
    padding-right: ${(props) => props.theme.spacing[2]}px;
  }
`

export default Nav
