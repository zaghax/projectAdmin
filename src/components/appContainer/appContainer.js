import React, {Component} from 'react';
import PlayerControls from '../playerControls/playerControls';
import SuggestedVideos from '../suggestedVideos/suggestedVideos';
import SearchVideos from '../searchVideos/searchVideos';
import SearchResults from '../searchResults/searchResults';

class AppContainer extends Component {

    render(){        
        return(
            <div className="AppContainer">
                <PlayerControls/>
                {/* <SuggestedVideos/> */}
                <SearchResults/>
            </div>
        )
    }

}

export default AppContainer