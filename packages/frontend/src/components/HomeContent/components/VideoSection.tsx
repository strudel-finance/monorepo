import React, {useCallback, useState, useMemo} from 'react'
import styled from 'styled-components'
import playImg from '../../../assets/img/mediaplayer.png'


const VideoSection: React.FC = () => {
  const [play, setPlay] = React.useState(false);
  const url = play
    ? `https://www.youtube.com/embed/LLEfTMxTvdI?autoplay=1`
    : `https://www.youtube.com/embed/LLEfTMxTvdI`;
 return(
 <>
 
    <PlayerButton>
    <YoutubeVideoSection className={play? 'ShowSection': 'HiddenSection'}>
    <iframe
        width="800"
        height="500"
        src={url}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </YoutubeVideoSection>
        <a onClick={() => setPlay(true)} className={play? 'YoutubeStarted': ''}><img src={playImg} ></img></a>
    </PlayerButton>
  </>
 );
}
const YoutubeVideoSection = styled.div`
    width: 100%;
    height: auto;
`
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