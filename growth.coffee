window.onload = ->
    #-------draw area------------#
    drawcanvas = document.getElementById 'drawCanvas'
    ctx = drawcanvas.getContext '2d'

    #-------inputs buttons-------#
    button_grow = document.getElementById 'growButton'
    button_breed = document.getElementById 'breedButton'
    button_stop = document.getElementById 'stopButton'
    button_random = document.getElementById 'randomButton'

    #---global inputs----#
    slider_growTime = document.getElementById 'growTime'
    radio_center = document.getElementById 'center'
    radio_edge = document.getElementById 'edge'
    radio_line = document.getElementById 'line'

    #----entity sliders-----#
    slider_startingbranches = document.getElementById 'startingBranches'
    slider_startsize = document.getElementById 'startingSize'
    slider_branchfactor = document.getElementById 'branchFactor'
    slider_branchdirection = document.getElementById 'branchDirection'

    #----point shape/size----#
    slider_solidness = document.getElementById 'solidness'
    slider_fatness = document.getElementById 'fatness'
    slider_pointsize = document.getElementById 'pointSize'
    slider_pointsizerandom = document.getElementById 'pointSizeRandom'
    slider_red = document.getElementById 'red'
    slider_green = document.getElementById 'green'
    slider_blue = document.getElementById 'blue'
    slider_opacity = document.getElementById 'opacity'

    #---growth parameters-----#
    slider_curverandom = document.getElementById 'curveRandom'
    slider_curvemod = document.getElementById 'curveMod'
    slider_gapsize = document.getElementById 'gapSize'
    slider_sinemod = document.getElementById 'sineMod'
    slider_deathsize = document.getElementById 'deathSize'

    #----breed control------#
    slider_emphasis = document.getElementById 'emphasis'
    slider_globalopacity = document.getElementById 'globalopacity'
    sliders = [slider_startingbranches,
               slider_branchfactor,
               slider_branchdirection,
               slider_solidness,
               slider_fatness,
               slider_pointsize,
               slider_pointsizerandom,
               slider_red,
               slider_blue,
               slider_green,
               slider_opacity,
               slider_curvemod,
               slider_curverandom,
               slider_gapsize,
               slider_sinemod,
               slider_deathsize]


    #----node server stuff------#
    # socket = null;
    # socket = io.connect('http://192.168.1.94:8080');
    # socket.emit('getBacteriaCollection')

    #----growth variables----------#
    startPosition = "center"
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
    currentBacteria = null;

    #--for breeding, the current bacteria interpolates between source and destination
    selectedBacteria = [];
    destinationBacteria = new Bacteria( ctx )
    sourceBacteria = new Bacteria( ctx )

    #-----randomise sliders---------#
    initialiseInputs = () ->
        for i in [0..sliders.length-1] by 1
            sliders[i].value = Math.random()*100.0;

    setupCanvas = () ->
        ctx.globalCompositeOperation = "source-over"
        ctx.lineWidth = 3.0;
        ctx.strokeStyle = 'rgba(255,255,255,1.0)'
        ctx.fillStyle = "#000"
        grd = ctx.createRadialGradient(300,300,1,300,300,300);
        grd.addColorStop(0, '#16171A');
        grd.addColorStop(1, '#000000');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,610,610);
        ctx.globalCompositeOperation = "lighter"

    startGrowing = () ->
        currentBacteria = new window.Bacteria( ctx )
        setInputs( currentBacteria );
        frameCount = 0;
        #-----check position--------#
        if( radio_edge.checked == true)
            startPosition = "edge"
        if( radio_center.checked == true)
            startPosition = "center"
        if( radio_line.checked == true)
            startPosition = "line"
        #------set up bacteria-----#
        currentBacteria.start( startPosition );
        window.clearInterval( drawLoop )
        #----start drawing-----#
        drawLoop = setInterval( drawGrow, 1000/60 )


    startBreeding = () ->
        currentBacteria = new window.Bacteria( ctx )
        if( radio_edge.checked == true)
            startPosition = "edge"
        if( radio_center.checked == true)
            startPosition = "center"
        if( radio_line.checked == true)
            startPosition = "line"
        #----initialise bacteria variables-----#
        currentBacteria.deathSize = (sourceBacteria.deathSize + destinationBacteria.deathSize) / 2;
        currentBacteria.startingBranches = sourceBacteria.startingBranches;
        currentBacteria.startingSize = sourceBacteria.startingSize;
        #-----growth variables------#
        globalOpacityMod = slider_globalopacity.value * 0.008 + 0.2
        emphasis = slider_emphasis.value * 0.02 - 1.0;
        frameCount = 0;
        currentBacteria.start( startPosition )
        window.clearInterval( drawLoop )
        #-----start drawing-----#
        drawLoop = setInterval( drawBreed, 1000/60 )

    setInputs = ( aBacteria ) ->
        aBacteria.startingBranches = Math.round( (slider_startingbranches.value*0.2)*(slider_startingbranches.value*0.2) )
        aBacteria.startingSize = slider_startsize.value * 0.3;
        aBacteria.branchFactor = slider_branchfactor.value * 0.0003;
        aBacteria.branchDirectionMod = slider_branchdirection.value / 15.915;
        aBacteria.gapSize = slider_gapsize.value * 0.05 + 0.03;
        aBacteria.sineMod = slider_sinemod.value * 0.01;
        aBacteria.curveRandom = slider_curverandom.value * 0.01;
        aBacteria.curveMod = slider_curvemod.value * 0.001;
        aBacteria.deathSize = slider_deathsize.value * 0.01;
        aBacteria.solidness = slider_solidness.value * 0.01;
        aBacteria.fatness = (slider_fatness.value-50.0) * 0.019;
        aBacteria.childPointSize = slider_pointsize.value * 0.001 + 0.89;
        aBacteria.childPointSizeRandom = slider_pointsizerandom.value * 0.02;
        aBacteria.red = Math.round(slider_red.value * 2.55);
        aBacteria.green = Math.round(slider_green.value * 2.55);
        aBacteria.blue = Math.round(slider_blue.value * 2.55);
        aBacteria.opacity = slider_opacity.value * 0.0015 + 0.002

    #---draw method for "grow mode"---#
    drawGrow = () ->
        if(growing == true)
            if(frameCount < time)
                frameCount++;
                currentBacteria.draw();

    #--interpolates between two values (source, destination)--#
    interpolate = (source, destination) ->
        rate = -emphasis;
        if( emphasis >= 0.0)
            if( frameCount < time*rate)
                return source;
            else
                step = (destination - source) / time;
                return source + (step * (frameCount-(time*rate)))
        else
            rate = 1.0 + rate;
            if( frameCount < time*rate)
                step = (destination - source) / (time*rate)
                return source + (step * frameCount)
            else
                return destination

    #--draw method for "breed mode"---#
    drawBreed = () ->
        if(growing == true)
            if(frameCount < time)
                frameCount++;
                #----interpolate for each of the evolveable parameters------#
                currentBacteria.branchFactor = interpolate(sourceBacteria.branchFactor, destinationBacteria.branchFactor)
                currentBacteria.branchDirectionMod = interpolate(sourceBacteria.branchDirectionMod, destinationBacteria.branchDirectionMod)
                currentBacteria.solidness = interpolate(sourceBacteria.solidness, destinationBacteria.solidness)
                currentBacteria.fatness = interpolate(sourceBacteria.fatness, destinationBacteria.fatness)
                currentBacteria.childPointSize = interpolate(sourceBacteria.childPointSize, destinationBacteria.childPointSize)
                currentBacteria.childPointSizeRandom = interpolate(sourceBacteria.childPointSizeRandom, destinationBacteria.childPointSizeRandom)
                currentBacteria.red = interpolate(sourceBacteria.red, destinationBacteria.red) + random(-10,10)
                currentBacteria.green = interpolate(sourceBacteria.green, destinationBacteria.green) + random(-10,10)
                currentBacteria.blue = interpolate(sourceBacteria.blue, destinationBacteria.blue) + random(-10,10)
                currentBacteria.opacity = interpolate(sourceBacteria.opacity, destinationBacteria.opacity)
                currentBacteria.opacity *= globalOpacityMod;
                currentBacteria.gapSize = interpolate(sourceBacteria.gapSize, destinationBacteria.gapSize)
                currentBacteria.sineMod = interpolate(sourceBacteria.sineMod, destinationBacteria.sineMod)
                currentBacteria.curveMod = interpolate(sourceBacteria.curveMod, destinationBacteria.curveMod)
                currentBacteria.curveRandom = interpolate(sourceBacteria.curveRandom, destinationBacteria.curveRandom)
                currentBacteria.draw();

    #–---select an image in the gallery-----#
    select = ( element ) ->
        element.style.opacity = 1.0;
        element.style.backgroundSize = 100 + "%"
        element.style.borderColor = 'rgba(255,255,255,1.0)'
        element.selected = true
        selectedBacteria.push element

    deselect = ( element, index ) ->
        element.style.opacity = 0.6;
        element.style.backgroundSize = 80 + "%"
        element.style.borderColor = 'rgba(255,255,255,0.0)'
        element.selected = false
        selectedBacteria.splice index, 1

        #–-----listener for clicking images in the gallery section----------#
    clickImage = (event) ->
        element = event.toElement;
        if(element.selected == false)
            if( selectedBacteria.length < 2)
                select( element )
        else
            if(element == selectedBacteria[1])
                deselect( element, selectedBacteria.length-1)
            if(element == selectedBacteria[0])
                deselect( element, 0 )

        #–----send message to server---------#
        # if(selectedBacteria.length == 2)
            # socket.emit("getBacteria", selectedBacteria[0].id, selectedBacteria[1].id)

    #–----recieve message from server, set source/dest bacteria-------#
    # socket.on('setBacteria', (bacteria) ->
    #     sourceBacteria = bacteria[0];
    #     destinationBacteria = bacteria[1];
    #     document.getElementById("source").style.backgroundImage = "url(gallery/bacteria" + bacteria[0].id + ".png)"
    #     document.getElementById("dest").style.backgroundImage = "url(gallery/bacteria" + bacteria[1].id + ".png)"
    #     #-----set up client-side variables------#
    #     sourceBacteria.ctx = ctx;
    #     destinationBacteria.ctx = ctx;
    #     sourceBacteria.branches = [];
    #     destinationBacteria.branches = [];
    # )

    #-------------recieve collection, get images-------#
    # socket.on('setBacteriaCollection', (bacteria) ->
    #     document.getElementById("grid").innerHTML = "";
    #     col = null;
    #     for i in [0..bacteria.length-1] by 1
    #         if(i % 5 == 0)
    #             col = document.createElement("div")
    #             col.setAttribute('class', 'col')
    #             document.getElementById("grid").appendChild(col)
    #             n = document.createElement("div");
    #             n.addEventListener("click", clickImage, false);
    #             n.setAttribute('id', bacteria[i].id);
    #             n.setAttribute('class', 'gimg');
    #             n.style.backgroundImage = "url(gallery/bacteria" + bacteria[i].id + ".png)"
    #             n.selected = false;
    #             col.appendChild(n)
    # )

                #--------button listeners--------#
    $(drawCanvas).click( () ->
        time = slider_growTime.value * 5.0;
        setupCanvas();
        if(breedMode == false)
            startGrowing();
        if(breedMode == true)
            startBreeding();
        growing = true;
    )

    $(growButton).click( () ->
        time = slider_growTime.value * 5.0;
        setupCanvas();
        if(breedMode == false)
            startGrowing();
        if(breedMode == true)
            startBreeding();
        growing = true;
    )

    #-----sends message to server with bacteria's parameters-----#
    $(breedButton).click( () ->
        console.log("adding bacteria...", currentBacteria)
        st = drawcanvas.toDataURL();
        send = jQuery.extend({},currentBacteria)
        send.ctx = null;
        send.branches = null;
        socket.emit('addBacteria', send, st);
    )

    $(randomButton).click( () ->
        initialiseInputs();
        setupCanvas();
        startGrowing();
        growing = true;
    )

    #----switching tab between grow/breed modes----#
    # $(breedTab).click( () ->
    #     console.log("breedtab")
    #     breedMode = true;
    #     $(this).css('z-index', 2)
    #     $(growTab).css('z-index', 1)
    #     selectedBacteria = [];
    # )

    $(growTab).click( () ->
        console.log("growtab")
        breedMode = false;
        $(this).css('z-index', 2)
        $(breedTab).css('z-index', 1)
    )
    $(stopButton).click( () ->
        growing = false;
    )
    initialiseInputs();
    setupCanvas();
