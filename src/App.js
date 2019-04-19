import React, { Component } from 'react';
import { BrowserRouter, Route}  from 'react-router-dom';
import AppContainer from './components/appContainer/appContainer';
import Player from './components/player/player';

import './App.sass';

class App extends Component {

    render() {
        return (
            <BrowserRouter>
                <Route path="/" exact component={AppContainer} />
                <Route path="/player" exact component={Player} />
            </BrowserRouter>
        );
    }

}

export default App;
