import React from 'react'
import styled, { keyframes } from 'styled-components'

export interface ModalProps {
  onDismiss?: () => void
}

const Modal: React.FC = ({ children }) => {
  return (
    <StyledResponsiveWrapper>
      <StyledModal>{children}</StyledModal>
    </StyledResponsiveWrapper>
  )
}

const mobileKeyframes = keyframes`
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
`

const StyledResponsiveWrapper = styled.div`
  height: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  width: 100%;
  max-width: 512px;
`

const StyledModal = styled.div`
  margin: auto;
  overflow-y: auto;
  background: ${(props) => '#FFFFFF'};
  border-radius: 12px;
  box-shadow: 0px 10px 18px #00000014;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: 0;
  @media (min-width: ${(props) =>
      props.theme.breakpoints.mobile}px) and (orientation: landscape) {
    padding: 0 20px;
  }
`

export default Modal
