import { useContext } from 'react'
import { Context } from '../contexts/BridgeProvider'

const useBridge = () => {
  return useContext(Context)
}

export default useBridge
