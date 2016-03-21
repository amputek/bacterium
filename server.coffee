express = require('express')
app = express()
http = require('http')
server = http.createServer(app)
io = require('socket.io').listen(server)
server.listen(8080)
fs = require('fs')
shortid = require('shortid')


jsonfile = require('jsonfile')
util = require('util')

colonies = []

dburl = 'db.json'



app.use(express.static('public'));


#----selects 20 bacteria at random from the current collection----#
getRandomColonies = ( callback ) ->

    jsonfile.readFile(dburl, (err, obj) ->
        if( err )
            throw err
        colonies = obj


        someColonies = [];

        coloniesSelected = 0
        totalColoniesToSelect = 20

        if( colonies.length < totalColoniesToSelect )
            totalColoniesToSelect = colonies.length

        if(colonies.length > 0)
            while coloniesSelected < totalColoniesToSelect
                x = Math.floor( Math.random() * colonies.length )
                count = 0
                for colony in colonies
                    if( x == count )
                        someColonies.push(colony)
                        coloniesSelected++

        callback( someColonies )
    )

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
        getRandomColonies( (col) ->
            io.sockets.emit('setColonyCollection', col )
        )
    )

    #-----recieve new bacteria from user-------#
    socket.on('addBacteria', ( newColony, img ) ->
        newColony.id = shortid.generate()
        console.log("adding colony: ", newColony)

        jsonfile.readFile(dburl, (err, obj) ->
            obj.push newColony
            fs.writeFile(dburl, JSON.stringify(obj), (err) ->
                data = img.replace(/^data:image\/\w+;base64,/, "")
                buf = new Buffer(data, 'base64')
                fs.writeFile(__dirname + '/public/gallery/colony' + newColony.id + '.png', buf)

                getRandomColonies( (col) ->
                    io.sockets.emit('setColonyCollection', col )
                )

                if (err)
                    throw err;
            );
        )
    )
)
