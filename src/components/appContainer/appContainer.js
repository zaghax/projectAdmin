import React, {Component} from 'react';
import PlayerControls from '../playerControls/playerControls';
// import SuggestedVideos from '../suggestedVideos/suggestedVideos';
import SearchResults from '../searchResults/searchResults';
import * as firebase from 'firebase';
import {connect} from 'react-redux';

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
export const dbRefPlaylist = refDB.child('playlist');
export const dbRefCurrentPlaying = refDB.child('currentPlaying');

class AppContainer extends Component {

    state = {
        isLoadFirstVideo: true,
        showComponents: false
    }

    componentDidMount(){

        dbRefPlaylist.on('value', snap => {

            const fullPlayList = snap.val();
            const playListKeys = Object.keys(snap.val());

            this.props.setFullPlayList(fullPlayList);
            this.props.setPlayListKeys(playListKeys);

            if(this.state.isLoadFirstVideo){

                this.props.setCurrentVideoData(fullPlayList[playListKeys[0]]);
                this.props.setCurrentObjectKey(playListKeys[0]);

                dbRefCurrentPlaying.set({
                    playing:{
                        videoData: fullPlayList[playListKeys[0]],
                        objectKey: playListKeys[0]
                    }
                })
               
                this.setState({
                    isLoadFirstVideo: false,
                    showComponents: true
                })
           
            }

        });
        
    }

    render(){  
        return(
            <div className="AppContainer">
                {this.state.showComponents && (
                    <div className="componentsWrap">
                        <PlayerControls/>
                        <SearchResults/>
                    </div>
                )} 
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
        setFullPlayList: (value) => dispatch({type: 'SET_FULL_PLAYLIST', value: value}),
        setPlayListKeys: (value) => dispatch({type: 'SET_PLAYLIST_KEYS', value: value}),
        setCurrentVideoData: (value) => dispatch({type: 'SET_CURRENT_VIDEO_DATA', value: value}),
        setCurrentObjectKey: (value) => dispatch({type: 'SET_CURRENT_OBJECT_KEY', value: value})
    }
}

export default connect(mapStateToProps, mapDispathToProps)(AppContainer);