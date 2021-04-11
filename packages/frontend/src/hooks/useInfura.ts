import { useContext } from 'react'
import { Context } from '../contexts/InfuraProvider'

const useInfura = () => {
  return useContext(Context)
}

export default useInfura
