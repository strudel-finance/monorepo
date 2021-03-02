import detectEthereumProvider from '@metamask/detect-provider'

const getChainId = async (): Promise<string> => {
  const provider = await detectEthereumProvider()

  if (provider) {
    return (await provider.request({
      method: 'eth_chainId',
    })) as string
  }
}

export default getChainId
