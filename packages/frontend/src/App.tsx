import React, { useCallback, useState } from 'react'
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import TransactionProvider from './contexts/Transactions'
import VBCHProvider from './contexts/VBCHProvider'
import VBTCProvider from './contexts/VBTCProvider'
import InfuraProvider from './contexts/InfuraProvider'
import BTCtheme from './theme/BTC.theme'
import BCHtheme from './theme/BCH.theme'
import Farms from './views/Farms'
import Home from './views/Home'
import { useTracking } from './hooks/useTracking'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary } from 'react-error-boundary'
import 'react-toastify/dist/ReactToastify.css'
import RollbarErrorTracking from './errorTracking/rollbar'
import BTC from './views/BTC'
import BCH from './views/BCH'
import useETH from './hooks/useETH'
import WalletProvider from './contexts/WalletProvider'
import BridgeProvider from './contexts/BridgeProvider'
import Note from './views/Note'
import Governance from './views/Governance'
import Bridge from './views/Bridge'
import Button from './components/Button/Button'

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
  const { setStatus, setAccount } = useETH()

  const accountChange = (accounts: string[]) => {
    if (!accounts.length) setStatus('inactive')
    else {
      setStatus('active')
      setAccount(accounts[0])
    }
  }

  if ((window as any).ethereum) {
    ;(window as any).ethereum.on('networkChanged', (networkId: string) => {
      localStorage.setItem('networkId', networkId)
      window.location.reload()
    })
    ;(window as any).ethereum.on('accountsChanged', accountChange)
    localStorage.setItem('networkId', (window as any).ethereum.networkVersion)
  } else {
    ;(window as any).addEventListener(
      'ethereum#initialized',
      () => {
        localStorage.setItem(
          'networkId',
          (window as any).ethereum.networkVersion,
        )
        ;(window as any).ethereum.on('accountsChanged', accountChange)
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
          {localStorage.getItem('networkId') == '1' ||
          !localStorage.getItem('networkId') ? (
            <Farms />
          ) : (
            <Note affair={'Strudel Farms'} networks={['Ethereum Mainnet']} />
          )}
        </Route>
        <Route path="/BTC">
          <BTC />
        </Route>
        <Route path="/BCH">
          <BCH />
        </Route>
        <Route path="/clear-crossing">
          <div
            style={{
              display: 'grid',
              padding: '30px',
              placeItems: 'center',
            }}
          >
            <Button
              text="Clear crossing"
              size="xl"
              onClick={() => {
                localStorage.removeItem('$TRDL-bridgeCrossing')
              }}
            />
          </div>
        </Route>
        <Route path="/governance">
          {localStorage.getItem('networkId') == '1' ||
          !localStorage.getItem('networkId') ? (
            <Governance />
          ) : (
            <Note affair={'Governance'} networks={['Ethereum Mainnet']} />
          )}
        </Route>
        {localStorage.getItem('networkId') == '1' ||
        localStorage.getItem('networkId') == '56' ||
        !localStorage.getItem('networkId') ? (
          <Bridge />
        ) : (
          <Note
            affair={'BSC Bridge'}
            networks={['Ethereum Mainnet', 'Binance Smart Chain']}
          />
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
        <InfuraProvider>
          <WalletProvider>
            <BridgeProvider>
              <VBTCProvider>
                <VBCHProvider>
                  <TransactionProvider>
                    <FarmsProvider>
                      <ModalsProvider>{children}</ModalsProvider>
                    </FarmsProvider>
                  </TransactionProvider>
                </VBCHProvider>
              </VBTCProvider>
            </BridgeProvider>
          </WalletProvider>
        </InfuraProvider>
      </UseWalletProvider>
      <ToastContainer limit={3} />
    </ThemeProvider>
  )
}

export default () => (
  <BrowserRouter>
    <Providers>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
        <App />
      </ErrorBoundary>
    </Providers>
  </BrowserRouter>
)
