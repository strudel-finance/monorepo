import React from 'react'
import styled from 'styled-components'
type StyleProps = {
  style?: any
}

const Card: React.FC<StyleProps> = ({ children, style = {} }) => (
  <StyledCard style={style}>{children}</StyledCard>
)

const StyledCard = styled.div`
  border-radius: 12px;
  box-shadow: -3px 7px 17px 4px #00000014;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 128px;
`

export default Card
