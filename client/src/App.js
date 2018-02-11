import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css'; 
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = { 
    manager: '',
    balance: '',
    players: [],
    value: '',
    message: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }
  

  onSubmit = async (e) => {
    e.preventDefault();

    this.setState({ message: 'Waiting on transaction success..' })

    const accounts = await web3.eth.getAccounts();
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: "You've been entered!" })
  }


  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction success..' });

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked!' });
  }

  render() { 
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This Contract is managed by: {this.state.manager}</p>
        <p>There are {this.state.players.length} Players compething to win {web3.utils.fromWei(this.state.balance, 'ether')} Ether</p>
        <hr/>
        <h4>You want to try?</h4>
        <form onSubmit={this.onSubmit}>
          <div>
            <label>Amout of Ether to enter</label>
            <input type="text" value={this.state.value} onChange={e =>  this.setState({ value: e.target.value })} />
            <button>Enter</button>
          </div>
        </form>
        <hr/>
        <h1>{this.state.message}</h1>
        <hr/>
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
      </div>
    );
  }
}

export default App;
