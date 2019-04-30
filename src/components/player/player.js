import React, {Component} from 'react';
import YTPlayer from 'react-youtube';
const { ipcRenderer } = window.require('electron');

const {
    PLAY_VIDEO,
    PAUSE_VIDEO,
    STOP_VIDEO,
    LOAD_VIDEO,
    TRIGGER_NEXT_VIDEO,
    SET_PROGRESS_BAR_STATUS,
    SEEK_TO,
    PLAYER_READY,
    TOGGLE_MUTE
} = require('../../utils/constants');

class Player extends Component {

    state = {
        YTTarget: null
    }

    componentDidMount() {

        this.props.onRef !== undefined && this.props.onRef(this);

        if(this.props.onRef === undefined){

            ipcRenderer.on(PLAY_VIDEO, () => {
                this.playVideo();
            });

            ipcRenderer.on(PAUSE_VIDEO, () => {
                this.pauseVideo();
            });

            ipcRenderer.on(STOP_VIDEO, () => {
                this.stopVideo();
            });

            ipcRenderer.on(LOAD_VIDEO, (event, arg) => {
                this.loadVideo(arg);
            });

            ipcRenderer.on(SEEK_TO, (event, seekTime) => {
                this.seekTo(seekTime);
            });

            ipcRenderer.on(TOGGLE_MUTE, () => {
                this.toggleMute();
            });

        }
    }

    componentWillUnmount() {
        this.props.onRef !== undefined && this.props.onRef(null);
    }

    toggleMute = () => {
        const {YTTarget} = this.state;
        YTTarget.isMuted() ? YTTarget.unMute() : YTTarget.mute();
    } 

    playVideo = () => {
        const {YTTarget} = this.state;
        YTTarget.playVideo();
    }

    pauseVideo = () => {
        const {YTTarget} = this.state;
        YTTarget.pauseVideo();
    }

    stopVideo = () => {
        const {YTTarget} = this.state;
        YTTarget.stopVideo();
    }

    loadVideo = (videoId) => {
        const {YTTarget} = this.state;
        YTTarget.loadVideoById(videoId);
    }

    seekTo = (time) => {
        const {YTTarget} = this.state;
        YTTarget.seekTo(time);
    }

    onVideoEnded = () => {
        this.props.onRef !== undefined ? this.props.triggerNextVideo() : ipcRenderer.send(TRIGGER_NEXT_VIDEO); 
    }

    onPlayerReady = (event) => {
        this.setState({
            YTTarget: event.target
        })
        setTimeout(() => {
            ipcRenderer.send(PLAYER_READY);
        }, 500) 
    }

    onPlayerStateChange = (event) => {

        const {YTTarget} = this.state;
        const videoDuration =  Math.round(YTTarget.getDuration());

        if (event.data === YTPlayer.PlayerState.ENDED) {
            this.onVideoEnded();
            this.props.onRef !== undefined ? this.props.progressBarStatus('ended', videoDuration) : ipcRenderer.send(SET_PROGRESS_BAR_STATUS, 'ended', videoDuration); 
        }
        if (event.data === YTPlayer.PlayerState.PAUSED) {
            this.props.onRef !== undefined ? this.props.progressBarStatus('paused', videoDuration) : ipcRenderer.send(SET_PROGRESS_BAR_STATUS, 'paused', videoDuration); 
        }
        if (event.data === YTPlayer.PlayerState.CUED) {
            this.props.onRef !== undefined ? this.props.progressBarStatus('stoped', videoDuration) : ipcRenderer.send(SET_PROGRESS_BAR_STATUS, 'stoped', videoDuration); 
        }
        if (event.data === YTPlayer.PlayerState.PLAYING) {
            this.props.onRef !== undefined ? this.props.progressBarStatus('playing', videoDuration) : ipcRenderer.send(SET_PROGRESS_BAR_STATUS, 'playing', videoDuration); 
        }
    }

    onPlayerError = (event) => {
        console.log('Error', event);
        this.props.onRef !== undefined ? this.props.triggerNextVideo() : ipcRenderer.send(TRIGGER_NEXT_VIDEO); 
    }

    getPlayer = () => {

        const opts = {
            height: '390',
            width: '640',
            playerVars: {
                autoplay: 0,
                rel: 0,
                fs : 1,
                showinfo: 0,
                controls: 0,
                iv_load_policy: 3,
                modestbranding: 1
            }
        };

        return (
            <YTPlayer
                className="YTPlayer"
                opts={opts}
                onReady={this.onPlayerReady}
                onStateChange = {this.onPlayerStateChange}
                onError = {this.onPlayerError}
            />
        )
    }

    render(){
        return(
            <div>
                {this.getPlayer()}
            </div>
        )
    }
}

export default Player;