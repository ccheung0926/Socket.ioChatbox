var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var name = [];
var users = {};


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.use('/', express.static(path.join(__dirname, '/')));

io.on('connection', function(socket){
  //server listen to the emitted message from client
  socket.on('clientToSeverMsg', function(data){
    console.log('hi', JSON.stringify(data));
    //send msg to everyone BUT the sender
    socket.broadcast.emit('severToClientMsg', data);
  });
  socket.on('clientToSeverGetName', function(data){
    if(name.indexOf(data) === -1){
      name.push(data);
    }
    console.log('clientToSeverGetName', data);
    users[data] = socket;
    console.log(users);
    io.emit('severToClientGiveName', name);
  });

  socket.on('sendMsgToSever', function(data){
    console.log('sendMsgToSever', data); 
    // When a message is received, emit the data to the receiver.
    users[data.to].emit('receivedMessage', data);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});