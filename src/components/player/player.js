import React, {Component} from 'react';
import YTPlayer from 'react-youtube';
import * as firebase from 'firebase';


class Player extends Component {

    state = {
        YTTarget: null,
        fullPlayList: {},
        playListKeys: [],
        playingIndex: 0,
        videoData: {},
        objectKey: '',
        firstVideoId: ''
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
        console.log('error', event.data)
        this.nextVideo();
    }

    playVideo = () => {
        const {YTTarget} = this.state;
        YTTarget.playVideo();
        console.log('play');
    }

    pauseVideo = () => {
        const {YTTarget} = this.state;
        YTTarget.pauseVideo();
        console.log('pause');
    }

    stopVideo = () => {
        const {YTTarget} = this.state;
        YTTarget.stopVideo();
        console.log('stop');
    }

    loadVideo = () => {

        const {playListKeys, playingIndex, fullPlayList, YTTarget} = this.state;

        const key = playListKeys[playingIndex];

        YTTarget.loadVideoById(fullPlayList[key].id.videoId);

        this.setState({
            videoData: fullPlayList[key],
            objectKey: key
        })

        console.log('load');

    }

    nextVideo = () => {

        const {playListKeys, playingIndex} = this.state;

        if(playingIndex < playListKeys.length && playingIndex !== playListKeys.length){

            this.setState({
                playingIndex: playingIndex + 1
            })

            this.loadVideo();
        }

        console.log('next');
    }

    previousVideo = () => {

        const {playListKeys, playingIndex} = this.state;

        if(playingIndex < playListKeys.length && playingIndex !== playListKeys.length){

            this.setState({
                playingIndex: playingIndex - 1
            })

            this.loadVideo();
        }

        console.log('prev');
    }


    onPlayerStateChange = (event) => {

        console.log(event.data)

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

        return (
            <div className="player">
                <YTPlayer
                    videoId={this.state.firstVideoId}
                    opts={opts}
                    onReady={this.onPlayerReady}
                    onStateChange = {this.onPlayerStateChange}
                    onError = {this.onPlayerError}
                />
            </div>

        )

    }

    render(){

        return(
            <div className="adminPlayer">
                {this.getPlayer()}
            </div>
        )
    }
}

export default Player;