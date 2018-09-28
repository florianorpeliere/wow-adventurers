import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { characters: [] };
    }

    componentDidMount() {
        fetch('/api/characters/professions')
            .then(response => response.json())
            .then(characters => this.setState({characters: this.state.characters.concat(characters)}))
    }

    renderCharacter = () =>
        this.state.characters.map(character => (
           <div>
               {character.name}
               <ul>
                   {
                       character.professions.primary.map(profession => (
                           <li>{profession.name} : {profession.rank}/{profession.max}</li>
                       ))
                   }
               </ul>
           </div>
        ));


    render() {
        return (
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <p className="App-intro">
                {this.renderCharacter()}
            </p>
          </div>
        );
    }
}

export default App;
