import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string
  checkbox?: any
}

const Label: React.FC<LabelProps> = ({text, checkbox}) => (
  <StyledLabel>
    {checkbox}
    {text}
  </StyledLabel>
)

const StyledLabel = styled.div`
  color: ${(props) => props.theme.color.grey[400]};
`

export default Label
