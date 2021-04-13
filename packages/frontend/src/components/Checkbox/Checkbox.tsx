import React from 'react'
import styled from 'styled-components'

interface CheckboxProps {
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  onClick?: (e: React.FormEvent<HTMLInputElement>) => void
  checked: boolean
}

const Checkbox: React.FC<CheckboxProps> = (props) => {
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
