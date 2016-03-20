colonyParameters = null

#----growth variables----------#
frameCount = 0;
time = 200;
growing = false;
emphasis = 0.0;
globalOpacityMod = 1.0;

#current active drawloop
drawLoop = null;

#growthmode vs breedmode
breedMode = false;

#–---current bacteria being drawn-----#
currentColony = null;

radio = {}
canvas = null


class ColonyParameters
    constructor: () ->
        @sliders = {
            currentColor : { r: 34, g: 7, b: 63, a: 0.1 },
            startingbranches : document.getElementById('startingBranches'),
            startsize : document.getElementById('startingSize'),
            branchfactor : document.getElementById('branchFactor'),
            branchdirection : document.getElementById('branchDirection'),
            solidness : document.getElementById('solidness'),
            fatness : document.getElementById('fatness'),
            pointsize : document.getElementById('pointSize'),
            pointsizerandom : document.getElementById('pointSizeRandom'),
            curverandom : document.getElementById('curveRandom'),
            curvemod : document.getElementById('curveMod'),
            gapsize : document.getElementById('gapSize'),
            sinemod : document.getElementById('sineMod'),
            deathsize : document.getElementById('deathSize')
        }

        _this = @


        $('#color-picker').minicolors({
            change: ( value, opacity) ->
                s = value.substring(4,value.length-1);
                s = s.split(",")
                result = []
                for a in s
                    a = a.replace /^\s+|\s+$/g, ""
                    result.push a

                    _this.sliders.currentColor.r = result[0]
                    _this.sliders.currentColor.g = result[1]
                    _this.sliders.currentColor.b = result[2]
                    _this.sliders.currentColor.a = 0.1;
            ,
            control: 'hue',
            defaultValue: '#22073f',
            format: 'rgb',
            inline: true,
            opacity: false,
            theme: 'picker',
        });

    randomise: () ->
        for k, val of @sliders
            if( val != null )
                val.value = Math.random() * 100.0;
        $('#color-picker').minicolors('value', { color: 'rgb(' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ')' });


    setupColonyFromInputs : ( colony ) ->
        colony.startingBranches = Math.round( (@sliders.startingbranches.value*0.2)*(@sliders.startingbranches.value*0.2) )
        colony.startingSize = @sliders.startsize.value * 0.3;
        colony.branchFactor = @sliders.branchfactor.value * 0.0003;
        colony.branchDirectionMod = (Math.PI) + (  (@sliders.branchdirection.value / 15.915));
        colony.gapSize = @sliders.gapsize.value * 0.05 + 0.03;
        colony.sineMod = @sliders.sinemod.value * 0.01;
        colony.curveRandom = @sliders.curverandom.value * 0.01;
        colony.curveMod = @sliders.curvemod.value * 0.001;
        colony.deathSize = @sliders.deathsize.value * 0.01;
        colony.solidness = @sliders.solidness.value * 0.01;
        colony.fatness = (@sliders.fatness.value-50.0) * 0.019;
        colony.childPointSize = @sliders.pointsize.value * 0.001 + 0.89;
        colony.childPointSizeRandom = @sliders.pointsizerandom.value * 0.02;
        colony.red   = Math.round(@sliders.currentColor.r)
        colony.green = Math.round(@sliders.currentColor.g)
        colony.blue  = Math.round(@sliders.currentColor.b)
        colony.opacity = @sliders.currentColor.a;

class Canvas
    constructor: () ->
        @drawcanvas = document.getElementById 'drawCanvas'
        @ctx = @drawcanvas.getContext '2d'
        @grd = @ctx.createRadialGradient(300,300,1,300,300,300);
        @grd.addColorStop(0, '#16171A');
        @grd.addColorStop(1, '#000000');

    clear: () ->
        @ctx.globalCompositeOperation = "source-over"
        @ctx.strokeStyle = 'rgba(255,255,255,1.0)'
        @ctx.fillStyle = "#000"
        @ctx.fillStyle = @grd;
        @ctx.fillRect(0,0,610,610);
        @ctx.globalCompositeOperation = "lighter"

    strokedCircle : ( x, y, r) ->
        @ctx.beginPath()
        @ctx.arc x, y, r, 0, 2*Math.PI, false
        @ctx.stroke()

    solidCircle : ( x, y, r) ->
        @ctx.beginPath()
        @ctx.arc x, y, r, 0, 2*Math.PI, false
        @ctx.fill()

    arc : ( x, y, r, dir, length) ->
        @ctx.beginPath()
        @ctx.arc x, y, r, Math.PI/2 + dir-length, Math.PI/2 + dir + length, false
        @ctx.stroke()

    line : ( x, y, x2, y2) ->
        @ctx.beginPath()
        @ctx.moveTo(x,y)
        @ctx.lineTo(x2,y2)
        @ctx.stroke()

    drawPoint: (red,green,blue,opacity,solidness,size,x,y,direction,fatness) ->

        #----center and edge opacity from solidness parameter---#
        centerop = opacity * solidness
        edgeop = opacity * (1.0 - solidness)
        @ctx.fillStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + centerop + ')'
        @ctx.strokeStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + edgeop + ')'
        @ctx.lineWidth = 2.0;

        #---draw to context (canvas)-----#
        @ctx.save()

        #----temp size, make sure above 0.0 otherwise canvas crashes----#
        if(size < 0.1)
            size = 0.1;

        #–---translate to point position----#
        @ctx.translate(x,y);

        #–--orient to direction of point----#
        @ctx.rotate( -direction + Math.PI/2);

        #----scale depending on fatness----#
        @ctx.scale( 1 - fatness, 1 + fatness )
        @solidCircle( 0 , 0, size )
        @strokedCircle( 0 ,0, size )
        @ctx.restore()


startGrowing = () ->

    #-----check position--------#
    startPosition = "center"
    if( radio.edge.checked == true)
        startPosition = "edge"
    if( radio.center.checked == true)
        startPosition = "center"
    if( radio.line.checked == true)
        startPosition = "line"

    #------set up bacteria-----#
    # currentColony = new Colony( )
    colonyParameters.setupColonyFromInputs( currentColony );
    currentColony.initSeeds( startPosition );

    #----start drawing-----#
    frameCount = 0;
    window.clearInterval( drawLoop )
    drawLoop = setInterval( drawGrow, 1000/60 )


#---draw method for "grow mode"---#
drawGrow = () ->
    if(growing == true && frameCount < 500)
        frameCount++;
        currentColony.update()
        currentColony.draw( canvas );


window.onload = ->

    currentColony = new Colony()
    colonyParameters = new ColonyParameters()
    canvas = new Canvas()

    #--------button listeners--------#
    $('#drawCanvas').click( () ->
        canvas.clear();
        if(breedMode == false)
            startGrowing();
        if(breedMode == true)
            startBreeding();
        growing = true;
    )

    $('#randomButton').click( () ->
        colonyParameters.randomise();
        canvas.clear();
        startGrowing();
        growing = true;
    )


    #-------draw area------------#


    #---global inputs----#
    radio.center = document.getElementById 'center'
    radio.edge = document.getElementById 'edge'
    radio.line = document.getElementById 'line'


    #----breed control------#
    # slider.emphasis = document.getElementById 'emphasis'
    # slider.globalopacity = document.getElementById 'globalopacity'

    #----node server stuff------#
    # socket = null;
    # socket = io.connect('http://192.168.1.94:8080');
    # socket.emit('getBacteriaCollection')



    #--for breeding, the current bacteria interpolates between source and destination
    # selectedBacteria = [];
    # destinationBacteria = new Bacteria( ctx )
    # sourceBacteria = new Bacteria( ctx )

    colonyParameters.randomise();
    canvas.clear();
