import React , {Component} from 'react';
import {connect} from 'react-redux'


class SearchResults extends Component {

    printVideos = (videos) => {

        return videos.map((item, index) => {

            return (
                <div className='videoItem' key={index} >

                    <div className="videoWrapper">

                        <div className="imageWrapper">
                            <img className="videoImage" src={item.snippet.thumbnails.medium.url} alt=""/>
                            <button className="icon-plus addVideo" >
                                {/* onClick={() => { this.addPlaylistItem(item)}} */}
                            </button>
                        </div>

                        <div className="videoTitle" >
                            <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                        </div>
                    
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