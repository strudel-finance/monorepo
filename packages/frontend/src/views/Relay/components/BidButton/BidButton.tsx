import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  getRelayContract,
  getStrudelContract,
  getRelayAddress,
} from '../../../../vbtc/utils'
import useVBTC from '../../../../hooks/useVBTC'
import { getApprovalData } from './utilities'
import { BigNumber } from 'ethers'
import BN from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { splitSignature } from 'ethers/lib/utils'
import RollbarErrorTracking from '../../../../errorTracking/rollbar'
import showError from '../../../../utils/showError'
import MuiTextField from '@material-ui/core/TextField'
import Button from '../../../../components/Button'
import MuiGrid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import { withStyles } from '@material-ui/core'

const Grid = withStyles({
  container: {
    margin: 0,
  },
})(MuiGrid)
interface BidButtonProps {
  startBlock: number
}
const TextField = withStyles({
  root: {
    width: '100%',
  },
})(MuiTextField)

const MAX = BigNumber.from(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
)
interface Signature {
  r: string
  s: string
  v: number
}

const BidButton: React.FC<BidButtonProps> = ({ startBlock }) => {
  const { account, chainId } = useWallet()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(new BN(0))
  const [displayAmount, setDisplayAmount] = useState(0)
  const vbtc: any = useVBTC()
  const relayContract = getRelayContract(vbtc)
  const strudelContract = getStrudelContract(vbtc)
  const relayAddress = getRelayAddress(vbtc)
  const errorHandling = (error: any) => {
    setLoading(false)
    // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
    if (error?.code !== 4001) {
      //approveCallback()
      showError(error.message)
      RollbarErrorTracking.logErrorInRollbar(
        'ExecuteBidWithPermit: ' + error.message,
      )
    } else {
      showError('User denied message signature.')
    }
  }
  const executeBidwithPermit = async (sig: Signature, deadline: number) => {
    await relayContract.methods
      .bidWithPermit(
        startBlock,
        amount.toString(),
        deadline,
        sig.v,
        sig.r,
        sig.s,
      )
      .send({ from: account })
      .catch(errorHandling)
    setLoading(false)
  }
  const handleChange = (event: any) => {
    setAmount(new BN(event.target.value).times(1e18))
    setDisplayAmount(event.target.value)
  }

  const executeBid = async () => {
    await relayContract.methods
      .bid(startBlock, amount.toString())
      .send({ from: account })
      .catch(errorHandling)
    setLoading(false)
  }

  const submitBid = async () => {
    setLoading(true)
    console.log(amount.toString())
    const allowance = await strudelContract.methods
      .allowance(account, relayAddress)
      .call()
    const balance = await strudelContract.methods.balanceOf(account).call()
    if (balance < amount) {
      showError('You do not own enough Strudel.')
      setLoading(false)
      return
    }
    if (amount > allowance) {
      const nonce = await strudelContract.methods.nonces(account).call()
      let dt = new Date()
      dt.setHours(dt.getHours() + 1)
      const deadline = BigNumber.from(Math.floor(dt.getTime() / 1000))

      const data = await getApprovalData(
        strudelContract,
        {
          owner: account,
          spender: relayAddress,
          value: MAX,
        },
        nonce,
        deadline,
        chainId,
      )

      vbtc.web3.currentProvider
        .send('eth_signTypedData_v4', [account, data])
        .then((signature: any) => signature.result)
        .then(splitSignature)
        .then((signature: Signature) => {
          executeBidwithPermit(signature, deadline.toNumber())
        })
        .catch(errorHandling)
    } else {
      executeBid()
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item md={3} xs={1}></Grid>
      <Grid item md={3} xs={5}>
        <TextField
          id="outlined-name"
          label="Amount"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">$TRDL</InputAdornment>,
          }}
          value={displayAmount}
          onChange={handleChange}
          variant="outlined"
        />
      </Grid>
      <Grid item md={3} xs={5}>
        <Button disabled={loading} onClick={submitBid}>
          Bid
        </Button>
      </Grid>
      <Grid item md={3} xs={1}></Grid>
    </Grid>
  )
}

export default BidButton
