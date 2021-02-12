import React from 'react'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'
import btc_img4 from '../../../assets/img/btc_img4.png'
import btc_img5 from '../../../assets/img/btc_img5.png'

const HowDoesItWorks: React.FC = () => (
<Container>
  <HomeStrudelContainer>
    <FirstSection>
        <FirstSectionLeft>
            <SectionImg src={btc_img4}>

            </SectionImg>
            <SectionTitle>
            How does it work?
            </SectionTitle>
            <SectionDesc>
            By using the Strudel Dapp, Bitcoins are burned and marked with the Strudel protocol identifier. The burn transaction is then relayed to Ethere- um, issuing vBTC in the exact ratio of 1:1
            </SectionDesc>
        </FirstSectionLeft>
        <FirstSectionRight>
            <FirstSectionImg src={btc_img5} />
        </FirstSectionRight>
    </FirstSection>
    
  </HomeStrudelContainer>
</Container>
)

const HomeStrudelContainer = styled.div`
    padding:160px 0px;
    @media only screen and (max-width: 768px){
        padding:100px 0px;
    }
`
const SectionImg = styled.img`
    width: 200px;
    margin-left: 100px;
    margin-bottom: 50px;
    @media only screen and (max-width: 768px){
        margin: auto;
    }
`
const FirstSectionImg = styled.img`
    width:100%;
    object-fit: contain;
`
const FirstSection = styled.div`
    display:flex;
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
    margin-top: 50px;
    @media only screen and (max-width: 768px){
        margin: auto;
    }
`
const SectionTitle = styled.span`
    font-size: 50px;
    font-weight: 600;
    color: #1d71b8;
    font-family: 'Roboto Mono',monospace;
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
export default HowDoesItWorks