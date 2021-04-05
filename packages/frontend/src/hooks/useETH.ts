import { useContext } from 'react'
import { Context } from '../contexts/EthProvider'

const useETH = () => {
  const eth = useContext(Context)
  return eth
}

export default useETH
