import React , {Component} from 'react';
import {connect} from 'react-redux';
import {dbRefPlaylist} from '../appContainer/appContainer';

class SearchResults extends Component {

    addPlaylistItem = (item) => {

        dbRefPlaylist.push(item);
        
    }

    printVideos = (videos) => {

        return videos.map((item, index) => {

            return (
                <div className='item' key={index} >

                    <div className="item__imageWrap">
                        <img className="item__image" src={item.snippet.thumbnails.medium.url} alt=""/>
                        <button className="icon-plus item__add" onClick={() => { this.addPlaylistItem(item)}}/>
                    </div>

                    <div className="item__title" >
                        <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                    </div>
        
                </div>
            )
        })

    }
    
    render(){
        return(
            <div className="searchResults">
                {this.printVideos(this.props.searchResults)}
            </div>
        )
    }

}

const mapStateToProps = state => {
    return {
        searchResults: state.searchResults
    }
}

export default connect(mapStateToProps)(SearchResults);