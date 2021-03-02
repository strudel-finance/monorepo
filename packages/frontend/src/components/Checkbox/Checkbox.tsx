import React from 'react'
import styled from 'styled-components'

interface CheckboxProps {
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
}

const Checkbox: React.FC<CheckboxProps> = (props) => {
  const disabled = 'disabled'
  return <input type="checkbox" {...props} />
}

const Input = styled.input`
  color: #e70013;
  width: 16px;
  height: 16px;
  vertical-align: bottom;
  position: relative;
  top: -3px;
`
export default Checkbox
