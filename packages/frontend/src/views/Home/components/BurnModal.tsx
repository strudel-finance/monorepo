import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import CardIcon from '../../../components/CardIcon'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import ModalContent from '../../../components/ModalContent'
import TokenInput from '../../../components/TokenInput'
import { getFullDisplayBalance } from '../../../utils/formatBalance'
import Value from '../../../components/Value'
import Label from '../../../components/Label'
import Spacer from '../../../components/Spacer'


interface BurnModalProps extends ModalProps {
  value: number | string,
  address: string,
  onConfirm: (amount: string) => void
}

const BurnModal: React.FC<BurnModalProps> = ({
  value,
  address,
  onConfirm,
  onDismiss,
}) => {
  const [val, setVal] = useState('')
  const [pendingTx, setPendingTx] = useState(false)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  return (
    <Modal>
      <ModalTitle text={`Confirm Transaction`} />
      <ModalContent>
        <Spacer />

        <div style={{ display: 'flex' }}>
          <StyledBalanceWrapper>
            <CardIcon>
              <span>🍣</span>
            </CardIcon>
            <StyledBalance>
              <Label text="Bitcoin sent" />
              <Value value={value} />
            </StyledBalance>
          </StyledBalanceWrapper>
        </div>
        <div style={{ display: 'flex' }}>
          <StyledBalanceWrapper>
            <StyledBalance>
              <Label text="Exchange Rate" />
              <Label text="1 BTC = 1 vBTC" />
            </StyledBalance>
          </StyledBalanceWrapper>
        </div>

        <Spacer />
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

export default BurnModal
