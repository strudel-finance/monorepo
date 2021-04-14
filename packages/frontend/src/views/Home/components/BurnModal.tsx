import BigNumber from 'bignumber.js'
import { withStyles } from '@material-ui/core'

import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalContent from '../../../components/ModalContent'
import DangerLabel from '../../../components/DangerLabel'
import Spacer from '../../../components/Spacer'
import Checkbox from '../../../components/Checkbox'
import QRCode from 'qrcode.react'
import StrudelIcon from '../../../components/StrudelIcon'
import OrgIcons from '../../../components/BitcoinIcon'
import VIcons from '../../../components/VBTCIcon'
import { BTCTransaction } from '../../../types/types'
import { urlAssembler } from '../../../utils/urlAssembler'
import useVBCH from '../../../hooks/useVBCH'
import useInfura from '../../../hooks/useInfura'
import { contractAddresses } from '../../../tokens/lib/constants'
import BridgeAbi from '../../../tokens/lib/abi/bridge.json'
interface BurnModalProps extends ModalProps {
  value: number | string
  address: string
  onConfirm?: (amount: string) => void
  onAddition?: (tx: BTCTransaction) => void
  continueV?: boolean
  coin: 'bitcoin' | 'bitcoincash'
}

const Label = styled.div`
  color: #51473f;
  font-weight: 700;
  font-size: 20px;
`

const BurnModal: React.FunctionComponent<BurnModalProps> = ({
  value,
  address,
  onConfirm,
  onAddition,
  continueV = false,
  onDismiss,
  coin
}) => {
  const [checked, setChecked] = useState<boolean>(false)
  const [continued, setContinued] = useState(continueV)
  const [strudelAmount, setStrudelAmount] = useState(null)
  const coinAbrv = coin === 'bitcoincash' ? 'BCH' : 'BTC'
  const infura = useInfura()

  const getInStrudelCurve = (x: number): number => {
    return (-1 * ((x - 63000000) * Math.sqrt(x))) / (3000 * Math.sqrt(21)) / 3
  }

  const calculateStrudel = async () => {
    // more ugly stuff
    
    const Contract = require('web3-eth-contract')
    ;(Contract as any).setProvider(process.env.REACT_APP_BSC_PROVIDER)

    const sideContract = new Contract(
      // add ABI item as type
      BridgeAbi as any[],
      contractAddresses.bridge[56],
    )
    
    const supply =
      coin === 'bitcoin'
        ? new BigNumber(await infura.vBTC.methods.totalSupply().call())
        : new BigNumber(await sideContract.methods.mintedSupply().call())

    let dividedSupply = supply.div(new BigNumber(10e18)).toNumber()
    let calculatedStrudel =
      getInStrudelCurve(dividedSupply + Number(value)) -
      getInStrudelCurve(dividedSupply)
      setStrudelAmount(calculatedStrudel.toFixed(2).toString())
  }

  useEffect(() => {
    calculateStrudel()
  }, [])

  const handleClick = (event: any) => {
    setChecked(!checked)
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
                {coinAbrv === 'BTC' ? (
                  <VIcons.VBTCIcon size={48} />
                ) : (
                  <VIcons.VBCHIcon size={48} />
                )}
              </div>
              <div className="burn-item-content">
                <div className="burn-item-title">v{coinAbrv} Amount</div>
                <div className="burn-item-amount">
                  {value.toString() + ` v${coinAbrv}`}
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
                {coinAbrv === 'BTC' ? (
                  <OrgIcons.BitcoinIcon size={48} />
                ) : (
                  <OrgIcons.BitcoinCashIcon size={48} />
                )}
              </div>
              <div className="burn-item-content">
                <div className="burn-item-title">{coinAbrv} Amount</div>
                <div className="burn-item-amount">
                  {value.toString()} {coinAbrv}
                </div>
              </div>
            </div>
            <div className="checkbox-wrap">
              <DangerLabel
                className="danger-label"
                color="rgba(229,147,16,1)"
                checkbox={<Checkbox onChange={handleCheckboxChange} checked={checked } />}
                text={
                  'Attention: You can only mint v' +
                  coinAbrv +
                  ' when burning ' +
                  coinAbrv
                }
                onClick={handleClick}
              />
            </div>
            <div className="modal-btm">
              {!continued ? (
                <ModalActions>
                  <Button onClick={onDismiss} text="Cancel" />
                  <Button
                    className={
                      'glow-btn' + (coinAbrv === 'BTC' ? ' orange' : ' green')
                    }
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
              <QRCode size={256} value={urlAssembler(coin, address, value)} />
            </StyledBalanceWrapper>
            <StyledBalanceWrapper>
              <StyledBalance>
                <p style={{ wordBreak: 'break-all', textAlign: 'center' }}>
                  {urlAssembler(coin, address, value)}
                </p>
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
        <Spacer size="sm" />
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
