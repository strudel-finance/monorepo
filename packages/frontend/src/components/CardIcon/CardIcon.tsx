import React from 'react'
import styled from 'styled-components'

interface CardIconProps {
  children?: React.ReactNode
}

const CardIcon: React.FC<CardIconProps> = ({ children }) => (
  <StyledCardIcon>{children}</StyledCardIcon>
)

const StyledCardIcon = styled.div`
  background-color: ${(props) => props.theme.color.white};
  font-size: 36px;
  height: 80px;
  width: 80px;
  border-radius: 40px;
  align-items: center;
  display: flex;
  justify-content: center;
  box-shadow: inset 0px 0px 9px #00000014;
  margin: 0 auto ${(props) => props.theme.spacing[3]}px;
`

export default CardIcon
