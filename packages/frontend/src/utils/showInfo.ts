import { toast } from 'react-toastify'

const showInfo = (message: string, position = "bottom-right", autoClose = 5000, hideProgressBar = true) => {
  toast.info(message, {
    progressStyle: {
      zIndex: 100,
    },
    // @ts-ignore
    position,
    autoClose,
    hideProgressBar: hideProgressBar,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    // progress: undefined,
  })
}

export const closeInfo = () => {
  toast.dismiss()
}

export default showInfo
