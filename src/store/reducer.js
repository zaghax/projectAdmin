const initialState = {
    videoDuration: 0
}

const reducer = (state = initialState, action) => {

    if(action.type === 'SET_VIDEO_DURATION'){
        return {
            videoDuration: action.value
        }
    }

    return state;
}

export default reducer;