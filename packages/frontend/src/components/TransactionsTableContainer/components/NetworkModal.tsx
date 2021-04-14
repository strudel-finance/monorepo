import React, { useCallback } from 'react'
import styled from 'styled-components'

import Button from '../../Button'
import Modal, { ModalProps } from '../../Modal'
import ModalActions from '../../ModalActions'
import ModalContent from '../../ModalContent'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '../../../helpers/icon'
// import * as fab from '@fortawesome/'

const NetworkModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const handleSignOutClick = useCallback(() => {
    onDismiss!()
  }, [onDismiss])

  return (
    <Modal>
      <ModalContent>
        <ModalTitle text="Connect to Binance Smart Chain Mainnet" />
        <Spacer />
        <StyledBalanceWrapper>
          If you have already configured this network in MetaMask, then open
          <b> MetaMask {'→'} Network Dropdown</b> at the top of MetaMask and
          select <b>Binance Smart Chain Mainnet</b>.
        </StyledBalanceWrapper>
        <Spacer />
        <StyledBalanceWrapper>
          If you have not configured this network, then open
          <b>
            {' '}
            Metamask {'→'} Settings {'→'} Networks {'→'} Add Network
          </b>{' '}
          and paste the settings below.
        </StyledBalanceWrapper>
        <Spacer />
        <StyledBalanceWrapper>
          <b>Network Name:</b> Binance Smart Chain Mainnet {'  '}
          <CCB text="Binance Smart Chain Mainnet">
            <FontAwesomeIcon icon={icons.copy} />
          </CCB>
        </StyledBalanceWrapper>
        <Spacer />
        <StyledBalanceWrapper>
          <b>RPC URL:</b> https://bsc-dataseed1.binance.org {'  '}
          <CCB text="https://bsc-dataseed1.binance.org">
            <FontAwesomeIcon icon={icons.copy} />
          </CCB>
        </StyledBalanceWrapper>
        <Spacer />
        <StyledBalanceWrapper>
          <b>Chain ID:</b> 56 {'  '}
          <CCB text="56">
            <FontAwesomeIcon icon={icons.copy} />
          </CCB>
        </StyledBalanceWrapper>
        <Spacer />
        <StyledBalanceWrapper>
          <b>Symbol:</b> BNB{'  '}
          <CCB text="BNB">
            <FontAwesomeIcon icon={icons.copy} />
          </CCB>
        </StyledBalanceWrapper>
        <Spacer />
        <StyledBalanceWrapper>
          <b>Explorer URL:</b> https://bscscan.com {'  '}
          <CCB text="https://bscscan.com">
            <FontAwesomeIcon icon={icons.copy} />
          </CCB>
        </StyledBalanceWrapper>
      </ModalContent>
      <ModalActions>
        <Button onClick={onDismiss} text="Cancel" />
      </ModalActions>
    </Modal>
  )
}

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const CCB = styled(CopyToClipboard)`
cursor: pointer;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
`

export default NetworkModal
