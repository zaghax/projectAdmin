import React, {Component} from 'react';
import { connect } from 'react-redux';
import Player from '../player/player';
import {dbRefCurrentPlaying} from '../appContainer/appContainer';
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
    PLAYER_READY,
    LOAD_VIDEO_FROM_PLAYLIST,
    TOGGLE_MUTE
} = require('../../utils/constants');

class Controls extends Component {

    state = {
        //Playlist
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
        playPauseStatus: false,
        loadOnce: true,
        isMuted: false
    }

    constructor(props) {
        super(props);
        this.intervalTimer = null;
    }

    componentDidMount(){

        ipcRenderer.on(TRIGGER_NEXT_VIDEO, () => {
            this.triggerNextVideo();
        });

        ipcRenderer.on(SET_PROGRESS_BAR_STATUS, (event, videoStatus, videoDuration) => {
            this.updateProgressBar(videoStatus, videoDuration);
        });

        ipcRenderer.on(PLAYER_READY, () => {
            if(this.state.floatingScreen){
                ipcRenderer.send(LOAD_VIDEO, this.props.currentVideoData.id.videoId );
            }else{
                this.child.loadVideo(this.props.currentVideoData.id.videoId);
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

        ipcRenderer.on(PLAYER_WINDOW_CLOSED, () => {
            this.updateProgressBar('stoped'); 
            this.setState({
                floatingScreen: false
            })
        });

        ipcRenderer.on(LOAD_VIDEO_FROM_PLAYLIST, (event, listId) => {
            console.log('contols dice', listId)
            this.loadVideo(listId);
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

    toggleMute = () => {
        this.state.floatingScreen ?  ipcRenderer.send(TOGGLE_MUTE) : this.child.toggleMute();
        this.setState({
            isMuted: !this.state.isMuted
        })
    }

    loadVideo = (idFromPlaylist) => {

        const {playingIndex, floatingScreen} = this.state;
        const {playListKeys, fullPlayList} = this.props;
        let key = '';

        if(idFromPlaylist){
            key = idFromPlaylist;
            this.setState({
                playingIndex: playListKeys.indexOf(idFromPlaylist)
            })
        }else{
            key = playListKeys[playingIndex];
        }

        floatingScreen ?  ipcRenderer.send(LOAD_VIDEO, fullPlayList[key].id.videoId ) : this.child.loadVideo(fullPlayList[key].id.videoId);

        this.props.setCurrentVideoData(fullPlayList[key]);
        this.props.setCurrentObjectKey(key);

        this.setState({
            playPauseStatus: true
        })

        this.updateProgressBar('stoped'); 

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

        const {playingIndex} = this.state;
        const {playListKeys} = this.props;
        const totalVideos = playListKeys.length - 1; 

        if(playingIndex < totalVideos){

            this.setState({
                playingIndex: playingIndex + 1
            }, () => {
                this.loadVideo();
            })
            
        }

    }

    previousVideo = () => {

        const { playingIndex } = this.state;

        if(playingIndex !== 0){

            this.setState({
                playingIndex: playingIndex - 1
            }, () => this.loadVideo())
    
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

    updateProgressBar = (videoState, videoDuration) => {

        const {currentVideoData, currentObjectKey} = this.props;

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
            dbRefCurrentPlaying.set({
                playing: {
                    videoData: currentVideoData,
                    objectKey: currentObjectKey
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
    
    getControls = () => {

        const { currentVideoData } = this.props;

        return (
            <div className="playerControls">
                <div className="info">
                    <div className="info__title">Currently playing</div>
                    <div
                        className="info__name"
                        dangerouslySetInnerHTML={{ __html: currentVideoData.snippet.title }} />
                </div>
                <div className="controls">
                    <div className="time">
                        <span className="time__remaining">{this.state.videoRemaining}</span>
                        <span className="time__lenght">{this.state.videoLenght}</span>
                    </div>
                    <div className="progress">
                        <div className="progress__bar" style={{width:this.state.progressBarFill + '%'}}/>
                        <input className="progress__input" type="range" min="0" max={this.state.videoDuration} onChange={this.seekTo}/>
                    </div>
                    <div className="buttons">
                        <button className={`buttons__btn volume-toggle ${this.state.isMuted ? 'icon-volume-x' : 'icon-volume-2'}`} onClick={this.toggleMute}/>
                        <button className="buttons__btn icon-skip-back" onClick={this.previousVideo}/>
                        <button className={`buttons__btn player-toggle ${this.state.playPauseStatus ? 'icon-pause' : 'icon-play'}`} onClick={this.switchPlayPause}/>
                        <button className="buttons__btn icon-skip-forward" onClick={this.nextVideo}/>
                        <button className={`buttons__btn screen-toggle icon-pop-out ${this.state.floatingScreen ? 'playerOut' : 'playerIn'}`} onClick={this.toggleScreen}/>
                    </div>
                    <button className="icon-search search-toggle" onClick={() => {this.props.setSearchWindowState(true)}}/>
                </div>
            </div>
        )
        
    }  

    render(){
        const {floatingScreen} = this.state;
        const { currentVideoData } = this.props;
        return(
            <div className="playerWindow">

                <div className="playerWrapper" style={{backgroundImage:`url('${currentVideoData.snippet.thumbnails.high.url}')`}}>
                    {!floatingScreen &&
                        <Player
                            onRef={ref => (this.child = ref)} 
                            triggerNextVideo={this.triggerNextVideo} 
                            progressBarStatus={this.updateProgressBar}
                        />       
                    }      
                </div>
                
                {this.getControls()}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        fullPlayList: state.fullPlayList,
        playListKeys: state.playListKeys,
        currentVideoData: state.currentVideoData,
        currentObjectKey: state.currentObjectKey
    }
}

const mapDispathToProps = dispatch => {
    return {
        setCurrentVideoData: (value) => dispatch({type: 'SET_CURRENT_VIDEO_DATA', value: value}),
        setCurrentObjectKey: (value) => dispatch({type: 'SET_CURRENT_OBJECT_KEY', value: value}),
        setSearchWindowState: (value) => dispatch({type: 'SET_SEARCH_WINDOW_STATE', value: value})
    }
}

export default connect(mapStateToProps, mapDispathToProps)(Controls);