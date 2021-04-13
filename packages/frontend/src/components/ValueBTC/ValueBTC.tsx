import BigNumber from 'bignumber.js'
import React, {useState, useEffect} from 'react'
import CountUp from 'react-countup'

import styled from 'styled-components'

interface ValueProps {
  value: string | number
  decimals?: number
}

const ValueBTC: React.FC<ValueProps> = ({value, decimals}) => {
  const [start, updateStart] = useState(0)
  const [end, updateEnd] = useState(0)

  const trimNum = (num: number) => {
    const a = [...(String(num).split('.').pop() as any)].findIndex(a => Number(a));
    return a === -1 ? 2 : a + 2
  }

  useEffect(() => {
    if (typeof value === 'number') {
      updateStart(0)
      updateEnd(value)
    }
  }, [value])

  return (
    <StyledValue>
      {typeof value == 'string' ? (
        value
      ) : (
        <CountUp
          start={start}
          end={end}
            decimals={
              // decimals !== undefined ? decimals : end < 0 ? 4 : end > 1e5 ? 0 : 6
              (value < 1) ? trimNum(value) : 2
          }
          duration={1}
          separator=","
        />
      )}
    </StyledValue>
  )
}

const StyledValue = styled.div`
    font-family: 'azo-sans-web', Arial, Helvetica, sans-serif;
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

export default ValueBTC
