import styled from 'styled-components'

export const StyledCount = styled.span`
  word-break: break-all;
  text-align: center;
  font-size: 10vw;
  margin: auto;
  @media (min-width: 600px) and (orientation: landscape) {
    font-size: 80px;
  }
`

export type RenderProps = {
  days: number
  hours: number
  minutes: number
  seconds: number
}
