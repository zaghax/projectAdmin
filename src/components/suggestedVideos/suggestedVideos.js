import React, {Component} from 'react';
import {getVideos} from '../getVideos/getVideos';
import {connect} from 'react-redux';
import Coverflow from 'react-coverflow';
import {dbRefPlaylist} from '../appContainer/appContainer';

class SuggestedVideos extends Component {

    state = {
        suggestedVideos: []
    }

    addPlaylistItem = (item) => {

        dbRefPlaylist.push(item);
        
    }

    getSuggestedVideos = (currentVideoId) => {

        const params = [
            `&maxResults=${10}`,
            `&relatedToVideoId=${currentVideoId}`
        ];
        
        getVideos(params)
        .then((response) => response.json())
        .then(response => {
            this.setState({
                suggestedVideos: response.items
            })
        })
    }

    getSuggestedVideosList = (videos) => {
        return videos.map((item, index) => {
            return (
                <div className="item" key={index}>
                    <div className="item__card">
                        <img className="item__image" src={item.snippet.thumbnails.high.url}/>
                        <button className="icon-plus item__add" onClick={() => { this.addPlaylistItem(item)}}/>
                        <div className="item__title" >
                            <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                        </div>
                    </div>
                </div>
            ) 
        })
    } 

    render(){
        this.getSuggestedVideos(this.props.currentVideoData.id.videoId);
        return (
            <div className="suggestedVideos">
                <div className="item__list">
                    <Coverflow   width="auto" height="300"
                        displayQuantityOfSide={1}
                        enableScroll={false}
                        clickable={true}
                        infiniteScroll={true}
                        navigation={false}
                        enableHeading={false}
                        active={5}
                    >
                        {this.getSuggestedVideosList(this.state.suggestedVideos)}
                    </Coverflow>
                </div>
            </div>
        )
    }
} 

const mapStateToProps = state => {
    return {
        currentVideoData: state.currentVideoData
    }
}

export default connect(mapStateToProps)(SuggestedVideos);