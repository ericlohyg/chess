import React from 'react';
import logo from './logo.svg';
import './App.css';
import Board from './Board';
import Landing from './Landing';




class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
		entered: false,
		pieces: null,
		ws: null,
		waiting: false,
		move: ''
		};

		this.onClick = this.onClick.bind(this);
	};

  	componentDidMount() {
    	this.connect();
  	};

	connect = () => {
		var ws = new WebSocket("ws://35.202.8.190:1337");
		let that = this; // cache the this
		var connectInterval;

		// websocket onopen event listener
		ws.onopen = () => {
			console.log("connected websocket main component");

			this.setState({ ws: ws });

			that.timeout = 250; // reset timer to 250 on open of websocket connection 
			clearTimeout(connectInterval); // clear Interval on on open of websocket connection
		};

        ws.onmessage = evt => {
			// listen to data sent from the websocket server
			const message = JSON.parse(evt.data);
			console.log(message);

			if (message.type === 'move') {
				this.setState({
					move: message.move,
				});
			} else if (message.type === 'start') {
				this.setState({
					entered: true
				})
			}

		};
	
		// websocket onclose event listener
		ws.onclose = e => {
			console.log(
				`Socket is closed. Reconnect will be attempted in ${Math.min(
					10000 / 1000,
					(that.timeout + that.timeout) / 1000
				)} second.`,
				e.reason
			);
			this.setState({
				entered: false,
				waiting: false,
			})
			that.timeout = that.timeout + that.timeout; //increment retry interval
			connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
		};

		// websocket onerror event listener
		ws.onerror = err => {
			console.error(
				"Socket encountered error: ",
				err.message,
				"Closing socket"
			);

			ws.close();
		};
	};

	check = () => {
		const { ws } = this.state;
		if (!ws || ws.readyState === WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
	};

	onClick(e, color) {
		this.setState({
		color: color,
		waiting: true
		});
		this.state.ws.send(JSON.stringify({type:"start", sender: color}));
	};

	render() {
		var toRender = <Landing onClick={this.onClick} waiting={this.state.waiting} />;

		if (this.state.entered) {
			toRender = <Board ws={this.state.ws} player={this.state.color} pieces={this.state.pieces} turn={this.state.turn} move={this.state.move}/>
		} 

		return (
		<div className="App">
			{toRender}
		</div>
		);
	};
}

export default App;
