import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'

import { Link } from 'react-router-dom'

interface ButtonProps {
  borderButton?: boolean
  boxShadowGlow?: boolean,
  children?: React.ReactNode
  disabled?: boolean
  href?: string
  onClick?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xxxl'
  text?: string
  to?: string
  variant?: 'default' | 'secondary' | 'tertiary'
  backgroundImage?: string
  color?: string
  BCH?: boolean
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
  boxShadowGlow,
  borderButton,
  backgroundImage,
  BCH
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
      {(() => {
        if (size === 'xxxl') {
          return (
            <StyledXXLButton
              boxShadowGlow={boxShadowGlow}
              boxShadow={boxShadow}
              color={buttonColor}
              disabled={disabled}
              fontSize={fontSize}
              onClick={onClick}
              padding={buttonPadding}
              size={buttonSize}
              backgroundImage={backgroundImage}
            >
              {children}
              {ButtonChild}
            </StyledXXLButton>
          )
        }
        
        if (size !== 'xs') {
          if (borderButton) 
            return (
              <StyledButtonBorder
              boxShadowGlow={boxShadowGlow}
              boxShadow={boxShadow}
              color={buttonColor}
              disabled={disabled}
              fontSize={fontSize}
              onClick={onClick}
              padding={buttonPadding}
              size={buttonSize}
              BCH={BCH}
              >
              {children}
              {ButtonChild}
              </StyledButtonBorder>
            )
          
          return (
            <StyledButton
            boxShadowGlow={boxShadowGlow}
            boxShadow={boxShadow}
            color={buttonColor}
            disabled={disabled}
            fontSize={fontSize}
            onClick={onClick}
            padding={buttonPadding}
            size={buttonSize}
            BCH={BCH}
            >
            {children}
            {ButtonChild}
            </StyledButton>
          )
        }
        
        
        
        return (
          <StyledSmallButton
          borderButton={borderButton}
          boxShadowGlow={boxShadowGlow}
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
        )})()}
    </>
  )
}

interface StyledButtonProps {
  boxShadow: string
  borderButton?: boolean
  boxShadowGlow?: boolean
  color: string
  disabled?: boolean
  fontSize: number
  padding: number
  size: number
  backgroundImage?: string
  BCH?: boolean
}

const StyledButtonBorder = styled.button<StyledButtonProps>`
  align-items: center;
  border: 1px solid #25252C52;
  border-radius: 9px;
  background: transparent;
  color: ${(props) => !props.disabled ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.5)'};
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.fontSize}px;
  height: 48px;
  justify-content: center;
  outline: none;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: ${(props) => props.boxShadowGlow ? '0px 0px 30px rgba(229, 147, 16, 0.48)' : ''}; 
  padding-left: ${(props) => props.padding}px;
  padding-right: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  width: 100%;
`

const StyledXXLButton = styled.button<StyledButtonProps>`
  align-items: center;
  border: 1px solid #25252C52;
  border-radius: 9px;
  background: transparent;
  color: ${(props) => !props.disabled ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.5)'};
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.fontSize}px;
  justify-content: center;
  outline: none;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: ${(props) => props.boxShadowGlow ? '0px 0px 30px rgba(229, 147, 16, 0.48)' : ''}; 
  padding-left: ${(props) => props.padding}px;
  padding-right: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  // width: 100%;
  // height: 90px;
  height: 48px;
  width: 300px;
  background-image: url(${(props) => (props.backgroundImage)});
  background-position-y: center;
  background-position-x: center;
`

const StyledButton = styled.button<StyledButtonProps>`
  align-items: center;
  background-color: ${(props) => {
    if(props.BCH) return !props.disabled ? props.theme.color.BCHgreen[100] : 'rgba(229, 147, 16, 0.5)' 
    return !props.disabled ? 'rgba(229, 147, 16, 1)' : 'rgba(229, 147, 16, 0.5)'
  }};
  border: 0;
  border-radius: 9px;
  color: ${(props) => !props.disabled ? props.theme.color.white : props.theme.color.grey[400]};
  cursor: pointer;
  display: flex;
  font-size: ${(props) => props.fontSize}px;
  height: 48px;
  justify-content: center;
  outline: none;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: ${(props) => props.boxShadowGlow ? '0px 0px 30px rgba(229, 147, 16, 0.48)' : ''}; 
  padding-left: ${(props) => props.padding}px;
  padding-right: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  width: 100%;
`

const StyledSmallButton = styled.button<StyledButtonProps>`
  align-items: center;
  background-color: ${(props) => {
    if(props.BCH) return !props.disabled ? props.theme.color.BCHgreen[100] : 'rgba(229, 147, 16, 0.5)' 
    return !props.disabled ? 'rgba(229, 147, 16, 1)' : 'rgba(229, 147, 16, 0.5)'
}};
  border: 0;
  border-radius: 9px;
  color: ${(props) =>
    !props.disabled ? props.theme.color.white : props.theme.color.grey[400]};
  cursor: pointer;
  font-size: ${(props) => props.fontSize}px;
  font-weight: 700;
  justify-content: center;
  outline: none;
  box-shadow: ${(props) => props.boxShadowGlow ? '0px 0px 30px rgba(229, 147, 16, 0.48)' : ''}; 
  padding-top: ${(props) => props.padding}px;
  padding-bottom: ${(props) => props.padding}px;
  pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
  &:hover {
    background-color: ${(props) => 'rgba(236, 175, 78, 1);'};
    transition: all 0.4s ease;
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
