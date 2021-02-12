import React from 'react'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'
import btc_img1 from '../../../assets/img/btc_img1.png'
import btc_img2 from '../../../assets/img/btc_img2.png'

const HomeStrudel: React.FC = () => (
<Container>
  <HomeStrudelContainer>
    <FirstSection>
        <FirstSectionLeft>
            <SectionTitle>
                What is Strudel
            </SectionTitle>
            <SectionDesc>
            Strudel is the first one-way, trustless bridge link- ing Bitcoin to Ethereum. vBTC, the resulting asset, trades off counterparty risk for market risk, bring- ing more diversity to the tokenized-BTC landscape. In the long term Strudel is about using the forces of crypto-economics to challenge the status quo of blockchain and free BTC from the grip of Wall Street.
            </SectionDesc>
        </FirstSectionLeft>
        <FirstSectionRight>
            <FirstSectionImg src={btc_img1} />
        </FirstSectionRight>
    </FirstSection>

    <SecondSection>
        <SecondSectionImg src={btc_img2} />
        <SectionTitle>
            Problem with Bitcoin    
        </SectionTitle>
        <SectionSubTitle>
            There is really not much you can do with a Bitcoin.
        </SectionSubTitle>
        <SectionDesc1>
        The network is slow, outdated and relies on centralized services to trade with no smart contracts. Decentralized Finance allows people to be their own bank. They can gain interest on their assets, get loans and trade without having to relinquish control of their tokens.
        </SectionDesc1>
        <SectionDesc1>
        For Bitcoin to participate in these protocols it needs to be wrapped into the Ethereum chain in order to be compatible. A wrapped token is really a IOU that is emmited into the Ethereum network for every BTC deposited into a wrapper protocol.
        </SectionDesc1>
    </SecondSection>
    
  </HomeStrudelContainer>
</Container>
)
const HomeStrudelContainer = styled.div`
    padding:200px 0px;
    @media only screen and (max-width: 768px){
        padding:100px 0px;
    }
`
const FirstSectionImg = styled.img`
    width:100%;
    object-fit: contain;
`
const FirstSection = styled.div`
    display:flex;
    padding-bottom: 200px;
    width: 100%;
    @media only screen and (max-width: 768px){
        flex-direction: column-reverse;
        padding-bottomm: 100px;
    }
`
const FirstSectionLeft = styled.div`
    display:flex;
    flex-direction: column;
    width: 55%;
    padding-right: 20px;
    @media only screen and (max-width: 768px){
        padding: 45px 0px;
        width: 100%;
        text-align: center;
    }
`
const FirstSectionRight = styled.div`
    display:flex;
    width: 45%;
    @media only screen and (max-width: 768px){
        margin: auto;
    }
`
const SectionTitle = styled.span`
    font-size: 50px;
    font-weight: 600;
    color: #1d71b8;
    font-family: 'Roboto Mono',monospace;
    margin-bottom:30px;
    @media only screen and (max-width:768px){
        font-size: 40px;
    }
`

const SectionDesc = styled.span`
    font-size: 25px;
    color: #7e8088;
    font-family: 'Roboto Mono',monospace;
    padding-top: 30px;
`
const SectionDesc1 = styled.span`
    font-size: 25px;
    color: #7e8088;
    font-family: 'Roboto Mono',monospace;
    padding-top: 30px;
    padding-left: 70px;
    padding-right:70px;
    @media only screen and (max-width:768px){
        padding-left:10px;
        padding-right:10px;
    }
`
const SecondSection = styled.div`
    display:flex;
    flex-direction: column;
    text-align:center;
    margin:auto;
`
const SecondSectionImg = styled.img`
    max-width: 90px;
    margin: auto;
    margin-bottom: 30px;
`
const SectionSubTitle = styled.span`
    font-family: 'Roboto Mono',monospace;
    font-size: 28px;
    font-weight: 600;
    color: black;
    padding: 30px 0px 30px 0px;
`

export default HomeStrudel