import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Player from './components/player/player'
import NewWindow from 'react-new-window';
import './App.sass';

import YTPlayer from 'react-youtube';




// function copyStyles(sourceDoc, targetDoc) {
//   Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
//     if (styleSheet.cssRules) { // true for inline styles
//       const newStyleEl = sourceDoc.createElement('style');

//       Array.from(styleSheet.cssRules).forEach(cssRule => {
//         newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
//       });

//       targetDoc.head.appendChild(newStyleEl);
//     } else if (styleSheet.href) { // true for stylesheets loaded from a URL
//       const newLinkEl = sourceDoc.createElement('link');

//       newLinkEl.rel = 'stylesheet';
//       newLinkEl.href = styleSheet.href;
//       targetDoc.head.appendChild(newLinkEl);
//     }
//   });
// }


class MyWindowPortal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.containerEl = document.createElement('div'); // STEP 1: create an empty div
    this.externalWindow = null;
  }


  componentDidMount() {
    // STEP 3: open a new browser window and store a reference to it
    this.externalWindow = window.open('', '', 'width=600,height=400,left=200,top=200,scrollbars=0,status=1');

    // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
    this.externalWindow.document.body.appendChild(this.containerEl);

    this.externalWindow.document.title = 'A React portal window';
    // copyStyles(document, this.externalWindow.document);

    // update the state in the parent component if the user closes the
    // new window
    this.externalWindow.addEventListener('beforeunload', () => {
      this.props.closeWindowPortal();
    });
  }

  componentWillUnmount() {
    // This will fire when this.state.showWindowPortal in the parent component becomes false
    // So we tidy up by just closing the window
    this.externalWindow.close();
  }

  render() {
    // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }
}

// class App extends React.PureComponent {

// }

// ReactDOM.render(<App/>, document.getElementById('root'));


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
      showWindowPortal: false,
      YTTarget: null
    };

    this.toggleWindowPortal = this.toggleWindowPortal.bind(this);
    this.closeWindowPortal = this.closeWindowPortal.bind(this);
    this.child = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('beforeunload', () => {
      this.closeWindowPortal();
    });

    window.setInterval(() => {
      this.setState(state => ({
        counter: state.counter + 1,
      }));
    }, 1000);
  }

  toggleWindowPortal() {
    this.setState(state => ({
      ...state,
      showWindowPortal: !state.showWindowPortal,
    }));
  }

  closeWindowPortal() {
    this.setState({ showWindowPortal: false })
  }

  onPlayerReady = (event) => {
    this.setState({
      YTTarget: event.target
    })
    console.log('listo mi pez')
  }

  playVideo = () => {
      const {YTTarget} = this.state;
      YTTarget.playVideo();
      console.log(YTTarget);
      console.log('play desde aqui');
  }

  stopVideo = () => {
      const {YTTarget} = this.state;
      YTTarget.stopVideo();
      console.log(YTTarget);
      console.log('stop desde aqui');
  }

  pauseVideo = () => {
      const {YTTarget} = this.state;
      YTTarget.pauseVideo();
      console.log(YTTarget);
      console.log('pause desde aqui');
  }

  render() {

    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            autoplay: 1,
            rel: 0,
            fs : 1,
            showinfo: 0
        }
    };

    return (
      <div>
        <h1>Counter: {this.state.counter}</h1>

        <button onClick={this.toggleWindowPortal}>
          {this.state.showWindowPortal ? 'Close the' : 'Open a'} Portal
        </button>

        <div className="playerControls">
          <button className="ctrl-btn icon-step-backward" onClick={() => this.child.current.previousVideo()}/>
          <button className="ctrl-btn icon-play" onClick={() => this.playVideo()}/>
          <button className="ctrl-btn icon-pause" onClick={() => this.pauseVideo()}/>
          <button className="ctrl-btn icon-stop" onClick={() => this.stopVideo()}/>
          <button className="ctrl-btn icon-step-forward" onClick={() => this.child.current.nextVideo()}/>
        </div>

        {this.state.showWindowPortal && (
          <MyWindowPortal closeWindowPortal={this.closeWindowPortal} >
            <h1>Counter in a portal: {this.state.counter}</h1>
            <p>Even though I render in a different window, I share state!</p>

            <YTPlayer
                    videoId='Kgz0vD1vSxY'
                    opts={opts}
                    onReady={this.onPlayerReady}
              />

            <button onClick={() => this.closeWindowPortal()} >
              Close me!
            </button>
          </MyWindowPortal>
        )}
      </div>
    );
  }







  // // state = {
  // //   screen: true
  // // }

  // constructor(props) {
  //   super(props);
  //   this.child = React.createRef();
  // }

  // render() {

  //   // const features = {
  //   //   width: 800,
  //   //   height: 600,
  //   //   resizable: true,
  //   //   scrollbars: 0,
  //   //   menubar: 0,
  //   //   toolbar: 0,
  //   //   titlebar: 0
  //   // }

  //   return (
  //     <div className="App">
  //       <Player ref={this.child}/>

  //       {/* {this.state.screen &&
  //         <NewWindow >
  //           <Player ref={this.child}/>
  //         </NewWindow>
  //       } */}
  //       <div className="playerControls">
  //           <button className="ctrl-btn icon-step-backward" onClick={() => this.child.current.previousVideo()}/>
  //           <button className="ctrl-btn icon-play" onClick={() => this.child.current.playVideo()}/>
  //           <button className="ctrl-btn icon-pause" onClick={() => this.child.current.pauseVideo()}/>
  //           <button className="ctrl-btn icon-stop" onClick={() => this.child.current.stopVideo()}/>
  //           <button className="ctrl-btn icon-step-forward" onClick={() => this.child.current.nextVideo()}/>
  //       </div>
  //     </div>
  //   );
  // }

}

export default App;
