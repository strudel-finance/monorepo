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
  box-shadow: 0px 10px 18px #00000014;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 128px;
`

export default Card
