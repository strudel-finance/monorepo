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
import useBSCAMB from '../../hooks/bridgeHooks/useBSCAMB'
import useETHAMB from '../../hooks/bridgeHooks/useETHAMB'
import useMainnetStudelMediator from '../../hooks/bridgeHooks/useMainnetStrudelMediator'
import Card from '../../components/Card'
import CardContent from '../../components/CardContent'
import Label from '../../components/Label'
import { ExternalLink } from '../../components/TransactionsTableContainer/components/ExternalLink'
import useBlock from '../../hooks/useBlock'

const BSC_NETWORK_ID = 56
const OUR_KEY = '$TRDL-bridgeCrossing'

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
    viewLink: {
      fontSize: 14,
      textDecoration: 'underline',
      cursor: 'pointer',
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
// make Enum for this
type Directions = 'BSC → Mainnet' | 'Mainnet → BSC'

// For each crossing state -> UI adjust

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

  const BSCamb = useBSCAMB()
  const ETHamb = useETHAMB()
  const StrudelMediator = useMainnetStudelMediator()
  const [crossingState, setCrossingState] = useState<CrossingState>({
    stage: 'none',
  })
  const mainnetBlock = useBlock()

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
  }, [infura, account, mainnetBlock])

  useEffect(() => {
    if (infura && account) {
      infura.trdl.methods
        .balanceOf(account)
        .call()
        .then((s: any) => {
          setStrudelOnMainnetBalance(new BigNumber(s))
        })
    }
  }, [infura, account, mainnetBlock])

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

  useEffect(() => {
    if (XDAItoBSCamb && BSCtoXDAIamb && ETHamb && BSCamb) {
      const savedCrossingData = localStorage.getItem(OUR_KEY)
      if (savedCrossingData) crossFlow(JSON.parse(savedCrossingData))
    }
  }, [XDAItoBSCamb, BSCtoXDAIamb, ETHamb, BSCamb])

  // TODO gasPrice  by chain
  const onBridgeCross = () => {
    let mediator

    if (token === '$TRDL') {
      if (direction === 'BSC → Mainnet') {
        mediator = StrudelMediator
        mediator.methods
          .startCross(decToBn(Number(amount)).toString(), account)
          .send({
            from: account,
            gas: 150000,
            gasPrice: '5000000000',
          })
          .on('transactionHash', (txHash: string) => {
            const crossData: CrossData = {
              txHash: txHash,
              direction: 'BSC → Mainnet',
              asset: '$TRDL',
            }
            localStorage.setItem(OUR_KEY, JSON.stringify(crossData))
            crossFlow(crossData)
          })
      }
      if (direction === 'Mainnet → BSC') {
        const strudel = vbtc.contracts.strudel
        strudel.methods
          .approveAndCall(
            '0x1E065d816361bC3E078Ce25AC381B4B8F34F8C30',
            decToBn(Number(amount)).toString(),
            account,
          )
          .send({
            from: account,
            gas: 150000,
          })
          .on('transactionHash', (txHash: string) => {
            const crossData: CrossData = {
              txHash: txHash,
              direction: 'Mainnet → BSC',
              asset: '$TRDL',
            }
            localStorage.setItem(OUR_KEY, JSON.stringify(crossData))
            crossFlow(crossData)
          })
      }
    }
    if (token === 'vBCH') {
      let gasPrice
      if (direction === 'BSC → Mainnet') {
        mediator = mediatorBSC
        gasPrice = '5000000000'
      }
      if (direction === 'Mainnet → BSC') {
        mediator = mediatorETH
      }
      mediator.methods
        .startCross(false, decToBn(Number(amount)).toString(), account)
        .send({
          from: account,
          gas: 150000,
          gasPrice: gasPrice,
        })
        .on('transactionHash', (txHash: string) => {
          const crossData: CrossData = {
            txHash: txHash,
            direction: 'BSC → Mainnet',
            asset: 'vBCH',
          }
          localStorage.setItem(OUR_KEY, JSON.stringify(crossData))
          crossFlow(crossData)
        })
    }
  }

  type CrossData = {
    txHash: string
    direction: Directions
    asset: Assets
  }

  type CrossingStateStage =
    | 'none'
    | 'initTx'
    | 'initTxMined'
    | 'validatorsTxMined'
    | 'confirmationTxMined'

  type CrossingState = {
    stage: CrossingStateStage
    crossData?: CrossData
    firstMsgId?: string
    validatorsTxHash?: string
    confirmationTxHash?: string
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const getCrossMsgId = async (
    txHash: string,
    web3: Web3,
    amb: string,
  ): Promise<string> => {
    let receipt = await web3.eth.getTransactionReceipt(txHash)
    while (!receipt) {
      await sleep(5000)
      receipt = await web3.eth.getTransactionReceipt(txHash)
    }
    return receipt.logs.find(
      (l) => l.address.toLowerCase() == amb.toLowerCase(),
    )?.topics[1]
  }

  const getAMBTxHashViaEvent = async (
    eventName: string,
    msgId: string,
    amb: Contract,
  ): Promise<string> => {
    let pastEvents = await amb.getPastEvents(eventName, {
      filter: {
        messageId: msgId,
      },
      // fromBlock: 'earliest',
      toBlock: 'latest',
    })
    while (pastEvents.length == 0) {
      await sleep(5000)
      pastEvents = await amb.getPastEvents(eventName, {
        filter: {
          messageId: msgId,
        },
        // fromBlock: 'earliest',
        toBlock: 'latest',
      })
    }
    return pastEvents[0].transactionHash
  }

  // reuse getAMBTxHashViaEvent for this
  const getAffirmationTxHash = async (
    msgId: string,
    amb: Contract,
  ): Promise<string> => {
    let pastEvents = await amb.getPastEvents('AffirmationCompleted', {
      filter: {
        messageId: msgId,
      },
      fromBlock: 'earliest',
      toBlock: 'latest',
    })
    while (pastEvents.length == 0) {
      await sleep(5000)
      pastEvents = await amb.getPastEvents('AffirmationCompleted', {
        filter: {
          messageId: msgId,
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })
    }
    return pastEvents[0].transactionHash
  }

  const getValidatorsTx = async (
    msgId: string,
    amb: Contract,
    web3: Web3,
  ): Promise<[string, string]> => {
    const txHash = await getAffirmationTxHash(msgId, amb)

    let receipt = await web3.eth.getTransactionReceipt(txHash)
    while (!receipt) {
      await sleep(5000)
      receipt = await web3.eth.getTransactionReceipt(txHash)
    }
    const UserRequestForSignatureTopic =
      '0x520d2afde79cbd5db58755ac9480f81bc658e5c517fcae7365a3d832590b0183'
    const nextMsgId = receipt.logs.find(
      (l) => l.topics[0] == UserRequestForSignatureTopic,
    )?.topics[1]

    return [txHash, nextMsgId]
  }

  const crossFlow = async (crossData: CrossData) => {
    const { txHash, direction } = crossData

    // initial Effects
    setInProgress(true)
    setCrossingState({
      stage: 'initTx',
      crossData: crossData,
    })

    // construct stuff
    const bscWeb3 = new Web3(process.env.REACT_APP_BSC_PROVIDER)
    const xDaiWeb3 = new Web3(process.env.REACT_APP_XDAI_PROVIDER)
    const mainnetWeb3 = new Web3(process.env.REACT_APP_MAINNET_PROVIDER)

    console.log(direction, 'aaaaaaaaaaaaaaaaaa')
    const web3 = direction == 'BSC → Mainnet' ? bscWeb3 : mainnetWeb3
    const amb =
      direction == 'BSC → Mainnet'
        ? '0x05185872898b6f94aa600177ef41b9334b1fa48b'
        : '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e'
    const xDaiAmb = direction == 'BSC → Mainnet' ? XDAItoBSCamb : BSCtoXDAIamb
    const edgeAmb = direction == 'BSC → Mainnet' ? ETHamb : BSCamb

    const msgId = await getCrossMsgId(txHash, web3, amb)
    setCrossingState({
      stage: 'initTxMined',
      crossData: crossData,
      firstMsgId: msgId,
    })

    const [validatorsTx, nextMsgId] = await getValidatorsTx(
      msgId,
      xDaiAmb,
      xDaiWeb3,
    )
    setCrossingState({
      stage: 'validatorsTxMined',
      crossData: crossData,
      firstMsgId: msgId,
      validatorsTxHash: validatorsTx,
    })

    const confirmationTx = await getAMBTxHashViaEvent(
      'RelayedMessage',
      nextMsgId,
      edgeAmb,
    )
    setCrossingState({
      stage: 'confirmationTxMined',
      crossData: crossData,
      firstMsgId: msgId,
      validatorsTxHash: validatorsTx,
      confirmationTxHash: confirmationTx,
    })

    localStorage.removeItem(OUR_KEY)
    setInProgress(false)
  }

  const renderCrossingState = (crossingState: CrossingState) => {
    let status: null | string = null
    let link: null | string = null
    console.log(crossingState.stage, 'crossingState.stage')

    switch (crossingState.stage) {
      case 'none':
        status = 'No crossing in progress'
        break
      case 'initTx':
        status = 'Initiated Crossing'
        if (crossingState.crossData?.txHash)
          link =
            crossingState.crossData.direction == 'BSC → Mainnet'
              ? 'https://bscscan.com/tx/' + crossingState.crossData?.txHash
              : 'https://etherscan.io/tx/' + crossingState.crossData?.txHash

        // 'https://bscscan.com/tx/' + crossingState.crossData?.txHash

        break
      case 'initTxMined':
        status = 'Message sent over the bridge'
        link =
          crossingState.crossData.direction == 'BSC → Mainnet'
            ? 'https://bscscan.com/tx/' + crossingState.crossData?.txHash
            : 'https://etherscan.io/tx/' + crossingState.crossData?.txHash

        // 'https://bscscan.com/tx/' + crossingState.crossData?.txHash

        break
      case 'validatorsTxMined':
        status = 'Validators transaction minned'
        link =
          crossingState.crossData.direction == 'BSC → Mainnet'
            ? 'https://alm-xdai.herokuapp.com/100/' +
              crossingState.validatorsTxHash
            : 'https://alm-bsc-xdai.herokuapp.com/100/' +
              crossingState.validatorsTxHash
        break
      case 'confirmationTxMined':
        status = 'Crossing finished'
        link =
          crossingState.crossData.direction == 'BSC → Mainnet'
            ? 'https://etherscan.io/tx/' + crossingState.confirmationTxHash
            : 'https://bscscan.com/tx/' + crossingState.confirmationTxHash
        break
    }

    console.log(crossingState.stage, 'crossingState.stagecrossingState.stage')

    return (
      <>
        <div style={{ minWidth: '178px' }}>
          <Label text="Status:" />
          <Spacer size="sm" />
          {crossingState.stage === 'none' ? (
            'Not initialized'
          ) : crossingState.stage === 'validatorsTxMined' ? (
            <span style={{ color: 'red' }}>Action required</span>
          ) : crossingState.stage === 'confirmationTxMined' ? (
            <span style={{ color: 'green' }}>Completed</span>
          ) : (
            <span style={{ color: 'orange' }}>
              Please wait, this may take a while!
            </span>
          )}
          <Spacer size="sm" />
          <Label text="Description:" />
          <Spacer size="sm" />
          {status}
        </div>
        <Spacer size="md" />

        {(() => {
          if (crossingState.stage === 'validatorsTxMined')
            return (
              <>
                <div style={{ minWidth: '133px' }}>
                  <Label text="Bridge Crossing:" />
                  <Spacer size="sm" />

                  <ExternalLink className={classes.viewLink} href={link}>
                    View Crossing
                  </ExternalLink>
                </div>
                <Spacer size="md" />
                <div>
                  <Label text="Instructions:" />
                  <Spacer size="sm" />
                  Confirm the crossing by clicking on the <b>
                    "View Crossing"
                  </b>{' '}
                  link, wait for validators' signatures and then clicking the{' '}
                  <b>"Execute"</b> button.
                </div>
              </>
            )
          else if (link) {
            return (
              <>
                <div>
                  <Label text="Transaction:" />
                  <Spacer size="sm" />

                  <ExternalLink className={classes.viewLink} href={link}>
                    View Transaction
                  </ExternalLink>
                </div>
                <Spacer size="md" />
              </>
            )
          }
        })()}
      </>
    )
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
              <Button
                disabled={!Number(amount)}
                className="glow-btn orange"
                text="Cross the bridge"
                onClick={onBridgeCross}
              />
            </Grid>
            <Spacer size="lg" />
            <Card>
              <CardContent>
                <StyledBalances>
                  <StyledBalance>
                    {renderCrossingState(crossingState)}
                  </StyledBalance>
                </StyledBalances>
              </CardContent>
            </Card>
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

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  // align-items: center;
  display: flex;
  flex: 1;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`

export default Bridge
