import { useLottie } from 'lottie-react'
import strudelHeaderAnimation from './strudelHeader.json'
import StrudelMobile from './StrudelMobile.json'

const Lottie = () => {
  const options = {
    animationData: strudelHeaderAnimation,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export const MobileLottie = () => {
  const options = {
    animationData: StrudelMobile,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export default Lottie
