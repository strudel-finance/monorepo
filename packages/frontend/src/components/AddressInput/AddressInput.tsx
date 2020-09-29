import React from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Input, {InputProps} from '../Input'

interface AddressInputProps extends InputProps {
  address: string
}

const AddressInput: React.FC<AddressInputProps> = ({value, onChange}) => {
  const disabled = 'disabled'
  return (
    <StyledTokenInput>
      <Input
        startAdornment={
          <StyledTokenAdornmentWrapper>
            <StyledInfo>Address</StyledInfo>
          </StyledTokenAdornmentWrapper>
        }
        placeholder="0"
        value={value}
        disabled={true}
      />
    </StyledTokenInput>
  )
}

const StyledTokenInput = styled.div`
  margin: 5px;
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
  color: ${(props) => props.theme.color.grey[600]};
  font-weight: 700;
`

const StyledInfo = styled(StyledTokenSymbol)`
  margin-right: 10px;
`

export default AddressInput
