import BigNumber from 'bignumber.js'
import { withStyles } from '@material-ui/core'

import React, { useCallback, useMemo, useState, useEffect } from 'react'
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
import DangerLabel from '../../../components/DangerLabel'
import Spacer from '../../../components/Spacer'
import Checkbox from '../../../components/Checkbox'
import QRCode from 'qrcode.react'
import StrudelIcon from '../../../components/StrudelIcon'
import useVBTC from '../../../hooks/useVBTC'
import BitcoinIcon from '../../../components/BitcoinIcon'
import VBTCIcon from '../../../components/VBTCIcon'
import MuiGrid from '@material-ui/core/Grid'
import { getVbtcSupply } from '../../../bridgeTokens/utils'
import { Transaction } from '../../../types/types'
import sb from 'satoshi-bitcoin'

interface BurnModalProps extends ModalProps {
  value: number | string
  address: string
  onConfirm?: (amount: string) => void
  onAddition?: (tx: Transaction) => void
  continueV?: boolean
}

const Label = styled.div`
  color: #51473f;
  font-weight: 700;
  font-size: 20px;
`

const Grid = withStyles({
  item: {
    margin: 'auto',
  },
})(MuiGrid)

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
  const [strudelAmount, setStrudelAmount] = useState(null)
  const vbtc = useVBTC()

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )
  const getInStrudelCurve = (x: number): number => {
    return (-1 * ((x - 63000000) * Math.sqrt(x))) / (3000 * Math.sqrt(21)) / 3
  }

  const calculateStrudel = async () => {
    const supply = await getVbtcSupply(vbtc)
    let dividedSupply = supply.div(new BigNumber(10e18)).toNumber()
    let calculatedStrudel =
      getInStrudelCurve(dividedSupply + Number(value)) -
      getInStrudelCurve(dividedSupply)
    setStrudelAmount(calculatedStrudel.toFixed(0).toString())
  }

  useEffect(() => {
    calculateStrudel()
  }, [])

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
    <Modal className="modal-wrap" classNameChilderen="modal-child-wrap">
      <div className="big-title">Confirm Transaction</div>
      <ModalContent className="modal-content">
        {!continued ? (
          <>
            <div className="burn-item">
              <div className="burn-item-img">
                <VBTCIcon size={48} />
              </div>
              <div className="burn-item-content">
                <div className="burn-item-title">vBTC Amount</div>
                <div className="burn-item-amount">
                  {value.toString() + ' vBTC'}
                </div>
              </div>
            </div>
            <div className="burn-item">
              <div className="burn-item-img">
                <StrudelIcon size={48} />
              </div>
              <div className="burn-item-content">
                <div className="burn-item-title">$TRDL Amount</div>
                <div className="burn-item-amount">{strudelAmount} $TRDL</div>
              </div>
            </div>
            <div className="burn-divider"></div>
            <div className="burn-item">
              <div className="burn-item-img">
                <BitcoinIcon size={48} />
              </div>
              <div className="burn-item-content">
                <div className="burn-item-title">BTC Amount</div>
                <div className="burn-item-amount">{value.toString()} BTC</div>
              </div>
            </div>
            <div className="checkbox-wrap">
              <DangerLabel
                className="danger-label"
                color="rgba(229,147,16,1)"
                checkbox={<Checkbox onChange={handleCheckboxChange} />}
                text="Attention: You can only mint vBTC when burning BTC"
                onClick={handleClick}
              />
            </div>
            <div className="modal-btm">
              {!continued ? (
                <ModalActions>
                  <Button
                    borderButton={true}
                    onClick={onDismiss}
                    text="Cancel"
                  />
                  <Button
                    className="glow-btn orange"
                    text="Confirm transaction"
                    onClick={handleContinue}
                    disabled={!checked}
                  />
                </ModalActions>
              ) : (
                <ModalActions>
                  <Button onClick={onDismiss} text="Close" />
                </ModalActions>
              )}
            </div>
          </>
        ) : (
          <>
            <StyledBalanceWrapper>
              <QRCode
                size={256}
                value={`bitcoin:?r=https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/syn/${address}/${sb
                  .toSatoshi(value)
                  .toString()}`}
              />
            </StyledBalanceWrapper>
            <StyledBalanceWrapper>
              <StyledBalance>
                <p
                  style={{ wordBreak: 'break-all', textAlign: 'center' }}
                >{`bitcoin:?r=https://4uuptfsxqa.execute-api.eu-west-1.amazonaws.com/production/syn/${address}/${sb
                  .toSatoshi(value)
                  .toString()}`}</p>
                <Label>Please scan the following QR code</Label>
                <Label style={{ fontWeight: 500 }}>
                  Check compatible{' '}
                  <a
                    href="https://medium.com/@strudelfinance/how-to-bridge-the-bridge-679891dd0ae8"
                    target="_blank"
                  >
                    wallets
                  </a>
                </Label>
              </StyledBalance>
            </StyledBalanceWrapper>
          </>
        )}
      </ModalContent>
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
