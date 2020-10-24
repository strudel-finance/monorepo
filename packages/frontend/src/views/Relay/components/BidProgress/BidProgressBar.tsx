import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import useInterval from '../../../../hooks/useInterval'
import useVBTC from '../../../../hooks/useVBTC'
import { getRelayContract } from '../../../../vbtc/utils'
import './BidProgressBar.css'

interface IBidProgress {
  currentBlock: number
}

const BidProgressBar: React.FC<IBidProgress> = ({ currentBlock }) => {
  const [heightDigest, setHeightDigest] = useState(currentBlock)
  const vbtc = useVBTC()

  const relayContract = getRelayContract(vbtc)

  const getRelayStatus = async () => {
    const bestKnownDigest = await relayContract.methods
      .getBestKnownDigest()
      .call()
    const heightDigest = await relayContract.methods
      .findHeight(bestKnownDigest)
      .call()

    setHeightDigest(heightDigest)
  }

  useInterval(getRelayStatus, 1000)

  const blockDiff =
    currentBlock - heightDigest > 6 ? 6 : currentBlock - heightDigest

  const progressBarWidth = 100 - blockDiff * 14.2

  const ProgressDiv = styled.div`
    background-color: ${blockDiff > 1
      ? blockDiff > 5
        ? '#D36357'
        : '#FFAC33'
      : '#AFF3D0'};
    width: ${progressBarWidth}%;
    height: 56px;
    border: 1px solid #b5b5b5;
    margin-top: 20px;
    box-sizing: border-box;
    max-width: 1154px;
  `

  const ContainerDiv = styled.div`
    width: 80%;
    @media (min-width: 500px) and (orientation: landscape) {
      padding: 0px 24px;
    }
    max-width: 1200px;
    box-sizing: border-box;
    margin: 50px 0;
  `

  return (
    <>
      <ContainerDiv>
        <div className="loader">
          <div
            className="loader-fill"
            style={{ width: 10, backgroundColor: '#AFF3D0' }}
          >
            <p>{currentBlock}</p>
          </div>
        </div>
        <ProgressDiv>
          <p>{heightDigest}</p>
        </ProgressDiv>
      </ContainerDiv>
    </>
  )
}

export default BidProgressBar
