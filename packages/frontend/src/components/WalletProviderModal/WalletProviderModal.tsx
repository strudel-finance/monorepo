import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import metamaskLogo from '../../assets/img/metamask-fox.svg'
import walletConnectLogo from '../../assets/img/wallet-connect.svg'

import Button from '../Button'
import Modal, { ModalProps } from '../Modal'
import ModalActions from '../ModalActions'
import ModalContent from '../ModalContent'
import ModalTitle from '../ModalTitle'
import Spacer from '../Spacer'
import WalletCard from './components/WalletCard'
import { useWeb3React } from '@web3-react/core'
import useETH from '../../hooks/useETH'

const WalletProviderModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { account, connect } = useWallet()
  const { eth, setUpdate } = useETH()

  useEffect(() => {
    console.log('after call')

    if (account) {
      onDismiss()
    }
  }, [account, onDismiss])

  return (
    <Modal>
      <ModalTitle text="Select a wallet provider." />

      <ModalContent>
        <StyledWalletsWrapper>
          <StyledWalletCard>
            <WalletCard
              style={{ boxShadow: 'none' }}
              icon={<img src={metamaskLogo} style={{ height: 32 }} />}
              onConnect={() => connect('injected').then(() => setUpdate(true))}
              title="Metamask"
            />
          </StyledWalletCard>
          <StyledWalletCard>
            <WalletCard
              style={{ boxShadow: 'none' }}
              icon={<img src={walletConnectLogo} style={{ height: 24 }} />}
              onConnect={() =>
                connect('walletconnect').then(() => setUpdate(true))
              }
              title="WalletConnect"
            />
          </StyledWalletCard>
        </StyledWalletsWrapper>
      </ModalContent>

      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} />
      </ModalActions>
    </Modal>
  )
}

const StyledWalletsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  box-shadow: none;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex-direction: column;
    flex-wrap: none;
  }
`

const StyledWalletCard = styled.div`
  flex-basis: calc(50% - ${(props) => props.theme.spacing[2]}px);
`

export default WalletProviderModal
