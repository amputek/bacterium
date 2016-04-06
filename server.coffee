express = require('express')
app = express()
http = require('http')
server = http.createServer(app)

# TODO: stop using sockets. overkill!
io = require('socket.io').listen(server)
server.listen(8080)
fs = require('fs')
shortid = require('shortid')
jsonfile = require('jsonfile')
util = require('util')

app.use(express.static('public'));

colonies = []
dburl = 'db.json'




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


app.get('/' , (req, res)->
    res.render('index', { message: req.flash('error') });
)

app.post( '/addBacteria' , (req,res)->
    newColony.id = shortid.generate()
    console.log( "adding colony: ", newColony.id )
    jsonfile.readFile(dburl, (err, obj) ->
        obj.push newColony
        fs.writeFile(dburl, JSON.stringify(obj), (err) ->
            if (err)
                throw err;
            data = img.replace(/^data:image\/\w+;base64,/, "")
            buf = new Buffer(data, 'base64')
            fs.writeFile(__dirname + '/public/gallery/colony' + newColony.id + '.png', buf)
            getRandomColonies( (col)->
                res.send({colonies:col});
            )
        )
    )
)

app.post( '/getColonyCollection' , (req,res)->
    # SaveAndExport( req, res );

    res.send({ videos: items });
);

#---in and out messages, setup upon connection-----#
io.sockets.on('connection', (socket) ->
    console.log('connection');

    socket.on('disconnect', () ->
        console.log('disconnecting', socket.index);
    )

    sendColonies = () ->
        getRandomColonies( (col) ->
            io.sockets.emit('setColonyCollection', col )
        )

    #----ask for the entire bacteria collection-----#
    socket.on('getColonyCollection', sendColonies )

    #-----recieve new bacteria from user-------#
    socket.on('addBacteria', ( newColony, img ) ->
        newColony.id = shortid.generate()
        console.log( "adding colony: ", newColony.id )

        jsonfile.readFile(dburl, (err, obj) ->
            obj.push newColony
            fs.writeFile(dburl, JSON.stringify(obj), (err) ->
                if (err)
                    throw err;
                data = img.replace(/^data:image\/\w+;base64,/, "")
                buf = new Buffer(data, 'base64')
                fs.writeFile(__dirname + '/public/gallery/colony' + newColony.id + '.png', buf)

                sendColonies()
            )
        )
    )
)
