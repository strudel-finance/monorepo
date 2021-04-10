import { useContext } from 'react'
import { Context } from '../contexts/WalletProvider'

const useETH = () => {
  const eth = useContext(Context)
  return eth
}

export default useETH
