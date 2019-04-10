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
        firstVideoId: '',
        floatingScreen: false
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

        dbRefPlaylist.on('value', snap => {
            this.setState({
                fullPlayList: snap.val(),
                playListKeys: Object.keys(snap.val()),
                firstVideoId: snap.val()[Object.keys(snap.val())[0]].id.videoId
            })
        });

    }

    onPlayerReady = (event) => {
        this.setState({
            YTTarget: event.target
        })
    }

    onPlayerError = (event) => {
        this.nextVideo();
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
                playingIndex: playingIndex + 1
            })

            this.loadVideo();
        }
    }

    previousVideo = () => {

        const {playListKeys, playingIndex} = this.state;

        if(playingIndex < playListKeys.length && playingIndex !== playListKeys.length){

            this.setState({
                playingIndex: playingIndex - 1
            })

            this.loadVideo();
        }
    }


    onPlayerStateChange = (event) => {

        const {videoData, objectKey} = this.state;

        if (event.data === YTPlayer.PlayerState.ENDED) {
            this.nextVideo();
        }

        if (event.data === YTPlayer.PlayerState.PLAYING) {
            firebase.database().ref().child('currentPlaying').set({
                playing: {
                    videoData: videoData,
                    objectKey: objectKey
                }
            })
        }
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

                {!this.state.floatingScreen && (
                    <YTPlayer
                        videoId={this.state.firstVideoId}
                        opts={opts}
                        onReady={this.onPlayerReady}
                        onStateChange = {this.onPlayerStateChange}
                        onError = {this.onPlayerError}
                    />
                )}

                {this.state.floatingScreen && (
                    <NewWindow features={features}>
                        <YTPlayer
                            className="floatingScreen"
                            videoId={this.state.firstVideoId}
                            opts={opts}
                            onReady={this.onPlayerReady}
                            onStateChange = {this.onPlayerStateChange}
                            onError = {this.onPlayerError}
                        />
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