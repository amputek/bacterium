#----random number generator-----#
random = (low, high) ->
    return Math.random() * (high-low) + low

#----euclidean distance function----#
distance = (x1, y1, x2, y2) ->
    return Math.sqrt( Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))

#–----bacteria class------#
class Colony
    constructor: ( ) ->
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

    createPoint = ( x, y, angle, size ) ->
        return { x: x, y: y, dir: angle, si: size }

    createBranch: ( point ) ->
        @branches.push( [ point ] )

    getLastPointOfBranch = ( branch ) ->
        return branch[ branch.length - 1 ]

    getSeedDirection = ( branch ) ->
        return branch[0].dir;

    #–---initialises bacteria--------#
    initSeeds: ( position ) ->
        @branches = [];
        if( position == "edge" )
            for i in [0..@startingBranches] by 1
                startAngle = random(0, Math.PI*2)
                startx = 300 + Math.sin(startAngle) * 280;
                starty =  300 + Math.cos(startAngle) * 280;
                facingangle = Math.atan2(startx - 300, starty - 300);
                @createBranch( createPoint(startx, starty, facingangle + Math.PI, @startingSize ) )

        if( position == "center" )
            for i in [0..@startingBranches] by 1
                startAngle = random(0, Math.PI*2)
                d = random(0,430)
                startx = 300 + Math.sin(startAngle) * d;
                starty =  300 + Math.cos(startAngle) * d;
                facingangle = Math.atan2(300 - startx, 300 - starty);
                @createBranch( createPoint(startx, starty, facingangle + Math.PI, @startingSize ) )
                # @createBranch( createPoint( 300, 300, Math.random() * Math.PI*2, @startingSize ) )

        if( position == "line" )
            for i in [0..@startingBranches] by 1
                dir = Math.PI * Math.round( random(0,2) )
                @createBranch( createPoint( random(0,600), 300, dir, @startingSize ) )

    update: () ->

        toKill = []

        i = 0
        for branch in @branches

            point = getLastPointOfBranch( branch );

            #---calculate position based on sine method, needs the starting direction of the branch---#
            t = distance( point.x, point.y, 300, 300) * 0.001
            sinepos = getSeedDirection(branch) + Math.sin( branch.length * t ) * (10.0-point.si)*@curveMod*4.0;

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
            newpoint = createPoint( newx, newy, angle, newsize )

            #kill off branch if necessary...
            if( distance(newx,newy,300,300) > 300 or (newpoint.si < @deathSize))
                toKill.push( i )
            else
                #----otherwise, add new point----#
                branch.push( newpoint )

            #----create new branch------#
            if(random(0.0,1.0) < @branchFactor)
                p = createPoint( point.x, point.y, point.dir + @branchDirectionMod, point.si )
                @createBranch( p )

            i++

        for a in toKill
            @branches.splice(a, 1)




    draw: ( canvas ) ->
        for branch in @branches
            red = Math.round(@red)
            green = Math.round(@green)
            blue = Math.round(@blue)
            point = getLastPointOfBranch( branch );
            canvas.drawPoint(red,green,blue,@opacity,@solidness,point.si,point.x,point.y,point.direction,fatness)
