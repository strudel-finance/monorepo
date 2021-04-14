import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import styled from 'styled-components'
import useETH from '../../../hooks/useETH'
import useModal from '../../../hooks/useModal'
import Button from '../../Button'
import WalletProviderModal from '../../WalletProviderModal'
import AccountModal from './AccountModal'

interface AccountButtonProps { }

const AccountButton: React.FC<AccountButtonProps> = (props) => {
  const [onPresentAccountModal] = useModal(<AccountModal />)
  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    'provider',
  )

  const [shortAdd, setShortAdd] = useState<string>()

  const { eth } = useETH()
  const account = eth?.account

  const handleUnlockClick = useCallback(onPresentWalletProviderModal, [
    onPresentWalletProviderModal,
  ])

  const fancyAdd = (account: string) => {
    return account.substring(0, 6) +
        '...' +
        account.substring(
          account.length - 4,
          account.length,
        )
  }
  
  useEffect(() => {
      if(account)
       setShortAdd(fancyAdd(account))
    }, [account])

  return (
    <StyledAccountButton>
      {!account ? (
        <Button
          onClick={handleUnlockClick}
          size="sm"
          text="Unlock Wallet"
          boxShadowGlow={true}
        />
      ) : (
        <Button
          onClick={onPresentAccountModal}
          size="sm"
          text={shortAdd}
        />
      )}
    </StyledAccountButton>
  )
}

const StyledAccountButton = styled.div``

export default AccountButton
