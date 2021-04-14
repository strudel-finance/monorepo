import React from 'react'
import Page from '../../components/Page'
import { Switch } from 'react-router-dom'
import { ReddishTextTypography } from '../../components/TransactionsTableContainer/TransactionsTableContainer'
import styled from 'styled-components'
const Note: React.FC = () => {
  return (
    <Switch>
      <Page>
        <CenteringDiv
        >
            <ReddishTextTypography>
            If you want to use Terra-Farms, please move to Ethereum Mainnet.
            </ReddishTextTypography>
               
        </CenteringDiv>
      </Page>
    </Switch>
  )
}

// !!! TODO: create styled component that will replace all flex divs
const CenteringDiv = styled.div`
align-items: center;
display: flex;
flex: 1;
margin: 50px;
text-align: center;
`

export default Note
