import React from 'react'
import styled from 'styled-components'
import footerInstagram from '../../../assets/img/footer-instagram-icon.png'
import footerTelegram from '../../../assets/img/footer-telegram.png'
import footerTiktok from '../../../assets/img/footer-tictok-icon.png'
import footerGit from '../../../assets/img/footer-github-icon.png'
import footerDiscord from '../../../assets/img/footer-discord-icon.png'
import footerTwitter from '../../../assets/img/footer-twitter-icon.png'


const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink target="_blank" href="https://t.me/STRUDEL_OFFICIAL">
        <LinkImg src={footerTelegram}></LinkImg>
      </StyledLink>
      <StyledLink target="_blank" href="https://discord.gg/CcEE5mC">
        <LinkImg src={footerDiscord}></LinkImg>
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/strudel-finance/">
        <LinkImg src={footerGit}></LinkImg>
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/Cosmo_Strudel">
        <LinkImg src={footerTwitter}></LinkImg>
      </StyledLink>
      <StyledLink target="_blank" href="https://vm.tiktok.com/ZMeRBrCsJ/">
        <LinkImg src={footerTiktok}></LinkImg>
      </StyledLink>
      <StyledLink target="_blank" href="https://www.instagram.com/strudel.finance/">
        <LinkImg src={footerInstagram}></LinkImg>
      </StyledLink>
    </StyledNav>
  )
}

const LinkImg = styled.img`
  width: 28px;
  height: 25px;
`
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
