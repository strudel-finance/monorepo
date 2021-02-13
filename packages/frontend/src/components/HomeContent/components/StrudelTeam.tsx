import React from 'react'
import styled from 'styled-components'
import Container from '@material-ui/core/Container'
import backgroundImg from '../../../assets/img/graywithbtc.png'
import user1 from '../../../assets/img/user1.png'
import user2 from '../../../assets/img/user2.png'
import user3 from '../../../assets/img/user3.png'
import user4 from '../../../assets/img/user4.png'
import user5 from '../../../assets/img/user5.png'
import twitterImg from '../../../assets/img/twitter_img1.png'
import linkedinImg from '../../../assets/img/linkedin-img.png'
const StrudelTeam: React.FC = () => (
  <>
    <StrudelTeamSection>
        <GrayBTCBackground >
            <Container>
                <StrudelTeamWraper>
                    <SectionTitle>The Strudel <br/> Team</SectionTitle>
                    <TeamMembers>
                        <TeamMember>
                            <MemberImg src={user1}></MemberImg>
                            <MemberName>Xavier Vera</MemberName>
                            <MemberRole>CHIEF STRATEGY OFFICER</MemberRole>
                            <MemberSocialLink>
                                <TwitterLink target="_blank" href="https://twitter.com/xaviveera"></TwitterLink>
                                <LinkedinLink target="_blank" href="https://www.linkedin.com/in/xavier-vera-55126697/"></LinkedinLink>
                            </MemberSocialLink>
                        </TeamMember>
                        <TeamMember>
                            <MemberImg src={user2}></MemberImg>
                            <MemberName>Emilio Andretta</MemberName>
                            <MemberRole>ADVISOR / PR</MemberRole>
                            <MemberSocialLink>
                                <TwitterLink target="_blank" href="https://twitter.com/eandretta99"></TwitterLink>
                                <LinkedinLink target="_blank" href="https://www.linkedin.com/in/emilio-andretta-a335bb17a/"></LinkedinLink>
                            </MemberSocialLink>
                        </TeamMember>
                        <TeamMember>
                            <MemberImg src={user3}></MemberImg>
                            <MemberName>Carlos Vera Paz</MemberName>
                            <MemberRole>LEAD DEVELOPER</MemberRole>
                            <MemberSocialLink>
                                <TwitterLink target="_blank" href="https://twitter.com/AtaxiaNQ"></TwitterLink>
                                <LinkedinLink target="_blank" href="#"></LinkedinLink>
                            </MemberSocialLink>
                        </TeamMember>
                        <TeamMember>
                            <MemberImg src={user4}></MemberImg>
                            <MemberName>Johann</MemberName>
                            <MemberRole>LEAD DEVELOPER</MemberRole>
                            <MemberSocialLink>
                                <TwitterLink target="_blank" href="https://twitter.com/JohBa"></TwitterLink>
                                <LinkedinLink target="_blank" href="#"></LinkedinLink>
                            </MemberSocialLink>
                        </TeamMember>
                        <TeamMember>
                            <MemberImg src={user5}></MemberImg>
                            <MemberName>Keno Budde</MemberName>
                            <MemberRole>LEAD DEVELOPER</MemberRole>
                            <MemberSocialLink>
                                <TwitterLink target="_blank" href="https://twitter.com/KenoBudde"></TwitterLink>
                                <LinkedinLink target="_blank" href="https://www.linkedin.com/in/kenobudde/"></LinkedinLink>
                            </MemberSocialLink>
                        </TeamMember>
                    </TeamMembers>
                </StrudelTeamWraper>
                
            </Container>
        </GrayBTCBackground>
        
    </StrudelTeamSection>
  </>
)
const TwitterLink = styled.a`
    background-image: url(${twitterImg});
    height: 20px;
    width:20px;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
`
const LinkedinLink = styled.a`
    background-image: url(${linkedinImg});
    height: 20px;
    width:20px;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
`
const StrudelTeamSection = styled.div`
    position: relative;
    width:100%;
`
const GrayBTCBackground = styled.div`
    background-image: url(${backgroundImg});
    display: block;
    width:100%;
    padding: 100px 0px 100px 0px;
    background-size: cover;
    background-repeat: no-repeat;
`

const StrudelTeamWraper = styled.div`
    display:flex;
    flex-direction: column;
    text-align: center;

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
const  TeamMembers = styled.div`
    display:flex;
    justify-content: space-around;
    flex-wrap: wrap;
    padding-top: 100px;
    @media only screen and (max-width: 550px){
        flex-direction: column;
        padding-top: 100px;
    }
`
const TeamMember = styled.div`
    display:flex;
    flex-direction: column;
    margin-top:40px;
`
const MemberSocialLink = styled.div`  
    display:flex;
    width: 40%;
    height: 20px;
    margin: auto;
    margin-top: 15px;
    justify-content: space-around;
`

const MemberImg = styled.img`
    width: 170px;
    height: 170px;
    margin:auto;
`
const MemberName = styled.span`
    font-size: 30px;
    padding-top: 30px;
    color: #7e8083;
`

const MemberRole = styled.span`
    font-size: 18px;
    padding-top: 10px;
    color: #7e8083;
`

export default StrudelTeam