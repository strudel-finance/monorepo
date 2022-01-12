import React from 'react'
import styled from 'styled-components'
import Input, { InputProps } from '../Input'

interface BurnAmountInputProps extends InputProps {
  symbol: string
}

const BurnAmountInput: React.FC<BurnAmountInputProps> = ({
  onChange,
  value,
  symbol,
}) => {
  return (
    <StyledTokenInput className={`styled-token-input ${symbol === 'BCH' ? 'bch' : 'btc'}`}>
      <Input
        startAdornment={
          <StyledTokenAdornmentWrapper>
            <StyledInfo>Amount</StyledInfo>
            <StyledInfoSymbol>{symbol}</StyledInfoSymbol>
          </StyledTokenAdornmentWrapper>
        }
        onChange={onChange}
        placeholder="Enter the amount here"
        value={value}
      />
    </StyledTokenInput>
  )
}

const StyledTokenInput = styled.div`
  margin: 24px 0;
`

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
  position: relative;
  top: -1px;
`

const StyledTokenSymbol = styled.span`
  color: rgba(37, 37, 44, 0.48);
  font-weight: 700;
`

const StyledInfo = styled(StyledTokenSymbol)`
  margin-right: 10px;
`

const StyledInfoSymbol = styled(StyledTokenSymbol)`
  margin-right: 10px;
  color: #000;
`
export default BurnAmountInput
