import React from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: string
  checkbox?: any,
  style?: any
}

const Label: React.FC<LabelProps> = ({text, checkbox, style}) => (
  <StyledLabel style={style}>
    {checkbox}
    {text}
  </StyledLabel>
)

const StyledLabel = styled.div`
  color: ${(props) => 'rgba(37,37,44,0.48);'};
`

export default Label
