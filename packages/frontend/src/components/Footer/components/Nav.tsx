import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink target="_blank" href="https://t.me/STRUDEL_OFFICIAL">
        Telegram
      </StyledLink>
      <StyledLink target="_blank" href="https://discord.gg/CcEE5mC">
        Discord
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/strudel-finance/">
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

export const StyledLink = styled.a`
  color: ${(props) => props.theme.color.grey[400]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
`

export default Nav
