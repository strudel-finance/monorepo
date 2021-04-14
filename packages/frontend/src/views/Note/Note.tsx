import React from 'react'
import Page from '../../components/Page'
import { Switch } from 'react-router-dom'
import { ReddishTextTypography } from '../../components/TransactionsTableContainer/TransactionsTableContainer'
import { CenteringDiv } from '../BTC/BTC'

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

export default Note
