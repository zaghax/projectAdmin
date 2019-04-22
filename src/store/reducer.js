const initialState = {
    searchResults: []
}

const reducer = (state = initialState, action) => {

    if(action.type === 'SET_SEARCH_RESULTS'){
        return {
            searchResults: action.value
        }
    }

    return state;
}

export default reducer;