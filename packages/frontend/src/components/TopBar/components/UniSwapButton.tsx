import React, { useCallback } from 'react'
import styled from 'styled-components'
import Button from '../../Button'



interface UniSwapButtonProps {}

const UniSwapButton: React.FC<UniSwapButtonProps> = () => {

  return (
    <StyledAccountButton>
        
        <SwapBtn onClick={() =>{ window.location.href='https://app.zerion.io/invest/asset/$TRDL-0x297d33e17e61c2ddd812389c2105193f8348188a';}}>Buy $trdl</SwapBtn>
     
        <SwapBtn onClick={ () => {window.location.href='https://app.zerion.io/invest/asset/VBTC-0xe1406825186d63980fd6e2ec61888f7b91c4bae4';}}>Buy $vBTC</SwapBtn>
     
    </StyledAccountButton>
  )
}


const StyledAccountButton = styled.div`
    display: flex;
`
const SwapBtn = styled.button`
  background-color: #0f70b7 !important;
  border-radius:30px;
  border:2px solid #1c6fa6;
  color: white;
  font-size: 16px;
  font-family: 'Noto Sans', sans-serif;
  margin:10px;
  padding: 10px 15px;
  cursor: pointer;
`
export default UniSwapButton
