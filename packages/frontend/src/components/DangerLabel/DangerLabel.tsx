import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string
  checkbox?: any
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void,
  color?: string
  className?: string
}

const DangerLabel: React.FC<LabelProps> = ({
  text,
  checkbox,
  color,
  className,
  onClick,
}) => (
  <StyledLabel onClick={onClick} color={color} className={className}>
    {checkbox}
    {text}
  </StyledLabel>
)

interface StyledButtonProps {
  color?: string
}

const StyledLabel = styled.div<StyledButtonProps>`
  color: ${(props) => props.color ? props.color : '#e70013'}
`

export default DangerLabel
