import React, {useCallback, useEffect, useState} from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {ThemeProvider} from 'styled-components'
import {UseWalletProvider} from 'use-wallet'
import DisclaimerModal from './components/DisclaimerModal'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import TransactionProvider from './contexts/Transactions'
import VBTCProvider from './contexts/VBTCProvider'
import useModal from './hooks/useModal'
import theme from './theme'
import Farms from './views/Farms'
import Home from './views/Home'
import Stake from './views/Stake'

import {ToastContainer} from 'react-toastify'
import {ErrorBoundary} from 'react-error-boundary'

import 'react-toastify/dist/ReactToastify.css'
import RollbarErrorTracking from './errorTracking/rollbar'

const ErrorFallback = (any: any) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{color: 'red'}}>{any.error.message}</pre>
    </div>
  )
}

const myErrorHandler = (error: Error, info: {componentStack: string}) => {
  RollbarErrorTracking.logErroInfo(info)
  RollbarErrorTracking.logErrorInRollbar(error)
}

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
  }, [setMobileMenu])

  return (
    <Providers>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
        <Router>
          <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
          <MobileMenu
            onDismiss={handleDismissMobileMenu}
            visible={mobileMenu}
          />
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/farms">
              <Farms />
            </Route>
            {false && (
              <Route path="/staking">
                <Stake />
              </Route>
            )}
          </Switch>
        </Router>
        <Disclaimer />
      </ErrorBoundary>
    </Providers>
  )
}

const Providers: React.FC = ({children}) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider
        chainId={5}
        connectors={{
          walletconnect: {
            rpcUrl:
              'https://goerli.infura.io/v3/f1ff6ab81a744f4a851714c0b8c20d21',
            //'https://goerli.eth.aragon.network/',
          },
        }}
        //TODO fix problems with walletconnect
      >
        <VBTCProvider>
          <TransactionProvider>
            <FarmsProvider>
              <ModalsProvider>
                {children}
                <ToastContainer limit={3} />
              </ModalsProvider>
            </FarmsProvider>
          </TransactionProvider>
        </VBTCProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

const Disclaimer: React.FC = () => {
  const markSeen = useCallback(() => {
    localStorage.setItem('disclaimer', 'seen')
  }, [])

  const [onPresentDisclaimerModal] = useModal(
    <DisclaimerModal onConfirm={markSeen} />,
  )

  useEffect(() => {
    //const seenDisclaimer = true
    const seenDisclaimer = localStorage.getItem('disclaimer')
    if (!seenDisclaimer) {
      onPresentDisclaimerModal()
    }
  }, [])

  return <div />
}

export default App
