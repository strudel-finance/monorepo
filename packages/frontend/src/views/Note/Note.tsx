import React from 'react'
import Page from '../../components/Page'
import { Switch } from 'react-router-dom'
import { ReddishTextTypography } from '../../components/TransactionsTableContainer/TransactionsTableContainer'
import { CenteringDiv } from '../BTC/BTC'

interface INote {
  affair: string
}

const Note: React.FC<INote> = ({ affair }: INote) => {
  return (
    <Switch>
      <Page>
        <CenteringDiv>
          <ReddishTextTypography>
            If you want to use {affair}, please move to Ethereum Mainnet.
          </ReddishTextTypography>
        </CenteringDiv>
      </Page>
    </Switch>
  )
}

export default Note
