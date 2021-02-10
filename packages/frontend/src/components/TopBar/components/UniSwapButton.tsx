import React, { useCallback } from 'react'
import styled from 'styled-components'
import Button from '../../Button'



interface UniSwapButtonProps {}

const UniSwapButton: React.FC<UniSwapButtonProps> = () => {

  return (
    <StyledAccountButton>
        
        <SwapBtn  onClick={() =>{ window.location.href='http://google.com';}}>Buy $trdl</SwapBtn>
     
        <SwapBtn onClick={ () => {window.location.href='http://google.com';}}>Buy $vBTC</SwapBtn>
     
    </StyledAccountButton>
  )
}


const StyledAccountButton = styled.div`
    display: flex;
`
const SwapBtn = styled.button`
  background-color: #fdb400 !important;
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
