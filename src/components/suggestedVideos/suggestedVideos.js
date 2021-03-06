import React, {Component} from 'react';
import {getVideos} from '../getVideos/getVideos';
import {connect} from 'react-redux';
import Coverflow from 'react-coverflow';
import {dbRefPlaylist} from '../appContainer/appContainer';
import {store} from '../../index';

class SuggestedVideos extends Component {

    state = {
        suggestedVideos: [],
        currentObjectKey: '',
        printCoverFlow: false
    }

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

    componentDidMount(){

        this.getSuggestedVideos(this.props.currentVideoData.id.videoId);

        this.setState({
            currentObjectKey: this.props.currentObjectKey
        })

        store.subscribe(()=>{

            if(this.state.currentObjectKey !== store.getState().currentObjectKey){
                this.setState({
                    currentObjectKey:  store.getState().currentObjectKey,
                    printCoverFlow: false
                }, () => {
                    setTimeout(()=>{
                        this.getSuggestedVideos(this.props.currentVideoData.id.videoId);
                    }, 500)
                })
            }

        })
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
                suggestedVideos: response.items,
                printCoverFlow: true
            })
            console.log(response.items)
        }).catch(error => console.log('Error', error));

    }

    getSuggestedVideosList = (videos) => {
        return videos.map((item, index) => {
            
            if (item.snippet){

                return (
                    <div className="item" key={index}>
                        <div className="item__card">
                            <img className="item__image" src={item.snippet.thumbnails.high.url} alt={item.snippet.title}/>
                            <button className="icon-playlist_add item__add" onClick={() => { this.addRemovePlaylistItem(item, index)}} ref={((addBtn) => {this.btnRefs[index] = addBtn})}/>
                            <div className="item__title" >
                                <p dangerouslySetInnerHTML={{__html: item.snippet.title}} />
                            </div>
                        </div>
                    </div>
                ) 
                
            }else {
                return(
                    <div className="item" key={index}>
                        <div className="item__novideo">
                            <h1 className="novideo__title">Video no available</h1>
                        </div>
                    </div>
                )   
            }
            
        })
    } 

    render(){

        const {printCoverFlow, suggestedVideos} = this.state;

        return (
            <div className="suggestedVideos">
                <div className="head"><span>Suggested Videos</span></div>
                <div className="item__list">
                    {suggestedVideos && suggestedVideos !== undefined && printCoverFlow && 
                    
                        <Coverflow   
                            width={300}
                            height={300}
                            displayQuantityOfSide={1}
                            enableScroll={false}
                            clickable={false}
                            infiniteScroll={true}
                            navigation={true}
                            enableHeading={false}
                            active={0}
                            currentFigureScale={1}
                        >
                            {this.getSuggestedVideosList(this.state.suggestedVideos)}
                        </Coverflow>
                        
                    }

                    {suggestedVideos === undefined &&
                        <p className="errorMessage">Videos not available</p>
                    }
                    
                </div>
            </div>
        )
    }
} 

const mapStateToProps = state => {
    return {
        currentVideoData: state.currentVideoData,
        fullPlayList: state.fullPlayList,
        currentObjectKey: state.currentObjectKey
    }
}

export default connect(mapStateToProps)(SuggestedVideos);