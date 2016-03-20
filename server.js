var app, colonies, express, fs, getRandomColonies, http, io, server;

express = require('express');

app = express();

http = require('http');

server = http.createServer(app);

io = require('socket.io').listen(server);

server.listen(8080);

fs = require('fs');

app.use(express["static"]('public'));

colonies = [];

getRandomColonies = function() {
  var i, index, j, someColonies;
  someColonies = [];
  if (colonies.length > 0) {
    for (i = j = 0; j <= 19; i = j += 1) {
      index = Math.floor(Math.random() * colonies.length);
      someColonies.push(colonies[index]);
    }
  }
  return someColonies;
};

io.sockets.on('connection', function(socket) {
  console.log('connection');
  socket.on('disconnect', function() {
    return console.log('disconnecting', socket.index);
  });
  socket.on('getBacteria', function(source, dest) {
    return io.sockets.emit('setBacteria', [colonies[source], colonies[dest]]);
  });
  socket.on('getColonyCollection', function() {
    return io.sockets.emit('setColonyCollection', getRandomColonies());
  });
  return socket.on('addBacteria', function(newColony, img) {
    var buf, data;
    newColony.id = colonies.length;
    console.log("adding colony. id = ", newColony.id);
    colonies.push(newColony);
    data = img.replace(/^data:image\/\w+;base64,/, "");
    buf = new Buffer(data, 'base64');
    fs.writeFile(__dirname + '/public/gallery/colony' + (colonies.length - 1) + '.png', buf);
    return io.sockets.emit('setColonyCollection', getRandomColonies());
  });
});
