import React from 'react'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'
import backgroundImg from '../../../assets/img/bluewithbtc.png'

const Tokenomics: React.FC = () => (
    <>
    <TokenomicsSection>
        <BlueBTCBackground >
            <Container>
               <SectionWraper>
                <SectionLeft>
                    <TokenomicsTitle>Strudel Token</TokenomicsTitle>
                </SectionLeft>
                <SectionRight>
                    <SectionDesc>$TRDL (/ˈstruːdəl/) is the governance and reward token for the Strudel Protocol. It is created on 2 separate occasions: <br/> When a user crosses BTC over the bridge, $TRDLs are minted alongside vBTC. <br/>  $TRDL rewards are distributed per block to liquidity providers of various terra-farming pools. <br/> 🚀 Terra-farming starts at block #11.021.639 with 1 $TRDL per block.</SectionDesc>
                    <BtnSection>
                        <PitchDeckBtn target="_blank" href="https://etherscan.io/token/0x297d33e17e61c2ddd812389c2105193f8348188a">pitch deck</PitchDeckBtn>
                    </BtnSection>
                </SectionRight>
               </SectionWraper>
                
            </Container>
        </BlueBTCBackground>
        
    </TokenomicsSection>
  </>
)

const TokenomicsSection = styled.div`
    position:relative;
    width:100%;
`
const SectionWraper = styled.div`
    display:flex;
    width: 100%;
    @media only screen and (max-width: 768px){
        flex-direction: column;
        padding-bottomm: 100px;
    }
`

const SectionLeft = styled.div`
    display:flex;
    width: 45%;
    margin-top: 100px;
    @media only screen and (max-width: 768px){
        width: 100%;
        margin: auto;
        font-size: 40px;
        display: flex;
        justify-content: center;
    }
`
const SectionRight = styled.div`
    display:flex;
    flex-direction: column;
    width: 55%;
    @media only screen and (max-width: 768px){
        padding: 45px 0px;
        width: 100%;
        text-align: center;
    }
`
const BlueBTCBackground = styled.div`
    background-image: url(${backgroundImg});
    display: block;
    width:100%;
    padding: 120px 0px 150px 0px;
    background-size: cover;
    background-repeat: no-repeat;
    @media only screen and (max-width: 768px){
        padding: 100px 0px 100px 0px;
    }
`
const TokenomicsTitle = styled.span`
    font-size: 50px;
    font-weight: 600;
    color: white;
    font-family: 'Roboto Mono',monospace;
    @media only screen and (max-width:768px){
        font-size: 40px;
    }
`
const SectionDesc = styled.span`
    font-size: 25px;
    color: white;
    font-family: 'Roboto Mono',monospace;
`
const PitchDeckBtn = styled.a`
    color:white;
    background: #feb400;
    font-size:25px;
    font-family: 'Roboto Mono',monospace;
    border: 0px;
    border-radius: 30px;
    padding: 10px 20px;
    text-decoration: none;
`
const BtnSection = styled.div`
    display:flex;
    justify-content: flex-end;
    margin-right: 50px;
    margin-top: 30px;
    @media only screen and (max-width: 768px){
        margin:auto;
        margin-top: 30px;
    }
`
export default Tokenomics