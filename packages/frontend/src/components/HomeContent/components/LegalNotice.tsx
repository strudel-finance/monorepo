import React from 'react'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'

const LegalNotice: React.FC = () => (
  <>
    <WhyStrudelSection>
            <Container>
                <WhyStrudelWraper>
                    <SectionTitle>Legal Notice<br/>and Disclaimer</SectionTitle>
                    <SectionDesc>Trading and investing in cryptocurrencies (also called digital or virtual currencies, crypto assets, altcoins and tokens) involves substantial risk of loss and is not suitable for every investor. Any content on this site should not be relied upon as advice or construed as providing recommendations of any kind. It is your responsibility to confirm and decide when to trade our token. Trade only with risk capital; that is, trade with money that, if lost, will not adversely impact your lifestyle and your ability to meet your financial obligations. Past results are no indication of future performance. In no event should the content of this correspondence be construed as an express or implied promise or guarantee. Strudel Finance is not responsible for any losses incurred as a result of trading our token. Information provided in this correspondence is intended solely for informational purposes and is obtained from sources believed to be reliable. Information is in no way guaranteed. No guarantee of any kind is implied or possible where projections of future conditions are attempted. None of the content published on this site constitutes a recommendation that any particular cryptocurrency, portfolio of cryptocurrencies, transaction or investment strategy is suitable for any specific person. None of the information providers or their affiliates will advise you personally concerning the nature, potential, value or suitability of any particular cryptocurrency, portfolio of cryptocurrencies, transaction, investment strategy or other matter. The products and services presented on this website may only be purchased in jurisdictions in which their marketing and distribution are authorised. Strudel Finance advises all interested parties to check in advance whether they are legally entitled to purchase the products and/or services presented on this website.</SectionDesc>
                </WhyStrudelWraper>
                
            </Container>        
    </WhyStrudelSection>
  </>
)
const WhyStrudelSection = styled.div`
    position: relative;
    width:100%;
    padding-top: 100px;
    padding-bottom: 100px;
`
const WhyStrudelWraper = styled.div`
    display:flex;
    flex-direction: column;
    text-align: center;

`
const SectionTitle = styled.span`
    font-size: 45px;
    font-weight: 600;
    color: #1d71b8;
    font-family: 'Roboto Mono',monospace;
    margin-bottom:30px;
    margin-top: 20px;
    @media only screen and (max-width:768px){
        font-size: 40px;
    }
`
const SectionDesc = styled.span`
    font-size: 20px;
    color: #7e8083;
    font-family: 'Roboto Mono',monospace;
    padding-top: 30px;
`

export default LegalNotice