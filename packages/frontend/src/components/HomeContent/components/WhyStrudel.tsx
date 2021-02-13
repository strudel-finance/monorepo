import React from 'react'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'
import backgroundImg from '../../../assets/img/yellowwithbtc.png'
import whystrudellogo from '../../../assets/img/btc_img3.png'
const WhyStrudel: React.FC = () => (
  <>
    <WhyStrudelSection>
        <YelloBTCBackground >
            <Container>
                <WhyStrudelWraper>
                    <WhyStrudelLogo src={whystrudellogo}></WhyStrudelLogo>
                    <SectionTitle>Why Strudel?</SectionTitle>
                    <SectionSubTitle>Current Bitcoin wrapper protocols such as WBTC and renBTC rely on multisig setups to hold the BTC.</SectionSubTitle>
                    <SectionDesc>This poses a security risk because Bitcoin multisigs are capped to around a dozen signers. This means that there is a real possibility of them colluding to remove the undelying value of the wrapped BTC, causing the loss of the peg and value collapse. The strudel protocol adresses this issue by achieving a trustless BTC wrap- per. You do not have to rely on a group of people to hold the keys to the Bitcoins, because the wrapping procedure burns the BTC in order to create a vBTC which is fully compatible with the Ethereum ecosystem.</SectionDesc>
                </WhyStrudelWraper>
                
            </Container>
        </YelloBTCBackground>
        
    </WhyStrudelSection>
  </>
)
const WhyStrudelSection = styled.div`
    position: relative;
    width:100%;
`
const YelloBTCBackground = styled.div`
    background-image: url(${backgroundImg});
    display: block;
    width:100%;
    padding: 100px 0px 200px 0px;
    background-size: cover;
`

const WhyStrudelWraper = styled.div`
    display:flex;
    flex-direction: column;
    text-align: center;

`
const WhyStrudelLogo = styled.img`
    width: 160px;
    height: 160px;
    margin: auto;
`

const SectionTitle = styled.span`
    font-size: 50px;
    font-weight: 600;
    color: #1d71b8;
    font-family: 'Roboto Mono',monospace;
    margin-bottom:30px;
    margin-top: 20px;
    @media only screen and (max-width:768px){
        font-size: 40px;
    }
`

const SectionSubTitle = styled.span`
    font-family: 'Roboto Mono',monospace;
    font-size: 28px;
    font-weight: 600;
    color: black;
    padding: 30px 0px 30px 0px;
`
const SectionDesc = styled.span`
    font-size: 25px;
    color: white;
    font-family: 'Roboto Mono',monospace;
    padding-top: 30px;
`

export default WhyStrudel