import React from 'react'
import styled from 'styled-components'
import Input, { InputProps } from '../Input'

interface AddressInputProps extends InputProps {
  address: string
}

const AddressInput: React.FC<AddressInputProps> = ({ value, onChange }) => {
  return (
    <StyledTokenInput className="styled-token-input">
      <InlineInput
        startAdornment={
          <StyledTokenAdornmentWrapper>
            <StyledInfo>Address</StyledInfo>
          </StyledTokenAdornmentWrapper>
        }
        placeholder={value}
        value={value}
        disabled={true}
      />
    </StyledTokenInput>
  )
}

const StyledTokenInput = styled.div`
`

const InlineInput = styled(Input)`
  display: inline-block;
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

const StyledMaxText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  justify-content: flex-end;
`

const StyledTokenSymbol = styled.span`
  color: rgba(37, 37, 44, 0.48);
  font-weight: 700;
`

const StyledInfo = styled(StyledTokenSymbol)`
  margin-right: 10px;
`

export default AddressInput
