import React from 'react';
import styled from 'styled-components';

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink target="_blank" href="https://www.instagram.com/strudel.finance/">
        <i className="fa-brands fa-instagram"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://www.linkedin.com/company/strudel-finance/">
        <i className="fa-brands fa-linkedin"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://vm.tiktok.com/ZMeRBrCsJ/">
        <i className="fa-brands fa-tiktok"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://t.me/StrudelFinanceOfficial">
        <i className="fa-brands fa-telegram"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://www.youtube.com/channel/UC6Znj2lAHKGjNLYrKs_SYwg">
        <i className="fa-brands fa-youtube"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/EnterTheStrudel">
        <i className="fa-brands fa-twitter"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://strudel-finance.medium.com/">
        <i className="fa-brands fa-medium"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://discord.com/invite/CcEE5mC">
        <i className="fa-brands fa-discord"></i>
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/strudel-finance/">
        <i className="fa-brands fa-github"></i>
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
