import React, { useState } from 'react'
import styled from 'styled-components'

export interface InputProps {
  endAdornment?: React.ReactNode
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  startAdornment?: React.ReactNode
  value: string
  disabled?: boolean
}

const Input: React.FC<InputProps> = ({
  endAdornment,
  onChange,
  placeholder,
  startAdornment,
  value,
  disabled,
}) => {
  // !!! TODO: combine those 2 into
  // const regex1 = new RegExp(/(^[0-9]{1})+(\.+)*$/)
  // const regex2 = new RegExp(/(^[0-9]{1})+(\.[0-9]+)*$/)

  return (
    <StyledInputWrapper>
      {!!startAdornment && startAdornment}
      <StyledInput
        min="0"
        type="number"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        onKeyDown={(evt) =>
          (evt.key === 'e' || evt.key === '-') && evt.preventDefault()
        }
      />
      {!!endAdornment && endAdornment}
    </StyledInputWrapper>
  )
}

const StyledInputWrapper = styled.div`
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius}px;
  display: flex;
  padding: 0 ${(props) => props.theme.spacing[3]}px;
`

const StyledInput = styled.input`
  width: 100%;
  background: none;
  border: 0;
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 18px;
  flex: 1;
  height: 56px;
  margin: 0;
  padding: 0;
  outline: none;
`

export default Input
