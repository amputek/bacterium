#----draw functions------#
window.strokedCircle = (ctx, x, y, r) ->
    ctx.beginPath()
    ctx.arc x, y, r, 0, 2*Math.PI, false
    ctx.stroke()
window.solidCircle = (ctx, x, y, r) ->
    ctx.beginPath()
    ctx.arc x, y, r, 0, 2*Math.PI, false
    ctx.fill()
arc = (ctx, x, y, r, dir, length) ->
    ctx.beginPath()
    ctx.arc x, y, r, Math.PI/2 + dir-length, Math.PI/2 + dir + length, false
    ctx.stroke()
window.line = (ctx, x, y, x2, y2) ->
    ctx.beginPath()
    ctx.moveTo(x,y)
    ctx.lineTo(x2,y2)
    ctx.stroke()
#----random number generator-----#
window.random = (low, high) ->
    return Math.random() * (high-low) + low
#----euclidean distance function----#
distance = (x1, y1, x2, y2) ->
    return Math.sqrt( Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))
#–----bacteria class------#
class window.Bacteria
    constructor: ( @ctx ) ->
        @id = 0;
        @startingBranches = 10;
        @startingSize = 10.0;
        @branchFactor = 0.001;
        @branchDirectionMod = -Math.PI*0.5;
        #---point shape/size-----#
        @childPointSizeRandom = 2.0;
        @solidness = 0.5;
        @fatness = 0.02;
        @childPointSize = 0.99;
        @red = 40;
        @green = 150;
        @blue = 255;
        @opacity = 0.1;
        #----growth pattern-----#
        @sineMod = 0.0;
        @gapSize = 1.0;
        @curveRandom = 0.3;
        @curveMod = 0.01;
        @deathSize = 0.01;
        @branches = [];

    #–---initialises bacteria--------#
    start: ( position ) ->
        @branches = [];
        if( position == "edge" )
            for i in [0..@startingBranches] by 1
                startAngle = random(0, Math.PI*2)
                startx = 300 + Math.sin(startAngle) * 280;
                starty =  300 + Math.cos(startAngle) * 280;
                facingangle = Math.atan2(startx - 300, starty - 300);
                p = new Point(startx, starty, facingangle + Math.PI, @startingSize, this);
                @branches.push new Branch( p )

        if( position == "center" )
            for i in [0..@startingBranches] by 1
                p = new Point( 300, 300, Math.random() * Math.PI*2, @startingSize, this)
                @branches.push new Branch( p )

        if( position == "line" )
            for i in [0..@startingBranches] by 1
                dir = Math.PI * Math.round( random(0,2) )
                p = new Point( random(0,600), 300, dir, @startingSize, this)
                @branches.push new Branch( p )

    draw: () ->
        for i in [0..@branches.length-1]
            if @branches[i].dead == false
                point = @branches[i].lastPoint();
                #---calculate position based on sine method, needs the starting direction of the branch---#
                t = (0+distance( point.x, point.y, 300, 300)) * 0.001
                sinepos = @branches[i].direction() + Math.sin( @branches[i].points.length * t ) * (10.0-point.si)*@curveMod*4.0;
                #---calculate position based on curve - just uses last point's direction----#
                curvepos = point.dir + @curveMod;
                #---interpolate between them---#
                angle = (@sineMod * sinepos) + ( (1.0-@sineMod) * curvepos);
                #----add random number-----#
                angle += random(-@curveRandom, @curveRandom)
                #---new coordinates-----#
                newx = point.x + Math.sin(angle) * @gapSize;
                newy = point.y + Math.cos(angle) * @gapSize;
                #---new size----#
                newsize = point.si * @childPointSize + random(-@childPointSizeRandom,@childPointSizeRandom)
                #---create new point----#
                newpoint = new Point( newx, newy, angle, newsize, this);
                #kill off branch if necessary...
                if( distance(newx,newy,300,300) > 300 or (newpoint.si < @deathSize))
                    @branches[i].dead = true
                else
                    #----otherwise, add new point----#
                    @branches[i].addPoint( newpoint )
                    #----create new branch------#
                if(random(0.0,1.0) < @branchFactor)
                    p = new Point( point.x, point.y, point.dir + @branchDirectionMod, point.si, this)
                    @branches.push new Branch( p );

                point.draw();

#----branch is a collection of points---------#
class Branch
    constructor: ( point ) ->
        @points = [];
        @points.push point
        @dead = false

    lastPoint: () ->
        return @points[ @points.length-1 ]

    direction: () ->
        return @points[0].dir;

    addPoint: ( p ) ->
        @points.push p

#–-----just a draw method, really. but tidier to keep it in seperate class-----#
class Point
    constructor: (@x, @y, @dir, @si, @parent) ->

    draw: () ->
        ctx = @parent.ctx;
        #---canvas requires integers for cololour values-----#
        red = Math.round(@parent.red)
        green = Math.round(@parent.green)
        blue = Math.round(@parent.blue)
        #----center and edge opacity from solidness parameter---#
        centerop = @parent.opacity * @parent.solidness;
        edgeop = @parent.opacity * (1.0 - @parent.solidness)
        ctx.fillStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + centerop + ')'
        ctx.strokeStyle = 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + edgeop + ')'
        ctx.lineWidth = 2.0;
        #---draw to context (canvas)-----#
        ctx.save()
        #----temp size, make sure above 0.0 otherwise canvas crashes----#
        size = @si;
        if(size < 0.1)
            size = 0.1;
        #–---translate to point position----#
        ctx.translate(@x,@y);
        #–--orient to direction of point----#
        ctx.rotate( -@dir + Math.PI/2);
        #----scale depending on fatness----#
        ctx.scale( 1 - @parent.fatness, 1 + @parent.fatness )
        solidCircle( ctx, 0, 0, size )
        strokedCircle( ctx, 0,0, size )
        ctx.restore()
