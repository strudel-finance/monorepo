import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '../../../helpers/icon'

import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink target="_blank" href="https://www.instagram.com/strudel.finance/">
        <FontAwesomeIcon icon={icons.instagram} />
      </StyledLink>
      <StyledLink target="_blank" href="https://www.linkedin.com/company/strudel-finance/">
        <FontAwesomeIcon icon={icons.linkedIn} />
      </StyledLink>
      <StyledLink target="_blank" href="https://vm.tiktok.com/ZMeRBrCsJ/">
        <FontAwesomeIcon icon={icons.tiktok} />
      </StyledLink>
      <StyledLink target="_blank" href="https://t.me/StrudelFinanceOfficial">
        <FontAwesomeIcon icon={icons.telegram} />
      </StyledLink>
      <StyledLink target="_blank" href="https://www.youtube.com/channel/UC6Znj2lAHKGjNLYrKs_SYwg">
        <FontAwesomeIcon icon={icons.youtube} />
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/EnterTheStrudel">
        <FontAwesomeIcon icon={icons.twitter} />
      </StyledLink>
      <StyledLink target="_blank" href="https://strudel-finance.medium.com/">
        <FontAwesomeIcon icon={icons.medium} />
      </StyledLink>
      <StyledLink target="_blank" href="https://discord.com/invite/CcEE5mC">
        <FontAwesomeIcon icon={icons.discord} />
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/strudel-finance/">
        <FontAwesomeIcon icon={icons.github} />
      </StyledLink>

    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  @media (max-width: 426px) {
    margin-top 48px
  }
`

export const StyledLink = styled.a`
  color: rgba(37,37,44,0.48);
  font-size: 20px;
  padding: 12px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
`

export default Nav
