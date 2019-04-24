import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dbRefPlaylist} from '../appContainer/appContainer';
 
class PlayList extends Component {

    removeFromPlaylist = (fbId) => {
        dbRefPlaylist.child(fbId).remove();
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
                    </div>
                    <div className="item__title" >
                        <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                    </div>
                    <div className="item__controls">
                        <button className="icon-x item__remove" onClick={() => {this.removeFromPlaylist(item.fbId)}}>
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
                </div>
                <div className="item__list">
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