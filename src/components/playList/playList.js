import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dbRefPlaylist} from '../appContainer/appContainer';
const { ipcRenderer } = window.require('electron');

const {
    LOAD_VIDEO_FROM_PLAYLIST
} = require('../../utils/constants');
 
class PlayList extends Component {

    removeFromPlaylist = (fbId) => {
        dbRefPlaylist.child(fbId).remove();
    }

    scrollTop = () => {
        document.getElementById('videoPlayList').scrollTop = 0;
    }

    scrollBottom = () => {      
        let scrollHeight = document.getElementById('videoPlayList').scrollHeight;
        document.getElementById('videoPlayList').scrollTop = scrollHeight;
    }

    scrollListener = () => {
        if(document.getElementById('videoPlayList').scrollTop > 200){
            document.querySelector('.icon-chevrons-up').classList.add('active');
        }else{
            document.querySelector('.icon-chevrons-up').classList.remove('active');
        }
    }

    loadVideoFromPlaylist = (listId) => {
        ipcRenderer.send(LOAD_VIDEO_FROM_PLAYLIST, listId)
    }

    getPlayList = () => {

        let list = [];
        const keyList = Object.keys(this.props.fullPlayList);
        const keyFrom = keyList.indexOf(this.props.currentObjectKey) + 1

        keyList.map((item) => {
            let itemObject = this.props.fullPlayList[item];
            itemObject.fbId = item;
            list.push(itemObject)
        })

        return list.slice(keyFrom).map((item, index) => {
            return (
                <div className="item" key={index}>
                    <div className="item__image">
                        <img src={item.snippet.thumbnails.medium.url} alt=""/>
                        <button className="icon-play" onClick={() => {this.loadVideoFromPlaylist(item.fbId)}}/>
                    </div>
                    <div className="item__title" >
                        <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                    </div>
                    <div className="item__controls">
                        <button className="icon-trash-2 item__remove" onClick={() => {this.removeFromPlaylist(item.fbId)}}>
                            <span>Remove from playlist</span>
                        </button>
                    </div>
                </div>
            )
        })
    }

    render(){
        return (
            <div className="playList">
                <div className="head">
                    <span>PlayList</span>
                    <div className="scrollControls">
                        <button className="icon-chevrons-up scroll__btn" onClick={this.scrollTop}/>
                        <button className="icon-chevrons-down scroll__btn" onClick={this.scrollBottom}/>
                    </div>
                </div>
                <div className="item__list" id="videoPlayList" onScroll={this.scrollListener}>
                    {this.getPlayList()}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        fullPlayList: state.fullPlayList,
        currentObjectKey: state.currentObjectKey
    }
}

export default connect(mapStateToProps)(PlayList);