import Rollbar from 'rollbar'
const RollbarErrorTracking = (() => {
  // This halts the app
  // const RollbarObj = new Rollbar({
  //   accessToken: process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN,
  //   captureUncaught: true,
  //   captureUnhandledRejections: true,
  // })
  const logErroInfo = (info: any) => {
    //RollbarObj.info(info)
  }
  const logErrorInRollbar = (error: any) => {
    //RollbarObj.error(error)
  }
  return { logErroInfo, logErrorInRollbar }
})()
export default RollbarErrorTracking
