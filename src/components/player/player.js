import React, {Component} from 'react';
import YTPlayer from 'react-youtube';
import NewWindow from 'react-new-window';
import * as firebase from 'firebase';


class Player extends Component {

    state = {
        YTTarget: null,
        fullPlayList: {},
        playListKeys: [],
        playingIndex: 0,
        videoData: {},
        objectKey: '',
        floatingScreen: false,
        counter: 0,
        currentPlayingData: {},
        progressBarFill: 0,
        progressBarTimer: 0,
        intervalTimer: null,
        videoDuration: 0,
        stepPercentajeFill: 0

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

        dbRefCurrentPlaying.on('value', snap => {
            this.setState({
                currentPlayingData: snap.val()
            })
        });
        
    }

    onPlayerReady = (event) => {
        this.setState({
            YTTarget: event.target
        })

        console.log(event.target)
    }

    onPlayerError = (event) => {
        this.nextVideo();
        console.log(event)
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

    toggleScreen = () => {
        this.setState({
            floatingScreen: !this.state.floatingScreen
        })
    }

    loadVideo = () => {

        const {playListKeys, playingIndex, fullPlayList, YTTarget} = this.state;

        const key = playListKeys[playingIndex];

        YTTarget.loadVideoById(fullPlayList[key].id.videoId);

        this.setState({
            videoData: fullPlayList[key],
            objectKey: key
        })
    }

    nextVideo = () => {

        const {playListKeys, playingIndex} = this.state;

        if(playingIndex < playListKeys.length && playingIndex !== playListKeys.length){

            this.setState({
                playingIndex: playingIndex + 1,
                progressBarFill: 0,
                progressBarTimer: 0
            }, () => this.loadVideo())

            this.progressBarStatus('stop'); 
            
        }
    }

    previousVideo = () => {

        const {playListKeys, playingIndex} = this.state;

        if(playingIndex < playListKeys.length && playingIndex !== playListKeys.length){

            this.setState({
                playingIndex: playingIndex - 1,
                progressBarFill: 0,
                progressBarTimer: 0
            }, () => this.loadVideo())

        }
    }


    progressBarStatus = (flag) => {

        const {YTTarget} = this.state;
        // const videoDuration = Math.round(YTTarget.getDuration());
        // const stepPercentajeFill = 100 / videoDuration;

        this.setState({
            videoDuration: Math.round(YTTarget.getDuration()),
            stepPercentajeFill: 100 / Math.round(YTTarget.getDuration())
        })

        if(flag === 'start'){
            if (this.intervalTimer !== null) return;
            this.intervalTimer = setInterval(() => {
                this.setState({
                    progressBarFill: this.state.progressBarFill + this.state.stepPercentajeFill,
                    progressBarTimer: this.state.progressBarTimer + 1
                })
            }, 1000); 
        }

        if(flag === 'stop'){
            clearInterval(this.intervalTimer);
            this.intervalTimer = null
        }

    }

    onPlayerStateChange = (event) => {

        const {videoData, objectKey} = this.state;

        if (event.data === YTPlayer.PlayerState.ENDED) {
            this.nextVideo();
            this.progressBarStatus('stop'); 
            this.setState({
                progressBarFill: 0,
                progressBarTimer: 0
            }) 
        }

        if (event.data === YTPlayer.PlayerState.PAUSED) {
            this.progressBarStatus('stop'); 
        }

        if (event.data === YTPlayer.PlayerState.CUED) {
            this.progressBarStatus('stop');
            this.setState({
                progressBarFill: 0,
                progressBarTimer: 0
            }) 
        }
        
        if (event.data === YTPlayer.PlayerState.PLAYING) {

            firebase.database().ref().child('currentPlaying').set({
                playing: {
                    videoData: videoData,
                    objectKey: objectKey
                }
            })

            this.progressBarStatus('start');

        }

    }

    infoOffScreenPlayer = () => {

        const {currentPlayingData} = this.state;

        if(currentPlayingData && currentPlayingData.playing !== undefined){

            return (
                <div className="currentlyPlaying">
                    <img
                        className="videoThumnail"
                        src={currentPlayingData.playing.videoData.snippet.thumbnails.high.url} alt=""/>

                    <div className="playingInfo">
                        <div className="infoTitle">Currently playing</div>
                        <div
                            className="videoName"
                            dangerouslySetInnerHTML={{ __html: currentPlayingData.playing.videoData.snippet.title }} />
                    </div>

                </div>
            )

        }

    }

    seekTo = (event) => {
        console.log(event.target.value)
        const {YTTarget, stepPercentajeFill} = this.state;
        YTTarget.seekTo(event.target.value);
        this.setState({
            progressBarTimer: event.target.value,
            progressBarFill: event.target.value * stepPercentajeFill
        }, () => console.log(this.state.progressBarTimer))
    }


    getPlayer = () => {

        const opts = {
            height: '390',
            width: '640',
            playerVars: {
                autoplay: 1,
                rel: 0,
                fs : 1,
                showinfo: 0
            }
        };

        const features = {
            width: 640,
            height: 390,
            resizable: true,
            scrollbars: 0,
            menubar: 0,
            toolbar: 0,
            titlebar: 0
        }

        return (
            <div className="player">

                <div className="playerWindow">

                    {!this.state.floatingScreen && Object.keys(this.state.currentPlayingData).length !== 0 && 
                        
                        <YTPlayer
                            videoId={this.state.currentPlayingData.playing.videoData.id.videoId}
                            opts={opts}
                            onReady={this.onPlayerReady}
                            onStateChange = {this.onPlayerStateChange}
                            onError = {this.onPlayerError}
                        />
                            
                    }

                    {this.state.floatingScreen && this.infoOffScreenPlayer()}

                </div>

                {this.state.floatingScreen && (
                    <NewWindow features={features}>
                        {Object.keys(this.state.currentPlayingData).length !== 0 &&  
                            <YTPlayer
                            className="floatingScreen"
                                videoId={this.state.currentPlayingData.playing.videoData.id.videoId}
                                opts={opts}
                                onReady={this.onPlayerReady}
                                onStateChange = {this.onPlayerStateChange}
                                onError = {this.onPlayerError}
                            />
                        }
                    </NewWindow>
                )}
                
            </div>
        )

    }

    render(){

        return(
            <div className="adminPlayer">
                {this.getPlayer()}
                <div className="playerControls">
                <div className="progressBar">
                    <div class="bar" style={{width:this.state.progressBarFill + '%'}}/>
                        <input className="progressBarInput" type="range" min="0" max={this.state.videoDuration} onChange={this.seekTo}/>
                    </div>
                    <button className="ctrl-btn icon-step-backward" onClick={() => this.previousVideo()}/>
                    <button className="ctrl-btn icon-play" onClick={() => this.playVideo()}/>
                    <button className="ctrl-btn icon-pause" onClick={() => this.pauseVideo()}/>
                    <button className="ctrl-btn icon-stop" onClick={() => this.stopVideo()}/>
                    <button className="ctrl-btn icon-step-forward" onClick={() => this.nextVideo()}/>
                    <button className="ctrl-btn icon-spinner2" onClick={() => this.toggleScreen()}/>
                </div>
            </div>
        )
    }
}

export default Player;