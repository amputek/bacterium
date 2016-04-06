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

app.use(express["static"]('public'));

colonies = [];

dburl = 'db.json';

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

app.get('/', function(req, res) {
  return res.render('index', {
    message: req.flash('error')
  });
});

app.post('/addBacteria', function(req, res) {
  newColony.id = shortid.generate();
  console.log("adding colony: ", newColony.id);
  return jsonfile.readFile(dburl, function(err, obj) {
    obj.push(newColony);
    return fs.writeFile(dburl, JSON.stringify(obj), function(err) {
      var buf, data;
      if (err) {
        throw err;
      }
      data = img.replace(/^data:image\/\w+;base64,/, "");
      buf = new Buffer(data, 'base64');
      fs.writeFile(__dirname + '/public/gallery/colony' + newColony.id + '.png', buf);
      return getRandomColonies(function(col) {
        return res.send({
          colonies: col
        });
      });
    });
  });
});

app.post('/getColonyCollection', function(req, res) {
  return res.send({
    videos: items
  });
});

io.sockets.on('connection', function(socket) {
  var sendColonies;
  console.log('connection');
  socket.on('disconnect', function() {
    return console.log('disconnecting', socket.index);
  });
  sendColonies = function() {
    return getRandomColonies(function(col) {
      return io.sockets.emit('setColonyCollection', col);
    });
  };
  socket.on('getColonyCollection', sendColonies);
  return socket.on('addBacteria', function(newColony, img) {
    newColony.id = shortid.generate();
    console.log("adding colony: ", newColony.id);
    return jsonfile.readFile(dburl, function(err, obj) {
      obj.push(newColony);
      return fs.writeFile(dburl, JSON.stringify(obj), function(err) {
        var buf, data;
        if (err) {
          throw err;
        }
        data = img.replace(/^data:image\/\w+;base64,/, "");
        buf = new Buffer(data, 'base64');
        fs.writeFile(__dirname + '/public/gallery/colony' + newColony.id + '.png', buf);
        return sendColonies();
      });
    });
  });
});
