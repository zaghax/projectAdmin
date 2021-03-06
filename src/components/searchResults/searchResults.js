import React , {Component} from 'react';
import SearchVideos from '../searchVideos/searchVideos';
import {connect} from 'react-redux';
import {dbRefPlaylist} from '../appContainer/appContainer';

class SearchResults extends Component {

    constructor(props){
        super(props);
        this.btnRefs = [];
    }

    addRemovePlaylistItem = (item, index) => {
        if(this.btnRefs[index].classList.contains('icon-trash-2')){

            const fbId = this.btnRefs[index].getAttribute("id");
            dbRefPlaylist.child(fbId).remove();
            this.btnRefs[index].classList.remove("icon-trash-2");
            this.btnRefs[index].classList.add("icon-playlist_add");

        }else{
            dbRefPlaylist.push(item).then((snap)=> {

                this.btnRefs[index].classList.remove("icon-playlist_add");
                this.btnRefs[index].classList.add("icon-check");
                this.btnRefs[index].setAttribute("id", snap.key);

                setTimeout(()=>{
                    this.btnRefs[index].classList.remove("icon-check");
                    this.btnRefs[index].classList.add("icon-trash-2");
                }, 1000)

            });
        }
    }

    printVideos = (videos) => {

        return videos.map((item, index) => {

            return (
                <div className='item' key={index} >

                    <div className="item__imageWrap">
                        <img className="item__image" src={item.snippet.thumbnails.medium.url} alt=""/>
                        <button className="icon-playlist_add item__add" onClick={() => { this.addRemovePlaylistItem(item, index)}} ref={((addBtn) => {this.btnRefs[index] = addBtn})}/>
                    </div>

                    <div className="item__title" >
                        <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                    </div>
        
                </div>
            )
        })

    }
    
    render(){

        const {searchResults} = this.props;

        return(
            <div className={`searchResults ${this.props.searchWindowState ? 'active' : ''}`}>
                <button className="icon-x close-search-window" onClick={() => {this.props.setSearchWindowState(false)}}/>
                <SearchVideos/>
                <div className={`searchItems ${this.props.searchPanelStatus ? 'active' : ''}`}>
                    {searchResults && searchResults !== undefined && this.printVideos(searchResults)}
                    {searchResults === undefined &&
                        <p className="errorMessage">Ohh fuck... <br/> Sorry, you can't search for videos now</p>
                    }
                </div>
            </div>
        )
    }

}

const mapStateToProps = state => {
    return {
        searchResults: state.searchResults,
        searchWindowState: state.searchWindowState,
        searchPanelStatus: state.searchPanelStatus
    }
}

const mapDispathToProps = dispatch => {
    return {
        setSearchWindowState: (value) => dispatch({type: 'SET_SEARCH_WINDOW_STATE', value: value})
    }
}

export default connect(mapStateToProps, mapDispathToProps)(SearchResults);