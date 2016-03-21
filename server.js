var app, colonies, dburl, express, fs, getRandomColonies, http, io, jsonfile, server, shortid, util;

express = require('express');

app = express();

http = require('http');

server = http.createServer(app);

io = require('socket.io').listen(server);

server.listen(8080);

fs = require('fs');

shortid = require('shortid');

jsonfile = require('jsonfile');

util = require('util');

colonies = [];

dburl = 'db.json';

app.use(express["static"]('public'));

getRandomColonies = function(callback) {
  return jsonfile.readFile(dburl, function(err, obj) {
    var coloniesSelected, colony, count, i, len, someColonies, totalColoniesToSelect, x;
    if (err) {
      throw err;
    }
    colonies = obj;
    someColonies = [];
    coloniesSelected = 0;
    totalColoniesToSelect = 20;
    if (colonies.length < totalColoniesToSelect) {
      totalColoniesToSelect = colonies.length;
    }
    if (colonies.length > 0) {
      while (coloniesSelected < totalColoniesToSelect) {
        x = Math.floor(Math.random() * colonies.length);
        count = 0;
        for (i = 0, len = colonies.length; i < len; i++) {
          colony = colonies[i];
          if (x === count) {
            someColonies.push(colony);
            coloniesSelected++;
          }
        }
      }
    }
    return callback(someColonies);
  });
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
    return getRandomColonies(function(col) {
      return io.sockets.emit('setColonyCollection', col);
    });
  });
  return socket.on('addBacteria', function(newColony, img) {
    newColony.id = shortid.generate();
    console.log("adding colony: ", newColony);
    return jsonfile.readFile(dburl, function(err, obj) {
      obj.push(newColony);
      return fs.writeFile(dburl, JSON.stringify(obj), function(err) {
        var buf, data;
        data = img.replace(/^data:image\/\w+;base64,/, "");
        buf = new Buffer(data, 'base64');
        fs.writeFile(__dirname + '/public/gallery/colony' + newColony.id + '.png', buf);
        getRandomColonies(function(col) {
          return io.sockets.emit('setColonyCollection', col);
        });
        if (err) {
          throw err;
        }
      });
    });
  });
});
