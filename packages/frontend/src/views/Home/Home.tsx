import React, {useCallback, useState, useMemo} from 'react'
import styled from 'styled-components'
import {useWallet} from 'use-wallet'
import WalletProviderModal from '../../components/WalletProviderModal'

import chef from '../../assets/img/chef.png'
import Button from '../../components/Button'
import Container from '../../components/Container'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'
import AddressInput from '../../components/AddressInput'
import BurnAmountInput from '../../components/BurnAmountInput'
import Balances from './components/Balances'
import formatAddress from '../../utils/formatAddress'
import useModal from '../../hooks/useModal'
import BurnModal from './components/BurnModal'

const Home: React.FC = () => {
  const [val, setVal] = useState('0')

  const [address, setAddress] = useState(
    '0x0000000000000000000000000000000000000000',
  )
  const wallet = useWallet()
  const account = wallet.account
  const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

  const [onPresentBurn] = useModal(
    <BurnModal value={val} address={account} onConfirm={() => {}} />,
  )

  const handleAmountChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal],
  )

  return (
    <Page>
      <PageHeader
        icon={<img src={chef} height={120} />}
        title="The Vortex is ready"
        subtitle="Burn BTC to receive vBTC and $STRDL!"
      />
      {wallet.status === 'connected' ? (
        <Container>
          <AddressInput address={account} value={account} />
          <BurnAmountInput
            onChange={handleAmountChange}
            value={val}
            symbol="BTC"
          />
          <Button text={'Get vBTC'} onClick={onPresentBurn} />
        </Container>
      ) : (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={onPresentWalletProviderModal}
            text="🔓 Unlock Wallet"
          />
        </div>
      )}
      <Spacer size="lg" />
      <StyledInfo>
        🏆<b>Pro Tip</b>: SUSHI-ETH UNI-V2 LP token pool yields TWICE more token
        rewards per block.
      </StyledInfo>
      <Spacer size="lg" />
      <Container>
        <Balances />
      </Container>
      <Spacer size="lg" />
      <div
        style={{
          margin: '0 auto',
        }}
      >
        <Button text="🔪 See the Menu" to="/farms" variant="secondary" />
      </div>
    </Page>
  )
}

const StyledInfo = styled.h3`
  color: ${(props) => props.theme.color.grey[500]};
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;

  > b {
    color: ${(props) => props.theme.color.grey[600]};
  }
`

export default Home
