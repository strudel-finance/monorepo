import {useContext} from 'react'
import {Context} from '../contexts/VBTCProvider'

const useVBTC = () => {
  const {vbtc} = useContext(Context)
  return vbtc
}

export default useVBTC
