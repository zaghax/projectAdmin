import React, {Component} from 'react';
import { connect } from 'react-redux';
import {getVideos} from '../getVideos/getVideos';


class SearchVideos extends Component {

    state = {
        searchValue: ''
    }

    setSearch = (e) => {
        this.setState({
            searchValue: e.target.value
        });
    }

    getSearchResults = (e) => {

        e.preventDefault();

        const {searchValue} = this.state;

        const params = [
            `&maxResults=${15}`,
            `&q=${searchValue}`
            ];

        getVideos(params)
        .then((response) => response.json())
        .then(response => {
            this.props.setSearchResults(response.items);
        })
    }

    render(){
        return(
            <div className="searchVideos">
                <form
                    className="searchForm"
                    onSubmit={this.getSearchResults}>

                    <input
                        className="searchInput"
                        type="text"
                        placeholder="Find your video"
                        onChange={this.setSearch}/>

                    <button className="icon-search searchButton" type="submit" value="Buscar"/>

                </form>
            </div>
        )
    }
} 

const mapDispathToProps = dispatch => {
    return {
        setSearchResults: (value) => dispatch({type: 'SET_SEARCH_RESULTS', value: value})
    }
}

export default connect(null, mapDispathToProps)(SearchVideos);