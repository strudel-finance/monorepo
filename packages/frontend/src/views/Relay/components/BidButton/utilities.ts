import { BigNumber, utils } from 'ethers'

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const Permit = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

export const getApprovalData = async (
  token: any,
  approve: {
    owner: string
    spender: string
    value: BigNumber
  },
  nonce: BigNumber,
  deadline: BigNumber,
  chainId: number,
): Promise<string> => {
  const name = await token.methods.name().call()

  const domain = {
    name: name,
    version: '1',
    chainId: chainId,
    verifyingContract: token.options.address,
  }
  nonce = BigNumber.from(nonce)
  const message = {
    owner: approve.owner,
    spender: approve.spender,
    value: approve.value.toString(),
    nonce: nonce.toHexString(),
    deadline: deadline.toNumber(),
  }
  return JSON.stringify({
    types: {
      EIP712Domain,
      Permit,
    },
    domain,
    primaryType: 'Permit',
    message,
  })
}
