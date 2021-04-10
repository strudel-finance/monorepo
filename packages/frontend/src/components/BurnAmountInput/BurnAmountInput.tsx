import React from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Input, {InputProps} from '../Input'

interface BurnAmountInputProps extends InputProps {
  symbol: string
}

const BurnAmountInput: React.FC<BurnAmountInputProps> = ({
  onChange,
  value,
  symbol,
}) => {
  return (
    <StyledTokenInput
      className={`styled-token-input ${symbol === 'BTC' ? 'btc' : 'bch'}`}
    >
      <Input
        startAdornment={
          <StyledTokenAdornmentWrapper>
            <StyledInfo>Amount</StyledInfo>
          </StyledTokenAdornmentWrapper>
        }
        endAdornment={
          <StyledTokenAdornmentWrapper className="styled-token-wrapper">
            <StyledTokenSymbol>{symbol}</StyledTokenSymbol>
          </StyledTokenAdornmentWrapper>
        }
        onChange={onChange}
        placeholder="Enter the amount here"
        value={value == '0' ? undefined : value}
      />
    </StyledTokenInput>
  )
}

const StyledTokenInput = styled.div`
  margin: 5px 0;
`

const StyledSpacer = styled.div`
  width: ${(props) => props.theme.spacing[3]}px;
`

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
  position: relative;
  top: -1px;
`

const StyledTokenSymbol = styled.span`
  color: rgba(37,37,44,0.48);
  font-weight: 700;
`

const StyledInfo = styled(StyledTokenSymbol)`
  margin-right: 10px;
`

export default BurnAmountInput
