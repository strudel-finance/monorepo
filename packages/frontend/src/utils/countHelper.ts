import styled from 'styled-components'

export const StyledCount = styled.span`
  font-size: 70px;
  margin: auto;
`

export type RenderProps = {
  days: number
  hours: number
  minutes: number
  seconds: number
}
