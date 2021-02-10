import React from 'react'
import styled from 'styled-components'
import playImg from '../../../assets/img/mediaplayer.png'

const VideoSection: React.FC = () => (
  <>
    <PlayerButton>
        <img src={playImg} ></img>
    </PlayerButton>
  </>
)

const PlayerButton = styled.div`
    display:flex;
    text-align:center;
    padding: 200px 0px;
    background-color: #0f6db1;
    width: 100%;
    justify-content: center;
    @media only screen and (max-width: 550px){
        padding: 60px 0px;
    }
`

export default VideoSection