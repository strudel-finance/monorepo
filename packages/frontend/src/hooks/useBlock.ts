import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import useETH from './useETH'
// import debounce from 'debounce'

const useBlock = () => {
  const [block, setBlock] = useState(0)
  const { eth } = useETH()
  const provider = eth?.provider

  useEffect(() => {
    // const setBlockDebounced = debounce(setBlock, 300)
    if (!provider) return
    const web3 = new Web3(provider)

    // const subscription = new Web3(provider).eth.subscribe(
    //   'newBlockHeaders',
    //   (error, result) => {
    //     if (!error) {
    //       setBlockDebounced(result.number)
    //     }
    //   },
    // )

    const interval = setInterval(async () => {
      const latestBlockNumber = await web3.eth.getBlockNumber()
      if (block !== latestBlockNumber) {
        setBlock(latestBlockNumber)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [provider])

  return block
}

export default useBlock
