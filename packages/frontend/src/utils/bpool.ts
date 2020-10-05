import Web3 from 'web3'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import BPoolAbi from '../vbtc/lib/abi/BPool.json'
import BigNumber from 'bignumber.js'

export const getWeight = async (
  lpContract: Contract,
  vBtcContract: Contract,
): Promise<string> => {
  try {
    const denormWeight: string = await lpContract.methods
      .getDenormalizedWeight(vBtcContract.options.address)
      .call()

    return new BigNumber(denormWeight)
      .div(new BigNumber(5 * (10 ^ 18)))
      .toString()
  } catch (e) {
    return '1'
  }
}
