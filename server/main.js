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
// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
        // process WebSocket message
            var d = JSON.parse(message.utf8Data);
            console.log(d);
            if (d.type === "move") {
                game.move((d.player === "white"), d.move);
                clients["white"].send(JSON.stringify(game.getPieces("white"))); 
                clients["black"].send(JSON.stringify(game.getPieces("black")));

            } else if (d.type === "start") {
                clients[d.player] = connection;
                if (Object.keys(clients).length === 2) {
                  game = new g();
                  console.log("new game");
                  clients["white"].send(JSON.stringify(game.getPieces("white"))); 
                  clients["black"].send(JSON.stringify(game.getPieces("black")));
              }
            }
        }
    });

  connection.on('close', function(connection) {
        // close user connection
        console.log("closing");

        clients = {};
  });
});