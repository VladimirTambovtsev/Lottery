const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ from: accounts[0], gas: '1000000' })
});

describe('Lottery Contract', () => {
	it('deploys a contract', () => {
		assert.ok(lottery.options.address);
	});	

	it('allows one account to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether') 	// convert Eth number to wei
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length); 
	});


	it('allows multiple account to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether') 	// convert Eth number to wei
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether') 	// convert Eth number to wei
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether') 	// convert Eth number to wei
		});


		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length); 
	});


	it('requires a minimum amount of eth to enter', async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 0
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});


	it('only a manager can call pickWinner', async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});


	it('sends money to a winner', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether')
		});

		const initialBalance = await web3.eth.getBalance(accounts[0]);	

		await lottery.methods.pickWinner().send({ from: accounts[0] });		// eth should be added to winner

		const finalBalance = await web3.eth.getBalance(accounts[0]);
		
		const difference = finalBalance - initialBalance;
		console.log(difference);
		assert(difference > web3.utils.toWei('1.8', 'ether'));
	});
	
	it('lottery resets after execution of pickWinner function', async ()=> {
    	
		await lottery.methods.enter().send({
      
		from: accounts[0], value: web3.utils.toWei('3', 'ether')
    	});
    
		const players = await lottery.methods.getPlayers().call({from: accounts[0]});
    
		await lottery.methods.pickWinner().send({from: accounts[0]});

    
		assert(players.length, undefined );
  	});

  it('lottery has a balance of zero after one round', async ()=> {
    
	  await lottery.methods.enter().send({
      
		from: accounts[0], value: web3.utils.toWei('2', 'ether')
    });
    
	  const players = await lottery.methods.getPlayers().call({from: accounts[0]});
    
	  await lottery.methods.pickWinner().send({from: accounts[0]});
    
	  const Balance = await web3.eth.getBalance(players[0]);
    
	  assert(Balance, 0);
  });
	
});	




