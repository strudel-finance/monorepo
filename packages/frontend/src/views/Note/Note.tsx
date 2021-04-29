import React from 'react'
import Page from '../../components/Page'
import { Switch } from 'react-router-dom'
import { ReddishTextTypography } from '../../components/TransactionsTableContainer/TransactionsTableContainer'
import { CenteringDiv } from '../BTC/BTC'

interface INote {
  affair: string
  networks: string[]
}

const Note: React.FC<INote> = ({ affair, networks }: INote) => {
  return (
    <Switch>
      <Page>
        <CenteringDiv>
          <ReddishTextTypography>
            If you want to use {affair}, please move to{' '}
            {networks.reduce((acc, el, i) => {
              if (i) return acc + ' or ' + el
              return acc + el
            }, '')}
            .
          </ReddishTextTypography>
        </CenteringDiv>
      </Page>
    </Switch>
  )
}

export default Note
