import {
  CircularProgress,
  createStyles,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  withStyles,
} from '@material-ui/core'
import React, { useCallback, useState, ChangeEvent, useEffect } from 'react'
import styled from 'styled-components'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import WalletProviderModal from '../../components/WalletProviderModal'
import useETH from '../../hooks/useETH'
import useModal from '../../hooks/useModal'
import useTokenBalance from '../../hooks/useTokenBalance'
import useVBTC from '../../hooks/useVBTC'
import { getStrudelAddress } from '../../tokens/utils'
import { decToBn, formatAddress } from '../../utils'
import VBCHBalances from './components/VBCHBalances'
import StrudelBalances from './components/StrudelBalances'
import BridgeTable from './components/BridgeTable'
import useBSCMediator from '../../hooks/bridgeHooks/useBSCMediator'
import useETHMediator from '../../hooks/bridgeHooks/useETHMediator'
import useXDAItoBSCamb from '../../hooks/bridgeHooks/useXDAItoBSCBridge'
import { ERC20Contract } from '../../tokens/lib/contracts.types'
import showError, { closeError } from '../../utils/showError'
import { getBalanceNumber } from '../../utils/formatBalance'
import useVBCHonBSC from '../../hooks/bridgeHooks/useVBCHonBSC'
import BigNumber from 'bignumber.js'
import useInfura from '../../hooks/useInfura'
import useStrudelOnBSC from '../../hooks/useStrudelOnBSC'
import Web3 from 'web3'
import { ethers } from 'ethers'
import mediator from '../../tokens/lib/abi/mediator.json'
import { contractAddresses } from '../../tokens/lib/constants'
import useInterval from '../../hooks/useInterval'
import { Contract } from 'web3-eth-contract'
import useBSCtoXDAIamb from '../../hooks/bridgeHooks/useBSCtoXDAIBridge'
const BSC_NETWORK_ID = 56

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControlBridge: {
      minWidth: 135,
      color: 'black',
    },
    formControlToken: {
      minWidth: 135,
      color: 'black',
      focused: {
        color: 'black',
      },
    },
  }),
)
interface BridgeEvent {
  loading: boolean
  xDAIlink?: string
  BSClink?: string
  // direction: Directions
  // }
  // interface Pending {
  // loading: true
}

type Assets = 'vBCH' | '$TRDL'
type Directions = 'BSC → Mainnet' | 'Mainnet → BSC'

const Bridge: React.FC = () => {
  const { eth } = useETH()
  const account = eth?.account
  const [onPresentWalletProviderModal] = useModal(
    <WalletProviderModal />,
    'provider',
  )
  const classes = useStyles()
  const [amount, setAmount] = useState<string>('')
  const [direction, setDirection] = useState<Directions | null>(null)
  const [token, setToken] = useState<Assets | null>(null)
  const [openDirection, setOpenDirection] = useState(false)
  const [openToken, setOpenToken] = useState(false)
  const vbtc = useVBTC()
  const mediatorBSC = useBSCMediator()
  const mediatorETH = useETHMediator()
  const XDAItoBSCamb = useXDAItoBSCamb()
  const BSCtoXDAIamb = useBSCtoXDAIamb()
  const [vBCHonMainnetBalance, setVBCHonMainnetBalance] = useState<BigNumber>()
  const [vBCHonBSCBalance, setVBCHonBSCBalance] = useState<BigNumber>()
  const [strudelOnBSCBalance, setStrudelOnBSCBalance] = useState<BigNumber>()
  const [pastEvents, setPastEvents] = useState<BridgeEvent[]>([])
  const [
    strudelOnMainnetBalance,
    setStrudelOnMainnetBalance,
  ] = useState<BigNumber>()
  const [inProgress, setInProgress] = useState<boolean>(false)
  // !!! TODO: put that into provider
  const vBCHonBSC = useVBCHonBSC()
  const infura = useInfura()
  const strudelOnBSC = useStrudelOnBSC()
  const crossingBSCtoXDAI = useState<string[]>()
  // !!! TODO: FIX IT !!!

  useEffect(() => {
    if (strudelOnBSC && account)
      strudelOnBSC.methods
        .balanceOf(account)
        .call()
        .then((s: any) => {
          setStrudelOnBSCBalance(new BigNumber(s))
        })
  }, [strudelOnBSC, account])

  // !!! TODO: FIX IT !!!

  useEffect(() => {
    if (vBCHonBSC && account) {
      vBCHonBSC.methods
        .balanceOf(account)
        .call()
        .then((s: any) => {
          setVBCHonBSCBalance(new BigNumber(s))
        })
    }
  }, [vBCHonBSC, account])

  // useEffect(() => {
  //   if (mediatorBSC) {
  //     const num = 6952280 - 3000
  //     mediatorBSC.getPastEvents(
  //       'allEvents',
  //       { fromBlock: num },
  //       (z: any, a: any) => {
  //         console.log(a, 'aaa')
  //       },
  //     )
  //   }
  // }, [mediatorBSC])

  // !!! TODO: Rewrite that ugly shit !!!
  useEffect(() => {
    if (infura && account) {
      infura.vBCH.methods
        .balanceOf(account)
        .call()
        .then((s: any) => {
          setVBCHonMainnetBalance(new BigNumber(s))
        })
    }
  }, [infura, account])

  useEffect(() => {
    if (infura && account) {
      infura.trdl.methods
        .balanceOf(account)
        .call()
        .then((s: any) => {
          setStrudelOnMainnetBalance(new BigNumber(s))
        })
    }
  }, [infura, account])

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
    const selectedDir = event.target.value as Directions
    const networkId = (window as any).ethereum?.networkVersion

    // const networkId = localStorage.getItem('networkId')

    if (selectedDir === 'BSC → Mainnet' && networkId != '56') {
      showError(
        'To bridge from BSC to ETH Mainnet, please change your network to Binance Smart Chain.',
      )
      return
    }
    if (selectedDir === 'Mainnet → BSC' && networkId != '1') {
      showError(
        'To bridge from ETH Mainnet to BSC, please change your network to Ethereum Mainnet.',
      )
      return
    }
    setDirection(selectedDir)
  }

  const handleTokenChange = (event: ChangeEvent<{ value: unknown }>) => {
    setAmount('0')
    setToken(event.target.value as Assets)
  }

  const checkBalances = (selectedToken: Assets, val: number) => {
    if (direction === 'BSC → Mainnet') {
      if (selectedToken === '$TRDL')
        return getBalanceNumber(strudelOnBSCBalance) >= val
      if (selectedToken === 'vBCH')
        return getBalanceNumber(vBCHonBSCBalance) >= val
    }

    if (direction === 'Mainnet → BSC') {
      if (selectedToken === '$TRDL')
        return getBalanceNumber(strudelOnMainnetBalance) >= val
      if (selectedToken === 'vBCH')
        return getBalanceNumber(vBCHonMainnetBalance) >= val
    }
  }

  const handleAmountChange = (event: any) => {
    const value = event.target.value

    if (!token) {
      closeError()
      showError('Please, select the token before entering the amount.')
    } else if (value === '') {
      setAmount('')
    } else if (checkBalances(token, +value)) {
      setAmount(value)
    } else {
      closeError()
      showError('Insufficient amount!')
    }
  }

  const getBSCLogs = (): Promise<Response> => {
    const topic1 =
      '0xb16caf2d473e44d0108c6834f53654c94a88dbe41bc196539fceeb00e4f1151b'

    const topic2 = '0x000000000000000000000000' + account.substring(2)

    const url = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=6980376&toBlock=latest&address=${contractAddresses.mediator[BSC_NETWORK_ID]}&topic0=${topic1}&topic3=${topic2}&apikey=${process.env.BINANCE_API_KEY}`
    return fetch(url)
  }

  const buildTxs = (
    zipLine: Contract,
    direction: Directions,
    asset: Assets,
  ) => {
    if (account && zipLine) {
      return getBSCLogs()
        .then((res) => {
          return res.json()
        })
        .then(({ result }) => {
          if (
            result ===
            'Max rate limit reached, please use API Key for higher rate limit'
          ) {
            console.error('Max rate limit reached')
            return
          }

          return zipLine
            .getPastEvents('AffirmationCompleted', {
              fromBlock: 15779578,
              toBlock: 'latest',
              filter: {
                sender: contractAddresses.mediator[BSC_NETWORK_ID],
              },
            })
            .then((events: any) => {
              console.log(events, 'eventseventsevents')

              const myEvents = []
              for (const r of result) {
                const id = events.findIndex(
                  (e: any) => r.topics[1] === e.returnValues.messageId,
                )

                if (id > -1) {
                  // myEvents.push({ XDAI: events[id], BSC: r })
                  myEvents.push({
                    xDAIlink:
                      'https://alm-xdai.herokuapp.com/100/' +
                      events[id].transactionHash,
                    BSClink: 'https://bscscan.com/tx/' + r.transactionHash,
                    direction,
                    asset,
                    blockNum: events[id].blockNumber,
                    txIndex: events[id].transactionIndex,
                  })
                } else {
                  myEvents.push({
                    BSClink: 'https://bscscan.com/tx/' + r.transactionHash,
                    direction,
                    asset,
                  })
                }
              }

              console.log(myEvents, 'ooooooo')

              return myEvents.reverse() as any
            })
        })
    }
  }

  useInterval(async () => {
    const events1 = buildTxs(XDAItoBSCamb, 'BSC → Mainnet', 'vBCH')
    // const events2 = buildTxs(BSCtoXDAIamb, 'Mainnet → BSC', 'vBCH')
    // const events3 = buildTxs(BSCtoXDAIamb, 'Mainnet → BSC', 'vBCH')
    // const events4 = buildTxs(BSCtoXDAIamb, 'Mainnet → BSC', 'vBCH')

    const [
      ev1,
      // ev2,
      // ev3, ev4
    ] = await Promise.all([
      events1,
      // events2,
      // events3,
      // events4,
    ])

    const combinedEvents = [...ev1].sort((a, b) => {
      if (a.blockNum === b.blockNum) {
        return a.txIndex - b.txIndex
      } else return a.blockNum - b.blockNum
    })

    setPastEvents(combinedEvents)
  }, 10000)

  const onBridgeCross = () => {
    setInProgress(true)
    let mediator
    let xDAIAMB: ERC20Contract
    // !!! TODO:
    if (token === '$TRDL') {
      console.error('$TRDL not supported yet')
      return
    }
    if (token === 'vBCH') {
      if (direction === 'BSC → Mainnet') {
        mediator = mediatorBSC
        // xDAIAMB = XDAItoBSCamb
      }
      if (direction === 'Mainnet → BSC') {
        mediator = mediatorETH
        // xDAIAMB = BSCtoXDAIamb
      }
    }

    mediator.methods
      .startCross(false, decToBn(Number(amount)).toString(), account)
      .send({
        from: account,
        gas: 200000,
        gasPrice: '5000000000',
      })
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
            <StrudelBalances
              strudelOnMainnetBalance={strudelOnMainnetBalance}
              strudelOnBSCBalance={strudelOnBSCBalance}
            />
          </Container>
          <Spacer size="lg" />
          <Container>
            <VBCHBalances
              vBCHonMainnetBalance={vBCHonMainnetBalance}
              vBCHonBSCBalance={vBCHonBSCBalance}
            />
          </Container>
          <Spacer size="lg" />
          <Container>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              className="main-box-grid"
              style={{ position: 'relative' }}
            >
              {inProgress && (
                <>
                  <OpacityContainer>
                    <CircularProgress
                      disableShrink
                      size={80}
                      style={{ color: 'rgba(229, 147, 16, 1)' }}
                    />
                  </OpacityContainer>
                </>
              )}
              {/* <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              > */}
              <StyledWrapper>
                <div style={{ minWidth: '250px' }}>
                  <AddressInput
                    address={formatAddress(account)}
                    value={formatAddress(account)}
                  />
                  <BurnAmountInput
                    onChange={handleAmountChange}
                    value={amount}
                    symbol={token || ''}
                  />
                </div>
                <Spacer size="md" />

                {/* <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    padding: '8px',
                    minWidth: '240px',
                  }}
                > */}
                <FormControl className={classes.formControlBridge}>
                  <InputLabel
                    style={{ color: 'black' }}
                    id="demo-controlled-open-select-label"
                  >
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
                    <MenuItem value={'BSC → Mainnet'}>BSC → Mainnet</MenuItem>
                    <MenuItem value={'Mainnet → BSC'}>Mainnet → BSC</MenuItem>
                  </Select>
                </FormControl>
                <Spacer size="md" />

                <FormControl className={classes.formControlToken}>
                  <InputLabel
                    style={{ color: 'black' }}
                    id="demo-controlled-open-select-label"
                  >
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
                    <MenuItem value={'vBCH'}>vBCH</MenuItem>
                    <MenuItem value={'$TRDL'}>$TRDL</MenuItem>
                  </Select>
                </FormControl>
                <Spacer size="md" />
              </StyledWrapper>
              {/* </div> */}
              <Button
                disabled={!Number(amount)}
                className="glow-btn orange"
                text="Cross the bridge"
                onClick={onBridgeCross}
              />
            </Grid>
            <Spacer size="lg" />

            <Grid item xs={12} sm={12} md={12} className="main-table-grid">
              <BridgeTable events={pastEvents} />
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
  display: flex;
  justify-content: space-between;
  @media (max-width: 900px) {
    display: flex;
    /* flex-wrap: wrap; */
    /* justify-content: space-between; */
    flex-direction: column;
    align-items: stretch;
  }
`

const OpacityContainer = styled.div`
  z-index: 1;
  background: rgb(255, 255, 255, 0.8);
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
`
export default Bridge
