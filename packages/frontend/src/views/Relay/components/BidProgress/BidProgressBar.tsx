import React, { useEffect, useState } from 'react'
import { getRelayContract } from '../../../../vbtc/utils'
import './BidProgressBar.css'

interface BidProgress {
  startBlock: number
}

const BidProgressBar: React.FC<BidProgress> = ({ startBlock }) => {
  console.log(startBlock, 'startBlock')
  const SLOT_LENGTH = 144

  const getNextStart = (startBlock: number) => {
    return startBlock + (SLOT_LENGTH - (startBlock % SLOT_LENGTH))
  }

  return (
    <>
      <div className="loader">
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#AFF3D0' }}
        >
          <p>{startBlock}</p>
        </div>
      </div>

      <div className="loader">
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#D36357' }}
        ></div>
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#D36357' }}
        ></div>
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#FFAC33' }}
        ></div>
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#FFAC33' }}
        ></div>
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#AFF3D0' }}
        ></div>
        <div
          className="loader-fill"
          style={{ width: 10, backgroundColor: '#AFF3D0' }}
        >
          <p>{startBlock}</p>
        </div>
      </div>
    </>
  )
}

export default BidProgressBar
