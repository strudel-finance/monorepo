import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import useETH from './useETH'
// import debounce from 'debounce'

const useBlock = () => {
  const [block, setBlock] = useState(0)
  const { eth } = useETH()
  const provider = eth?.provider

  useEffect(() => {
    if (!provider) return

    const web3 = new Web3(provider);
    web3.eth.getBlockNumber()
    .then((blockNumber: number) =>  setBlock(blockNumber))

    const subscription = web3.eth.subscribe(
      'newBlockHeaders',
      (error, result) => {
        if (!error) {
          setBlock(result.number)
        }
      },
    )

    return () => {
      subscription.unsubscribe(() => console.log('Successsfully unsubscribed'))
    }
  }, [provider])

  return block
}

export default useBlock
