import React, { useState } from 'react'
import styled from 'styled-components'
import { getRelayContract, getStrudelContract } from '../../../vbtc/utils'
import useVBTC from '../../../hooks/useVBTC'
import { BigNumber } from 'ethers'
import { useWallet } from 'use-wallet'
import RollbarErrorTracking from '../../../errorTracking/rollbar'
import showError from '../../../utils/showError'
import MuiTextField from '@material-ui/core/TextField'
import Button from '../../../components/Button'
import MuiGrid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core'

const Grid = withStyles({
  container: {
    margin: 0,
  },
})(MuiGrid)

const TextField = withStyles({
  root: {
    width: '100%',
  },
})(MuiTextField)

const WithdrawButton: React.FC = () => {
  const { account, chainId } = useWallet()
  const [startBlock, setStartBlock] = useState(0)
  const [loading, setLoading] = useState(false)
  const vbtc: any = useVBTC()
  const relayContract = getRelayContract(vbtc)
  const strudelContract = getStrudelContract(vbtc)
  const handleChange = (event: any) => {
    setStartBlock(event.target.value)
  }
  const submitWithdraw = async () => {
    setLoading(true)
    await relayContract.methods
      .withdrawBid(startBlock)
      .send({ from: account })
      .catch((error: any) => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          //approveCallback()
          showError(error.message)
          RollbarErrorTracking.logErrorInRollbar(
            'WithdrawBid: ' + error.message,
          )
        } else {
          showError('User rejected request.')
        }
      })
    setLoading(false)
  }
  return (
    <Grid container spacing={3}>
      <Grid item md={3} xs={1}></Grid>
      <Grid item md={3} xs={5}>
        <TextField
          id="outlined-name"
          label="start block"
          type="number"
          value={startBlock}
          onChange={handleChange}
          variant="outlined"
        />
      </Grid>
      <Grid item md={3} xs={5}>
        <Button disabled={loading} onClick={submitWithdraw}>
          Withdraw
        </Button>
      </Grid>
      <Grid item md={3} xs={1}></Grid>
    </Grid>
  )
}

export default WithdrawButton
