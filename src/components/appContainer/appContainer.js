import React, {Component} from 'react';
import PlayerControls from '../playerControls/playerControls';

class AppContainer extends Component {

    render(){        
        return(
            <div className="AppContainer">
                <PlayerControls/>
            </div>
        )
    }

}

export default AppContainer