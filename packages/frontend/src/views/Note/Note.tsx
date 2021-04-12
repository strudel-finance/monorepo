import React from 'react'
import Page from '../../components/Page'
import { Switch } from 'react-router-dom'
const Note: React.FC = () => {
  return (
    <Switch>
      <Page>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          If you want to use Terra-Farms, please move to Ethereum Mainnet.
        </div>
      </Page>
    </Switch>
  )
}

export default Note
