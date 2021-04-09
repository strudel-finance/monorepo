import React from 'react'
import styled from 'styled-components'

export interface ModalProps {
  className?: string,
}

const ModalContent: React.FC<ModalProps> = ({ children, className }) => {
  return <StyledModalContent className={className}>{children}</StyledModalContent>
}

export const StyledModalContent = styled.div`
  padding: ${(props) => props.theme.spacing[4]}px;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex: 1;
    overflow: auto;
  }
`

export default ModalContent
