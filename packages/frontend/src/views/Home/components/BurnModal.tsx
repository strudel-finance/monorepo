import BigNumber from 'bignumber.js'
import React, {useCallback, useMemo, useState} from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import CardIcon from '../../../components/CardIcon'
import Modal, {ModalProps} from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import ModalContent from '../../../components/ModalContent'
import TokenInput from '../../../components/TokenInput'
import {getFullDisplayBalance} from '../../../utils/formatBalance'
import Value from '../../../components/Value'
import Label from '../../../components/Label'
import DangerLabel from '../../../components/DangerLabel'
import Spacer from '../../../components/Spacer'
import Checkbox from '../../../components/Checkbox'
import {Transaction} from '../../../components/TransactionsTableContainer'
import QRCode from 'qrcode.react'

import sb from 'satoshi-bitcoin'

interface BurnModalProps extends ModalProps {
  value: number | string
  address: string
  onConfirm?: (amount: string) => void
  onAddition?: (tx: Transaction) => void
  continueV?: boolean
}

const BurnModal: React.FunctionComponent<BurnModalProps> = ({
  value,
  address,
  onConfirm,
  onAddition,
  continueV = false,
  onDismiss,
}) => {
  const [val, setVal] = useState('')
  const [pendingTx, setPendingTx] = useState(false)
  const [checked, setChecked] = useState(false)
  const [continued, setContinued] = useState(continueV)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  const handleClick = (event: any) => {
    event.target.firstElementChild.checked = !event.target.firstElementChild
      .checked
    setChecked(event.target.firstElementChild.checked)
    onAddition({
      txCreatedAt: new Date(),
      value: String(value),
      ethAddress: address,
    })
  }

  const handleContinue = () => {
    setContinued(true)
  }

  const handleCheckboxChange = (event: any) => {
    setChecked(event.target.checked)
  }

  return (
    <Modal>
      <ModalTitle text={`Confirm Transaction`} />
      <ModalContent>
        <Spacer />
        {!continued ? (
          <div>
            <div style={{display: 'flex'}}>
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
            <div style={{display: 'flex'}}>
              <StyledBalanceWrapper>
                <StyledBalance>
                  <Label text="Exchange Rate" />
                  <Label text="1 BTC = 1 vBTC" />
                </StyledBalance>
              </StyledBalanceWrapper>
            </div>
            <div style={{display: 'flex'}}>
              <StyledBalanceWrapper>
                <StyledBalance>
                  <DangerLabel
                    checkbox={<Checkbox onChange={handleCheckboxChange} />}
                    text="Danger: Your bitcoins will be irretrievably burnt."
                    onClick={handleClick}
                  />
                </StyledBalance>
              </StyledBalanceWrapper>
            </div>
          </div>
        ) : (
          <div>
            <div style={{display: 'flex'}}>
              <StyledBalanceWrapper>
                <QRCode
                  size={256}
                  value={`bitcoin:?r=https://bip70.strudel.finance/${address}/${sb
                    .toSatoshi(value)
                    .toString()}`}
                />
              </StyledBalanceWrapper>
            </div>
            <div style={{display: 'flex'}}>
              <StyledBalanceWrapper>
                <StyledBalance>
                  <Label text="Please scan the following QR code" />
                </StyledBalance>
              </StyledBalanceWrapper>
            </div>
          </div>
        )}
        <Spacer />
      </ModalContent>
      {!continued ? (
        <ModalActions>
          <Button
            onClick={handleContinue}
            text="Continue"
            disabled={!checked}
          />
          <Button onClick={onDismiss} text="Cancel" />
        </ModalActions>
      ) : (
        <ModalActions>
          <Button onClick={onDismiss} text="Close" />
        </ModalActions>
      )}
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
