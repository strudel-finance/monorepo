import { useLottie } from 'lottie-react'
import strudelHeaderAnimation from './strudelHeader.json'
import StrudelMobile from './StrudelMobile.json'
import STRDL_farm from './STRDL_farm.json'
import vBTCSpin from './vBTC_spin.json'
import strudelOnly from './Strudel_only.json'
import terraFarm from './terra-farm.json'

<<<<<<< Updated upstream
=======
import strudelHeaderAnimation1 from './ANIMATION_STRUDEL.json';

>>>>>>> Stashed changes
const Lottie = () => {
  const options = {
    animationData: strudelHeaderAnimation1,
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

export const StrudelMoving = () => {
  const options = {
    animationData: STRDL_farm,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export const VBTCSpin = () => {
  const options = {
    animationData: vBTCSpin,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export const StrudelOnly = () => {
  const options = {
    animationData: strudelOnly,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export const TerraFarm = () => {
  const options = {
    animationData: terraFarm,
    loop: true,
    autoplay: true,
  }

  const { View } = useLottie(options)

  return View
}

export default Lottie
