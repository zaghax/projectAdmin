import React, {Component} from 'react';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import Player from '../player/player';
const { ipcRenderer } = window.require('electron');

const {
    OPEN_PLAYER_WINDOW,
    CLOSE_PLAYER_WINDOW,
    PLAYER_WINDOW_CLOSED,
    PLAY_VIDEO,
    PAUSE_VIDEO,
    STOP_VIDEO,
    LOAD_VIDEO,
    TRIGGER_NEXT_VIDEO,
    SET_PROGRESS_BAR_STATUS,
    SEEK_TO,
    PLAYER_READY

} = require('../../utils/constants');

class Controls extends Component {

    state = {
        //Playlist
        fullPlayList: {},
        playListKeys: [],
        videoData: {},
        objectKey: '',
        playingIndex: 0,
        floatingScreen: false,
        //Progressbar
        videoDuration: 0,
        stepPercentajeFill: 0,
        progressBarFill: 0,
        progressBarTimer: 0,
        //Timer
        videoLenght: '0:00',
        videoRemaining: '0:00',
        //Player
        playPauseStatus: false
    }

    constructor(props) {
        super(props);
        this.intervalTimer = null;
    }

    componentDidMount(){
        
        const config = {
            apiKey: "AIzaSyCkwdRv1u2LSarAY152iZgWL3H5RroueqM",
            authDomain: "playlist-ca585.firebaseapp.com",
            databaseURL: "https://playlist-ca585.firebaseio.com",
            projectId: "playlist-ca585",
            storageBucket: "playlist-ca585.appspot.com",
            messagingSenderId: "850788790457"
        }

        firebase.initializeApp(config);

        const refDB = firebase.database().ref();
        const dbRefPlaylist = refDB.child('playlist');
        const dbRefCurrentPlaying = refDB.child('currentPlaying');

        dbRefPlaylist.on('value', snap => {

            this.setState({
                fullPlayList: snap.val(),
                playListKeys: Object.keys(snap.val()),
            }, () => {

                dbRefCurrentPlaying.set({
                    playing:{
                        videoData: this.state.fullPlayList[this.state.playListKeys[0]],
                        objectKey:  this.state.playListKeys[0]
                    }
                })

                this.setState({
                    videoData: this.state.fullPlayList[this.state.playListKeys[0]],
                    objectKey:  this.state.playListKeys[0]
                })

            })
        });

        ipcRenderer.on(TRIGGER_NEXT_VIDEO, () => {
            this.triggerNextVideo();
        });

        ipcRenderer.on(SET_PROGRESS_BAR_STATUS, (event, videoStatus, videoDuration) => {
            this.updateProgressBar(videoStatus, videoDuration);
        });

        ipcRenderer.on(PLAYER_READY, () => {
            if(this.state.floatingScreen){
                ipcRenderer.send(LOAD_VIDEO, this.state.videoData.id.videoId );
            }else{
                this.child.loadVideo(this.state.videoData.id.videoId);
            }
            this.setState({
                playPauseStatus: true
            });
        });

        ipcRenderer.on(PLAYER_WINDOW_CLOSED, () => {
            this.updateProgressBar('stoped'); 
            this.setState({
                floatingScreen: false
            })
        });
    }

    switchPlayPause = () => {
        this.setState({
            playPauseStatus: !this.state.playPauseStatus
        }, () => {
            if(this.state.playPauseStatus){
                this.state.floatingScreen ?  ipcRenderer.send(PLAY_VIDEO) : this.child.playVideo();
            }else{
                this.state.floatingScreen ?  ipcRenderer.send(PAUSE_VIDEO) : this.child.pauseVideo();
            }
        })
    }

    stopVideo = () => {
        this.state.floatingScreen ?  ipcRenderer.send(STOP_VIDEO) : this.child.stopVideo();
        this.setState({
            playPauseStatus: false,
            videoRemaining: '0:00'
        })
    }

    toggleScreen = () => {
        this.updateProgressBar('stoped'); 
        this.setState({
            floatingScreen: !this.state.floatingScreen
        }, () => {
            if(this.state.floatingScreen){
                ipcRenderer.send(OPEN_PLAYER_WINDOW);
            }else{
                ipcRenderer.send(CLOSE_PLAYER_WINDOW);
            }
        })
    }

    loadVideo = () => {

        const {playListKeys, playingIndex, fullPlayList, floatingScreen} = this.state;
        const key = playListKeys[playingIndex];

        floatingScreen ?  ipcRenderer.send(LOAD_VIDEO, fullPlayList[key].id.videoId ) : this.child.loadVideo(fullPlayList[key].id.videoId);

        this.setState({
            videoData: fullPlayList[key],
            objectKey: key,
            playPauseStatus: true
        })
        
    }

    seekTo = (event) => {
        const { stepPercentajeFill, floatingScreen } = this.state;
        floatingScreen ?  ipcRenderer.send(SEEK_TO, event.target.value ) : this.child.seekTo(event.target.value);
        this.setState({
            progressBarTimer: event.target.value,
            progressBarFill: event.target.value * stepPercentajeFill
        });
    }

    triggerNextVideo = () => {
        this.nextVideo();
    }

    nextVideo = () => {

        const {playListKeys, playingIndex} = this.state;
        const totalVideos = playListKeys.length - 1; 

        if(playingIndex < totalVideos){

            this.setState({
                playingIndex: playingIndex + 1
            }, () => {
                this.loadVideo();
            })

            this.updateProgressBar('stoped'); 
            
        }

    }

    previousVideo = () => {

        const { playingIndex } = this.state;

        if(playingIndex !== 0){

            this.setState({
                playingIndex: playingIndex - 1
            }, () => this.loadVideo())

            this.updateProgressBar('stoped'); 
            
        }

    }

    formatTime(time) {   

        let hrs = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = ~~time % 60;
        let timeFormated = "";

        if (hrs > 0) {
            timeFormated += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        timeFormated += "" + mins + ":" + (secs < 10 ? "0" : "");
        timeFormated += "" + secs;

        return timeFormated;
    }

    updateProgressBar = (videoState, videoDuration, videoRemaining) => {

        const {videoData, objectKey} = this.state;

        this.setState({
            videoDuration: videoDuration,
            stepPercentajeFill: 100 / videoDuration,
            videoLenght: this.formatTime(videoDuration)
        })

        if(videoState === 'playing'){
            if (this.intervalTimer !== null) return;
            this.intervalTimer = setInterval(() => {
                this.setState({
                    progressBarFill: this.state.progressBarFill + this.state.stepPercentajeFill,
                    progressBarTimer: parseInt(this.state.progressBarTimer) + 1,
                    videoRemaining: this.formatTime(this.state.progressBarTimer),
                    playPauseStatus: true
                })
            }, 1000); 
            firebase.database().ref().child('currentPlaying').set({
                playing: {
                    videoData: videoData,
                    objectKey: objectKey
                }
            })
        }

        if(videoState === 'paused'){
            clearInterval(this.intervalTimer);
            this.intervalTimer = null
        }

        if(videoState === 'stoped' || videoState === 'ended'){
            clearInterval(this.intervalTimer);
            this.intervalTimer = null
            this.setState({
                progressBarFill: 0,
                progressBarTimer: 0
            }) 
        }
    }

    infoOffScreenPlayer = () => {

        const { videoData } = this.state;

        return (
            <div className="currentlyPlaying">
                <img
                    className="videoThumnail"
                    src={videoData.snippet.thumbnails.high.url} alt=""/>

                <div className="playingInfo">
                    <div className="infoTitle">Currently playing</div>
                    <div
                        className="videoName"
                        dangerouslySetInnerHTML={{ __html: videoData.snippet.title }} />
                </div>

            </div>
        )

    }
    
    getControls = () => {

        return (
            <div className="playerControls">
                <div className="videoTime">
                    <span className="videoRemainingTime">{this.state.videoRemaining}</span>
                    <span className="videoLenghtTime">{this.state.videoLenght}</span>
                </div>
                <div className="progressBar">
                    <div className="bar" style={{width:this.state.progressBarFill + '%'}}/>
                    <input className="progressBarInput" type="range" min="0" max={this.state.videoDuration} onChange={this.seekTo}/>
                </div>
                <div className="controlsButtonGroup">
                    <button className="ctrl-btn icon-skip-back" onClick={this.previousVideo}/>
                    <button className={`ctrl-btn player-toggle ${this.state.playPauseStatus ? 'icon-pause' : 'icon-play'}`} onClick={this.switchPlayPause}/>
                    <button className="ctrl-btn icon-skip-forward" onClick={this.nextVideo}/>
                    <button className={`ctrl-btn screen-toggle ${this.state.floatingScreen ? 'icon-minimize' : 'icon-maximize'}`} onClick={this.toggleScreen}/>
                </div>
            </div>
        )
        
    }

    render(){
        const {floatingScreen} = this.state;
        return(
            <div className="playerWindow">

                {!floatingScreen &&
                    <div className="playerWrapper">
                        <Player
                            onRef={ref => (this.child = ref)} 
                            triggerNextVideo={this.triggerNextVideo} 
                            progressBarStatus={this.updateProgressBar}
                        />             
                    </div>
                }
                {floatingScreen && 
                    <div className="playerWrapper">
                        {this.infoOffScreenPlayer()}
                    </div>
                }
                {this.getControls()}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        videoDuration: state.videoDuration
    }
}

const mapDispathToProps = dispatch => {
    return {
        setVideoDuration: (value) => dispatch({type: 'SET_VIDEO_DURATION', value: value})
    }
}

export default connect(mapStateToProps, mapDispathToProps)(Controls);