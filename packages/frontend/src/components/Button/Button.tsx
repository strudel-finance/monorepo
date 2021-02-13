import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'

import { Link } from 'react-router-dom'

interface ButtonProps {
  children?: React.ReactNode
  disabled?: boolean
  href?: string
  onClick?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  text?: string
  to?: string
  variant?: 'default' | 'secondary' | 'tertiary'
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  href,
  onClick,
  size,
  text,
  to,
  variant,
}) => {
  const { color, spacing } = useContext(ThemeContext)

  let buttonColor: string
  switch (variant) {
    case 'secondary':
      buttonColor = color.grey[500]
      break
    case 'default':
    default:
      buttonColor = color.primary.main
  }

  let boxShadow: string
  let buttonSize: number
  let buttonPadding: number
  let fontSize: number
  switch (size) {
    case 'xs':
      boxShadow = `2px 2px 5px ${color.grey[300]}`
      buttonPadding = spacing[2]
      buttonSize = 20
      fontSize = 14
      break
    case 'sm':
      boxShadow = `4px 4px 8px ${color.grey[300]}`
      buttonPadding = spacing[3]
      buttonSize = 36
      fontSize = 14
      break
    case 'lg':
      boxShadow = `6px 6px 12px ${color.grey[300]}`
      buttonPadding = spacing[4]
      buttonSize = 72
      fontSize = 16
      break
    case 'md':
    default:
      boxShadow = `6px 6px 12px ${color.grey[300]}`
      buttonPadding = spacing[4]
      buttonSize = 56
      fontSize = 16
  }

  const ButtonChild = useMemo(() => {
    if (to) {
      return <StyledLink to={to}>{text}</StyledLink>
    } else if (href) {
      return (
        <StyledExternalLink href={href} target="__blank">
          {text}
        </StyledExternalLink>
      )
    } else {
      return text
    }
  }, [href, text, to])

  return (
    <>
      {size !== 'xs' ? (
        <StyledButton
          boxShadow={boxShadow}
          color={buttonColor}
          disabled={disabled}
          fontSize={fontSize}
          onClick={onClick}
          padding={buttonPadding}
          size={buttonSize}
        >
          {children}
          {ButtonChild}
        </StyledButton>
      ) : (
        <StyledSmallButton
          boxShadow={boxShadow}
          color={buttonColor}
          disabled={disabled}
          fontSize={fontSize}
          onClick={onClick}
          padding={buttonPadding}
          size={buttonSize}
        >
          {children}
        </StyledSmallButton>
      )}
    </>
  )
}

interface StyledButtonProps {
  boxShadow: string
  color: string
  disabled?: boolean
  fontSize: number
  padding: number
  size: number
}
/*
background-color: ${(props) =>
    !props.disabled
      ? props.theme.color.purple[100]
      : props.theme.color.purple[50]};
*/
const StyledButton = styled.button<StyledButtonProps>`
  align-items: center;
  background-color: #0f70b7;
  border: 0;
  border-radius: 12px;
  box-shadow: ${(props) => props.boxShadow};
  color: ${(props) =>
    !props.disabled ? props.theme.color.white : props.theme.color.grey[400]};
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.fontSize}px;
  font-weight: 700;
  height: ${(props) => props.size}px;
  justify-content: center;
  outline: none;
  padding-left: ${(props) => props.padding}px;
  padding-right: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  width: 100%;
  &:hover {
    background-color: ${(props) => props.theme.color.grey[100]};
    color: ${(props) => props.theme.color.black};
  }
`

const StyledSmallButton = styled.button<StyledButtonProps>`
  align-items: center;
  background-color: ${(props) =>
    !props.disabled
      ? props.theme.color.purple[100]
      : props.theme.color.purple[50]};
  border: 0;
  border-radius: 4px;
  box-shadow: ${(props) => props.boxShadow};
  color: ${(props) =>
    !props.disabled ? props.theme.color.white : props.theme.color.grey[400]};
  cursor: pointer;
  font-size: ${(props) => props.fontSize}px;
  font-weight: 700;
  justify-content: center;
  outline: none;
  padding-top: ${(props) => props.padding}px;
  padding-bottom: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  &:hover {
    background-color: ${(props) => props.theme.color.grey[100]};
    color: ${(props) => props.theme.color.black};
  }
`

const StyledLink = styled(Link)`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 56px;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`

const StyledExternalLink = styled.a`
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  height: 56px;
  justify-content: center;
  margin: 0 ${(props) => -props.theme.spacing[4]}px;
  padding: 0 ${(props) => props.theme.spacing[4]}px;
  text-decoration: none;
`

export default Button
