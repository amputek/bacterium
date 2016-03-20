express = require('express')
app = express()
http = require('http')
server = http.createServer(app)
io = require('socket.io').listen(server)
server.listen(8080)
fs = require('fs')

app.use(express.static('public'));

colonies = [];



#----selects 20 bacteria at random from the current collection----#
getRandomColonies = () ->
    someColonies = [];
    if(colonies.length > 0)
        for i in [0..19] by 1
            index = Math.floor( Math.random() * colonies.length )
            someColonies.push(colonies[index])
    return someColonies;

#–----server side class of bacteria--------#

# class Colony
#     constructor: () ->
#         @id = 0;
#         @startingBranches = 10;
#         @startingSize = 10.0;
#         @branchFactor = 0.001;
#         @branchDirectionMod = -Math.PI*0.5;
#         #---point shape/size-----#
#         @childPointSizeRandom = 2.0;
#         @solidness = 0.5;
#         @fatness = 0.02;
#         @childPointSize = 0.99;
#         @red = 40;
#         @green = 150;
#         @blue = 255;
#         @opacity = 0.1;
#         #----growth pattern-----#
#         @sineMod = 0.0;
#         @gapSize = 1.0;
#         @curveRandom = 0.3;
#         @curveMod = 0.01;
#         @deathSize = 0.01;

#---in and out messages, setup upon connection-----#
io.sockets.on('connection', (socket) ->
    console.log('connection');

    socket.on('disconnect', () ->
        console.log('disconnecting', socket.index);
    )

    socket.on('getBacteria', (source, dest) ->
        io.sockets.emit('setBacteria', [ colonies[source], colonies[dest] ])
    )

    #----ask for the entire bacteria collection-----#
    socket.on('getColonyCollection', () ->
        io.sockets.emit('setColonyCollection', getRandomColonies() );
    )

    #-----recieve new bacteria from user-------#
    socket.on('addBacteria', ( newColony, img ) ->
        #-----add bacteria to collection-----#
        newColony.id = colonies.length;
        console.log("adding colony. id = ", newColony.id);
        colonies.push( newColony )
        #----create a png from the provided image data------#
        data = img.replace(/^data:image\/\w+;base64,/, "")
        buf = new Buffer(data, 'base64')
        fs.writeFile(__dirname + '/public/gallery/colony' + (colonies.length-1) + '.png', buf)
        #-----broadcast the updated collection-----#
        io.sockets.emit('setColonyCollection', getRandomColonies() );
    )
)
