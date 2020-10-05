import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string
  checkbox?: any
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
}

const DangerLabel: React.FC<LabelProps> = ({text, checkbox, onClick}) => (
  <StyledLabel onClick={onClick}>
    {checkbox}
    {text}
  </StyledLabel>
)

const StyledLabel = styled.div`
  color: #e70013;
`

export default DangerLabel
