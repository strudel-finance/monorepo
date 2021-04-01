import { useContext } from 'react'
import { Context } from '../contexts/VBCHProvider'

const useVBCH = () => {
  const { vbch } = useContext(Context)
  return vbch
}

export default useVBCH
