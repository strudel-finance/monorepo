import { useContext } from 'react'
import { Context } from '../contexts/BridgeProvider'

const useBridge = () => {
  const { bridge } = useContext(Context)
  return bridge
}

export default useBridge
