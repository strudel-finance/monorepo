import React, { useCallback, useEffect, useState } from 'react'
import Button from '../../Button'
import Card from '../../Card'
import CardContent from '../../CardContent'
import CardIcon from '../../CardIcon'
import CardTitle from '../../CardTitle'
import Spacer from '../../Spacer'
import styled from 'styled-components'
import getChainId from '../../../utils/cahinId'
import showError from '../../../utils/showError'
import useETH from '../../../hooks/useETH'

interface WalletCardProps {
  icon: React.ReactNode
  onConnect: () => void
  title: string,
  style?: any
}

const WalletCard: React.FC<WalletCardProps> = ({ icon, onConnect, title, style }) => {
  const [chainId, setChainId] = useState('')

  return (
    <Card style={style}>
      <CardContent>
        <CardIcon>{icon}</CardIcon>
        <CardTitle text={title} />
        <Spacer />
        <Button
          onClick={async () => {
            onConnect()
            setChainId(await getChainId())
          }}
          text="Connect"
        />
      </CardContent>
    </Card>
  )
}

export default WalletCard
