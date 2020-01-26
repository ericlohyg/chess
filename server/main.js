var g = require('./Game.js');

var game = new g();


var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
var wsServer = new WebSocketServer({
    httpServer: server
});
var clients = {}
var turn = "white";
// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
        // process WebSocket message
            var d = JSON.parse(message.utf8Data);
            console.log("rcv: ");
			console.log(d);
			
			if (d.sender == null) {
				console.log("Invalid msg, no sender defined");
				return;
			};
			if (d.type == null) {
				console.log("Invalid msg, no type defined");
				return;
            };
            
            if (clients[d.sender] == null) {
                clients[d.sender] = connection;
            };

            if (d.type === 'move' && d.move != null) {
                var msg = {};
                msg.move = d.move;
                msg.type = 'move';

                if (d.sender === 'l') {
                    console.log("sending to d");
                    clients['d'].send(JSON.stringify(msg));
                } else if (d.sender === 'd') {
                    console.log("sending to l");
                    clients['l'].send(JSON.stringify(msg));
                };
            } else if (clients['d'] != null && clients['l'] != null) {
                clients['d'].send(JSON.stringify({type: 'start'}));
                clients['l'].send(JSON.stringify({type: 'start'}));
            };
        };
    });

    connection.on('close', function(connection) {
        // close user connection
        if (clients['d'] != null) {
            clients['d'].close();
        };
        if (clients['l' != null] ) {
            clients['l'].close();
        };
        clients = {};
    });
});