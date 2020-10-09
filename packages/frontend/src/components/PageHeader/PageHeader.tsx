import React from 'react'
import styled from 'styled-components'

import Container from '../Container'

interface PageHeaderProps {
  icon?: React.ReactNode
  iconSize?: number
  subtitle?: string
  title?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  iconSize = 120,
  subtitle,
  title,
}) => {
  const StyledIcon = styled.div`
    & > div {
      height: ${iconSize}px;
    }
    font-size: ${iconSize}px;
    height: ${iconSize}px;
    line-height: ${iconSize}px;
    text-align: center;
    width: ${iconSize}px;
  `
  return (
    <Container size="sm">
      <StyledPageHeader>
        {icon && <StyledIcon>{icon}</StyledIcon>}
        <StyledTitle>{title}</StyledTitle>
        <StyledSubtitle>{subtitle}</StyledSubtitle>
      </StyledPageHeader>
    </Container>
  )
}

const StyledPageHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-bottom: ${(props) => props.theme.spacing[6]}px;
  padding-top: ${(props) => props.theme.spacing[6]}px;
  margin: 0 auto;
`

const StyledTitle = styled.h1`
  text-align: center;
  font-family: 'Falstin', sans-serif;
  color: ${(props) => props.theme.color.grey[600]};
  font-size: 49px;
  font-weight: 500;
  margin: 0;
  padding: 0;
`

const StyledSubtitle = styled.h3`
  color: ${(props) => props.theme.color.grey[400]};
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`

export default PageHeader
