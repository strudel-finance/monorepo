import {
  createStyles,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core'
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from 'react'
import styled from 'styled-components'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import Button from '../../components/Button'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import Container from '../../components/Container'
import Label from '../../components/Label'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import { StrudelIcon } from '../../components/StrudelIcon'
import ValueBTC from '../../components/ValueBTC'
import WalletProviderModal from '../../components/WalletProviderModal'
import { icons } from '../../helpers/icon'
import useETH from '../../hooks/useETH'
import useModal from '../../hooks/useModal'
import useTokenBalance from '../../hooks/useTokenBalance'
import useVBTC from '../../hooks/useVBTC'
import { getStrudelAddress } from '../../tokens/utils'
import { formatAddress } from '../../utils'
import { getBalanceNumber } from '../../utils/formatBalance'
import showError, { closeError } from '../../utils/showError'
import { ReddishTextTypography } from '../BCH/components/BCHTransactionTable'
import VBCHBalances from './components/VBCHBalances'
import Lock from './components/VBCHBalances'
import StrudelBalances from './components/StrudelBalances'
import Unlock from './components/StrudelBalances'
import useBSCMediator from '../../hooks/useBSCMediator'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControlBridge: {
      width: '100%',
      minWidth: 135,
    },
    formControlToken: {
      width: '100%',
      minWidth: 65,
    },
  }),
)

const Bridge: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    'provider',
  )
  const classes = useStyles()
  const [amount, setAmount] = useState<string>('')
  const [direction, setDirection] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [openDirection, setOpenDirection] = useState(false)
  const [openToken, setOpenToken] = useState(false)
  const vbtc = useVBTC()
  const strudelBalance = useTokenBalance(getStrudelAddress(vbtc))
  const mediatorBSC = useBSCMediator()

  const handleCloseDirection = () => {
    setOpenDirection(false)
  }

  const handleOpenDirection = () => {
    setOpenDirection(true)
  }

  const handleCloseToken = () => {
    setOpenToken(false)
  }

  const handleOpenToken = () => {
    setOpenToken(true)
  }

  const handleDirectionChange = (event: ChangeEvent<{ value: unknown }>) => {
    setDirection(event.target.value as string)
  }

  const handleTokenChange = (event: ChangeEvent<{ value: unknown }>) => {
    setToken(event.target.value as string)
  }

  const onAmountChange = (event: any) => {
    const value = event.target.value.replace(/^0+/, '')

    if (value === '') {
      setAmount('')
    } else if (getBalanceNumber(strudelBalance) >= +event.target.value) {
      setAmount(value)
    } else {
      closeError()
      showError('Insufficient amount')
    }
  }

  return (
    <>
      {account ? (
        <Page>
          <PageHeader
            className="page-header"
            title="Bridge"
            subtitle="Transfer your $TRDL and vBCH from Binance Smart Chain to Ethereum mainnet and vice versa."
          />
          <Container>
            <StrudelBalances />
          </Container>
          <Spacer size="lg" />
          <Container>
            <VBCHBalances />
          </Container>
          <Spacer size="lg" />
          <Container>
            <Grid item xs={12} sm={12} md={12} className="main-box-grid">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <AddressInput
                    address={formatAddress(account)}
                    value={formatAddress(account)}
                  />
                  <BurnAmountInput
                    onChange={onAmountChange}
                    value={amount}
                    symbol="BTC"
                  />
                </div>
                <Spacer size="md" />

                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    padding: '8px',
                    minWidth: '250px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <FormControl className={classes.formControlBridge}>
                      <InputLabel id="demo-controlled-open-select-label">
                        Bridge Direction
                      </InputLabel>
                      <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openDirection}
                        onClose={handleCloseDirection}
                        onOpen={handleOpenDirection}
                        value={direction}
                        onChange={handleDirectionChange}
                      >
                        <MenuItem value={1}>BSC → Mainnet</MenuItem>
                        <MenuItem value={2}>Mainnet → BSC</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <Spacer size="md" />

                  <div style={{ flex: 1 }}>
                    <FormControl className={classes.formControlToken}>
                      <InputLabel id="demo-controlled-open-select-label">
                        Token
                      </InputLabel>
                      <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        open={openToken}
                        onClose={handleCloseToken}
                        onOpen={handleOpenToken}
                        value={token}
                        onChange={handleTokenChange}
                      >
                        <MenuItem value={1}>vBCH</MenuItem>
                        <MenuItem value={2}>$TRDL</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
              <Button
                disabled={!Number(amount)}
                className="glow-btn orange"
                text="Cross the bridge"
                // onClick={onPresentBurn}
              />
            </Grid>
          </Container>
        </Page>
      ) : (
        <Page>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Button
              boxShadowGlow={true}
              onClick={onPresentWalletProviderModal}
              text="Unlock Wallet"
            />
          </div>
        </Page>
      )}
    </>
  )
}

const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 900px) {
    width: 100%;
    flex-flow: column nowrap;
  }
`
export default Bridge
