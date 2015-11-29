import React  from 'react';
import ReactDOM  from 'react-dom';

var App = React.createClass({
  render(){
    return <h1>Hello Butts</h1>
  }
});

ReactDOM.render(<App />, document.querySelector('#app'));
