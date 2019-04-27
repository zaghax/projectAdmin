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
            `&q=${searchValue} musica`
            ];

        getVideos(params)
        .then((response) => response.json())
        .then(response => {
            this.props.setSearchResults(response.items);
        })

        this.props.setToggleTab('search');
    }

    render(){
        return(
            <div className="searchVideos">
                <form
                    className="form"
                    onSubmit={this.getSearchResults}>

                    <input
                        className="form__input"
                        type="text"
                        placeholder="Search"
                        onChange={this.setSearch}/>

                    <button className="icon-search form__button" type="submit" value="Buscar"/>

                </form>
            </div>
        )
    }
} 

const mapDispathToProps = dispatch => {
    return {
        setSearchResults: (value) => dispatch({type: 'SET_SEARCH_RESULTS', value: value}),
        setToggleTab: (value) => dispatch({type: 'SET_ACTIVE_TAB', value: value})
    }
}

export default connect(null, mapDispathToProps)(SearchVideos);