import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink target="_blank" href="">
        //TODO add links Vortex Contract
      </StyledLink>
      <StyledLink target="_blank" href="">
        //TODO add links Uniswap STRDL-ETH
      </StyledLink>
      <StyledLink target="_blank" href="https://discord.gg/fBuHJCs">
        Discord
      </StyledLink>
      <StyledLink target="_blank" href="">
        Github
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/strudelfinance">
        Twitter
      </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
`

export default Nav
