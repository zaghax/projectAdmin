import React, {Component} from 'react';
import PlayerControls from '../playerControls/playerControls';
import SuggestedVideos from '../suggestedVideos/suggestedVideos';
import SearchResults from '../searchResults/searchResults';
import PlayList from '../playList/playList';
import firebase from 'firebase/app';
import 'firebase/database';
import {connect} from 'react-redux';
const { remote, ipcRenderer } = window.require('electron');

const {
    MAIN_WINDOW_MAXIMIZED_STATE,
    MAIN_WINDOW_UNMAXIMIZED_STATE
} = require('../../utils/constants');


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
        showComponents: false,
        isWindows: false,
        isMaximized: false
    }

    componentDidMount(){
    
        window.navigator.platform.indexOf('Win') !== -1 && this.setState({
            isWindows: true
        });

        dbRefPlaylist.on('value', snap => {

            const fullPlayList = snap.val();
            const playListKeys = Object.keys(snap.val());

            this.props.setFullPlayList(fullPlayList);
            this.props.setPlayListKeys(playListKeys);

            console.log('fullPlayList', fullPlayList);

            if(this.state.isLoadFirstVideo){

                this.props.setCurrentVideoData(fullPlayList[playListKeys[0]]);
                this.props.setCurrentObjectKey(playListKeys[0]);

                dbRefCurrentPlaying.set({
                    playing:{
                        videoData: fullPlayList[playListKeys[0]],
                        objectKey: playListKeys[0]
                    }
                })
               
                setTimeout(() => {
                    this.setState({
                        isLoadFirstVideo: false,
                        showComponents: true
                    })
                }, 2000)
           
            }

        });

        //This is when is maximized or unmaximized by head doubleclick on Windows OS 

        ipcRenderer.on(MAIN_WINDOW_MAXIMIZED_STATE, () => {
            this.setState({
                isMaximized: true
            });
        });

        ipcRenderer.on(MAIN_WINDOW_UNMAXIMIZED_STATE, () => {
            this.setState({
                isMaximized: false
            });
        });
        
    }

    closeMainWindow = () => {
        remote.app.quit();
    }

    minimizeMainWindow = () => {
        remote.getCurrentWindow().minimize();
    }

    toggleSizeMainWindow = () => {

        const currentWindow = remote.getCurrentWindow();

        currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize();

        this.setState({
            isMaximized: !this.state.isMaximized
        });

    }

    render(){  
        return(
            <div className="appContainer">

                <header className="header">
                    <span className="header__brandName">AWESOME PLAYER</span>
                    {this.state.isWindows && 
                        <div className="windowControls">
                            <button className="icon-minus windowControls__control" onClick={this.minimizeMainWindow}/>
                            <button className={`${this.state.isMaximized ? 'icon-minimize' : 'icon-maximize'} windowControls__control`} onClick={this.toggleSizeMainWindow}/>
                            <button className="icon-x windowControls__control" onClick={this.closeMainWindow}/>
                        </div>
                    }
                </header>

                {!this.state.showComponents && 
                    <div className="loader">
                        <i className="icon-loader"/>
                    </div>
                }

                {this.state.showComponents && (
                    <div className="componentsWrap">

                        <SearchResults/> 
                        
                        <div className="columnLeft">
                            <PlayerControls/>
                            <SuggestedVideos />
                        </div>

                        <div className="columnRight">
                            <PlayList/>
                        </div>

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