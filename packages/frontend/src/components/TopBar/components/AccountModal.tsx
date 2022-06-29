import React, { useCallback } from 'react'
import styled from 'styled-components'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useVBTC from '../../../hooks/useVBTC'
import {
  getStrudelAddress,
  getVbtcAddress,
  getVbchAddress,
} from '../../../tokens/utils'
import { getBalanceNumber } from '../../../utils/formatBalance'
import Button from '../../Button'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalActions from '../../ModalActions'
import ModalContent from '../../ModalContent'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'
import Value from '../../Value'
import ValueBTC from '../../ValueBTC'
import { StrudelIcon } from '../../StrudelIcon'
import useETH from '../../../hooks/useETH'
// import useVBCH from '../../../hooks/useVBCH'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const { eth, setStatus } = useETH()
  const account = eth?.account

  const handleSignOutClick = useCallback(() => {
    onDismiss!()
    setStatus('inactive')
  }, [onDismiss])

  const vbtc = useVBTC()
  const strudelBalance = useTokenBalance(getStrudelAddress(vbtc))
  const vbtcBalance = useTokenBalance(getVbtcAddress(vbtc))
  
  // !!! TODO: do it for xDaiTotal vBTC Supply
  // const vbch = useVBCH()
  // const vbchBalance = useTokenBalance(getVbchAddress(vbch))

  const networkId = Number((window as any).ethereum?.networkVersion);

  // Extract these to a function
  let onWhichBlockchain;
  let blockchainExplorer;
  let onWhichBlockchainExplorer;
  if (networkId === 1) { // ETH
    // onWhichBlockchain = "on ETH Mainnet"
    onWhichBlockchain = "on ETH"

    blockchainExplorer = "https://etherscan.io";
    onWhichBlockchainExplorer = "on Etherscan";
  }
  else if (networkId === 56) { // BSC
    // onWhichBlockchain = "on Binance Smart Chain"
    onWhichBlockchain = "on BSC"

    blockchainExplorer = "https://bscscan.com";
    onWhichBlockchainExplorer = "on BscScan"
  }
  else if (networkId === 1666600000) { // Harmony
    // onWhichBlockchain = "on Harmony Mainnet"
    onWhichBlockchain = "on Harmony"

    blockchainExplorer = "https://explorer.harmony.one";
    onWhichBlockchainExplorer = "on Harmony Blockchain Explorer"
  }

  return (
    <Modal>
      <ModalTitle text={`My Account ${onWhichBlockchain}`} />
      <ModalContent>
        <div style={{ display: 'flex' }}>
          <StyledBalanceWrapper>
            <StrudelIcon size={80} />
            <Spacer />
            <StyledBalance>
              <Value value={getBalanceNumber(strudelBalance)} />
              <Label text="$TRDL Balance" />
            </StyledBalance>
            <StyledBalance>
              <ValueBTC value={getBalanceNumber(vbtcBalance)} />
              <Label text="vBTC Balance" />
            </StyledBalance>
          </StyledBalanceWrapper>
        </div>

        <Spacer />
        <Button
          href={`${blockchainExplorer}/address/${account}`}
          text={`View ${onWhichBlockchainExplorer}`}
          variant="secondary"
        />
        <Spacer />
        <Button
          onClick={handleSignOutClick}
          text="Sign out"
          variant="secondary"
        />
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

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`

export default AccountModal


