import React, { useCallback, useEffect, useState } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { useWallet, UseWalletProvider } from 'use-wallet'
import DisclaimerModal from './components/DisclaimerModal'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import TransactionProvider from './contexts/Transactions'
import VBCHProvider from './contexts/VBCHProvider'
import VBTCProvider from './contexts/VBTCProvider'
import BTCtheme from './theme/BTC.theme'
import BCHtheme from './theme/BCH.theme'
import Farms from './views/Farms'
import Home from './views/Home'
import Stake from './views/Stake'
import { useTracking } from './hooks/useTracking'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary } from 'react-error-boundary'

import 'react-toastify/dist/ReactToastify.css'
import RollbarErrorTracking from './errorTracking/rollbar'
import BTC from './views/BTC'
import BCH from './views/BCH'
import EthProvider from './contexts/EthProvider'
import useETH from './hooks/useETH'

declare global {
  interface Window {
    ethereum: any
  }
}

const ErrorFallback = (any: any) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{any.error.message}</pre>
    </div>
  )
}

const myErrorHandler = (error: Error, info: { componentStack: string }) => {
  RollbarErrorTracking.logErroInfo(info)
  RollbarErrorTracking.logErrorInRollbar(error)
}

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)
  const { setUpdate } = useETH()
  
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: any) => {
      setUpdate(true)
    })
  } else {
    window.addEventListener(
      'ethereum#initialized',
      () => { 
        window.ethereum.on('accountsChanged', (accounts: any) => {
          setUpdate(true)
        })
      },
      {
        once: true,
      },
    )
  }

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
  }, [setMobileMenu])

  useTracking('UA-179869676-1')

  return (
    <>
      <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
      <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/farms">
          <Farms />
        </Route>
        <Route path="/BTC">
          <BTC />
        </Route>
        <Route path="/BCH">
          <BCH />
        </Route>
        {false && (
          <Route path="/staking">
            <Stake />
          </Route>
        )}
      </Switch>
    </>
  )
}

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider
           theme={useLocation().pathname.includes('/BCH') ? BCHtheme : BTCtheme}
    >
    <UseWalletProvider
        chainId={1}
        connectors={{
          walletconnect: {
            rpcUrl: 'https://mainnet.eth.aragon.network/',
          },
        }}
      >
        {/* pro */}
        <EthProvider>
          <VBTCProvider>
            <VBCHProvider>
              <TransactionProvider>
                <FarmsProvider>
                  <ModalsProvider>{children}</ModalsProvider>
                </FarmsProvider>
              </TransactionProvider>
            </VBCHProvider>
          </VBTCProvider>
        </EthProvider>
      </UseWalletProvider>
      <ToastContainer limit={3} />
    </ThemeProvider>
  )
}

export default () => (
      <BrowserRouter>
        <Providers >
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
              <App />
          </ErrorBoundary>
        </Providers>
      </BrowserRouter>
)
