import { toast } from 'react-toastify'

const showError = (message: string) => {
  toast.error(message, {
    progressStyle: {
      zIndex: 100,
    },
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  })
}

export const handleErrors = (response: any) => {
  if (!response.ok) {
    throw Error(response.status)
  }
  return response
}

export default showError
