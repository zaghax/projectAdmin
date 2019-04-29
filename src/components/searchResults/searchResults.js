import React , {Component} from 'react';
import {connect} from 'react-redux';
import {dbRefPlaylist} from '../appContainer/appContainer';

class SearchResults extends Component {

    constructor(props){
        super(props);
        this.btnRefs = [];
    }

    addRemovePlaylistItem = (item, index) => {
        if(this.btnRefs[index].classList.contains('icon-x')){

            const fbId = this.btnRefs[index].getAttribute("id");
            dbRefPlaylist.child(fbId).remove();
            this.btnRefs[index].classList.add("icon-plus");
            this.btnRefs[index].classList.remove("icon-x");

        }else{
            dbRefPlaylist.push(item).then((snap)=> {

                this.btnRefs[index].classList.remove("icon-plus");
                this.btnRefs[index].classList.add("icon-x");
                this.btnRefs[index].setAttribute("id", snap.key);

            });
        }
    }

    printVideos = (videos) => {

        return videos.map((item, index) => {

            return (
                <div className='item' key={index} >

                    <div className="item__imageWrap">
                        <img className="item__image" src={item.snippet.thumbnails.medium.url} alt=""/>
                        <button className="icon-plus item__add" onClick={() => { this.addRemovePlaylistItem(item, index)}} ref={((addBtn) => {this.btnRefs[index] = addBtn})}/>
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