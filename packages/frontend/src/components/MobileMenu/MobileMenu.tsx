import React from 'react'
import styled, { keyframes } from 'styled-components'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { NavLink } from 'react-router-dom'

interface MobileMenuProps {
  onDismiss: () => void
  visible?: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onDismiss, visible }) => {
  if (visible) {
    return (
      <StyledMobileMenuWrapper>
        <StyledBackdrop onClick={onDismiss} />
        <StyledMobileMenu>
          <StyledLink exact activeClassName="active" to="/" onClick={onDismiss}>
            Home
          </StyledLink>
          <StyledAbsoluteLink
            href="https://hackmd.io/@HD-Strudel/WtS"
            target="_blank">
            Strudel Guide
          </StyledAbsoluteLink>
          <StyledLink
            exact
            activeClassName="active"
            to="/BTC"
            onClick={onDismiss}
          >
            Bitcoin
          </StyledLink>
          <StyledLink
            exact
            activeClassName="active"
            to="/BCH"
            onClick={onDismiss}
          >
            Bitcoin Cash
          </StyledLink>
          <StyledLink
            exact
            activeClassName="active"
            to="/farms"
            onClick={onDismiss}
          >
            Strudel Farms
          </StyledLink>
          <NavDropdown className='mobile-nav-dropdown' title="Mare Fund" id="nav-dropdown">
            <NavDropdown.Item eventKey="4.1" href='https://pools.balancer.exchange/#/pool/0xde5921f03ba2ec1a9efbeb6957273b5414193a3b'>Mare Imbrium Fund Balancer Pool</NavDropdown.Item>
            <NavDropdown.Item eventKey="4.2" href='https://app.strudel.finance/farms/MARE'>Mare Imbrium Strudel Farm</NavDropdown.Item>
            <NavDropdown.Item eventKey="4.3" href='https://hackmd.io/@HD-Strudel/MareFAQ'>Mare Imbrium Fund Guide</NavDropdown.Item>
          </NavDropdown>
          <StyledLink
            exact
            activeClassName="active"
            to="/governance"
            onClick={onDismiss}
          >
            Governance
          </StyledLink>
          <StyledLink
            exact
            activeClassName="active"
            to="/bridge"
            onClick={onDismiss}
          >
            BSC Bridge
          </StyledLink>
          {false && (
            <StyledLink
              exact
              activeClassName="active"
              to="/staking"
              onClick={onDismiss}
            >
              Staking
            </StyledLink>
          )}
          <StyledAbsoluteLink
            href="https://strudel-finance.medium.com/"
            target="_blank"
          >
            Medium
          </StyledAbsoluteLink>
        </StyledMobileMenu>
      </StyledMobileMenuWrapper>
    )
  }
  return null
}

const StyledBackdrop = styled.div`
  background-color: ${(props) => props.theme.color.grey[600]}aa;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const StyledMobileMenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
`

const slideIn = keyframes`
  0% {
    transform: translateX(0)
  }
  100% {
    transform: translateX(-100%);
  }
`

const StyledMobileMenu = styled.div`
  animation: ${slideIn} 0.3s forwards ease-out;
  background-color: ${(props) => props.theme.color.grey[200]};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 100%;
  bottom: 0;
  width: calc(100% - 48px);
`

const StyledLink = styled(NavLink)`
  box-sizing: border-box;
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 24px;
  font-weight: 700;
  padding: ${(props) => props.theme.spacing[3]}px
    ${(props) => props.theme.spacing[4]}px;
  text-align: center;
  text-decoration: none;
  width: 100%;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
  &.active {
    color: ${(props) => props.theme.color.primary.main};
  }
`

const StyledAbsoluteLink = styled.a`
  box-sizing: border-box;
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 24px;
  font-weight: 700;
  padding: ${(props) => props.theme.spacing[3]}px
    ${(props) => props.theme.spacing[4]}px;
  text-align: center;
  text-decoration: none;
  width: 100%;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
  &.active {
    color: ${(props) => props.theme.color.primary.main};
  }
`

export default MobileMenu
