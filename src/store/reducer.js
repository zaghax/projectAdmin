const initialState = {
    searchResults: [],
    fullPlayList: 'play',
    playListKeys: [],
    currentVideoData: {},
    currentObjectKey: '',
    activeTab: 'suggestions'
}

const reducer = (state = initialState, action) => {


    switch(action.type ){

        //Actions from searchResults component
        case 'SET_SEARCH_RESULTS' :
            return {
                ...state,
                searchResults: action.value
            }

        //Actions from appContainer component

        case 'SET_FULL_PLAYLIST' :
            return {
                ...state,
                fullPlayList: action.value
            }

        case 'SET_PLAYLIST_KEYS' :
            return {
                ...state,
                playListKeys: action.value
            }

        case 'SET_CURRENT_VIDEO_DATA' :
            return {
                ...state,
                currentVideoData: action.value
            }

        case 'SET_CURRENT_OBJECT_KEY' :
            return {
                ...state,
                currentObjectKey: action.value
            }
        
        case 'SET_ACTIVE_TAB' :
            return {
                ...state,
                activeTab: action.value
            }

        default:
            return {
                ...state
            }
    }

    // return state;
}

export default reducer;