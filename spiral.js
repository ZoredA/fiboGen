var spiral = function(){
    // This is is the main file used in the fibonacchi square/spiral
    // drawing process. Calling run() will draw the rectangle and
    // the createSpiral function will create the spiral.
    // Hopefully this will draw a fibonacchi spiral.
    // Libraries used: 
    //  Raphael
    //  canvg : https://github.com/gabelerner/canvg
    var bigRectangle = {
        x : 0,
        y : 0,
        height : 0,
        width : 0,
        right : true,
        bottom : true,
        squares : [],
        addSquare: function(newSquare){
            // These coordinates describe the top left
            // corner of the square. With respect to
            // the big rectangle, these have to either
            // be (this.x+width,this.y) or (this.x,this.y+height)
            // 
            var squareX = newSquare.attrs.x;
            var squareY = newSquare.attrs.y;
            var squareHeight = newSquare.attrs.height;
            var squareWidth = newSquare.attrs.width;
    
            if (squareHeight != squareWidth || squareHeight < 1 || squareWidth < 1)
            {
                console.log("Object needs to be a square with a height and width of atleast one.");
            }
    
            //If the new square has a height equal to ours,
            //we know we are appending to the right or left side.
            if (squareHeight == this.height)
            {
                this.width += squareWidth;
                if (!this.right)
                {
                    //We are appending to the left, so we update our x value.
                    this.x = squareX;
                }
                this.right = !this.right;
            }
            else
            {
                if (squareWidth != this.width)
                {
                    console.log("Error! New square height is neither our width or height.");
                    return;
                }
                //If our width is equal to the new square's width, then
                //we are adding to the top or bottom.
                this.height += squareHeight;
                if (!this.bottom)
                {
                    //We are appending to the top, so we update our corner y.
                    this.y = squareY;
                }
                this.bottom = !this.bottom;
            }
            
            //Add the square to our array.
            this.squares.push(newSquare);
        },
    
        // This function will return the starting co-ordinate and the length
        // for a new square. It will return either (x+width,y)
        // or (x, y+height) depending on which edge (a or b) is longer.
        // This returns an object of the form
        // {
        //  x:_
        //  y:_
        //  length:_
        // }
        getEdgeForNewSquare : function(){
            var returnObject;
            if (this.height > this.width)
            {
                //We are taller than we are fat,
                //so we return the co-ordinates corresponding
                //to a or a' (on the diagram) depending on this.right.
                if (this.right)
                {
                    returnObject = {
                        x : this.x + this.width,
                        y : this.y,
                        length : this.height
                    };
                }
                else
                {
                    returnObject = {
                        x : this.x - this.height,
                        y : this.y,
                        length : this.height
                    };
                }
                return returnObject;
            }
            else
            {
                //We are fatter than we are tall.
                //so we return co-ordinates corresponding
                //to b or b' (on the diagram) depending on this.bottom.
                if (this.bottom)
                {
                    returnObject = {
                        x : this.x,
                        y : this.y + this.height,
                        length : this.width
                    };
                }
                else
                {
                    returnObject = {
                        x : this.x,
                        y : this.y - this.width,
                        length : this.width
                    };
                }
                return returnObject;
            }
        }
    };
    
    var err = function(context)
    {
        //Taken from http://stackoverflow.com/a/11614265
        var defaults = {
            errorDesc : "An error occured.",
            pO : bigRectangle            
        };
    
        var context = extend(defaults, context);
        console.log(context.errorDesc);
        console.dir(context);
    
        throw context;
    }
    
    //Taken from http://stackoverflow.com/a/11614265
    var extend = function() {
        for (var i = 1; i < arguments.length; i++)
            for (var key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    }
    
    //StartingPoint needs to be an object like so:
    //{
    //  x:_
    //  y:_
    //}
    //
    //Returns
    //{
    //  x:_
    //  y:_
    //  elipse:paper.path object
    //}
    //where x and y are the end points for the curve.
    var drawCurve = function(paper, currentSquare, startingPoint)
    {
        //Height and width are naturally the same...probably..
        var squareLength = currentSquare.attrs.height;
    
        //We basically want to find the furthest point
        //from the startingPoint in this square.
        //We could make assumptions about the direction of the spiral
        //and make this simpler, but we won't.
        // (x_1,y_1)                     (x_2,y_1)
        //           ____________________
        //          |                    |
        //          |                    |
        //          |                    |
        //          |                    |
        //          |                    |
        //          |                    |
        //          |____________________|
        // (x_1,y_2)                     (x_2,y_2)
        // We always draw to the corner exactly opposite.
    
        var squareX_1 = currentSquare.attrs.x;
        var squareX_2 = squareX_1 + squareLength;
        var squareY_1 = currentSquare.attrs.y;
        var squareY_2 = squareY_1 + squareLength;
    
        var oppositeX;
        var oppositeY;
    
        var xChange;
        var yChange;
    
        var lengthStr = squareLength.toString();
        if (startingPoint.x == squareX_1)
        {
            oppositeX = squareX_2;
            //We are going to move forward on the x axis.
            xChange = lengthStr;
        }
        else
        {
            if (startingPoint.x != squareX_2)
            {
                err({errDesc: "Starting point not on corner of square.", pO: startingPoint, square: currentSquare});
            }
            oppositeX = squareX_1;
            //We are going to move backword on the x axis hence the negative.
            xChange = "-" + lengthStr;
        }
    
        if (startingPoint.y == squareY_1)
        {
            oppositeY = squareY_2;
            //We are going to move forward on the y axis.
            yChange = lengthStr;
        }
        else
        {
            if (startingPoint.y != squareY_2)
            {
                err({errDesc: "Starting point not on corner of square.", pO: startingPoint, square: currentSquare});
            }
            oppositeY = squareY_1;
            //We are going to move backword on the y axis hence the negative.
            yChange = "-" + lengthStr;
        }
    
        //We should have the co-ordinates of our curve!
        //Move to those co-ordinates.
        var x1Str = startingPoint.x.toString();
        var y1Str = startingPoint.y.toString();
        var startStr = "M" + x1Str + "," + y1Str;
        //These are flags required by Raphael when drawing
        //the spiral. Here, we need info on the spiral direction,
        //or it won't draw the curve correctly.
        var flagStr;
        if (spiralDirection === "CW")
        {
            flagStr = " 0 0,1 ";
        }
        else
        {
            flagStr = " 0 0,0 ";
        }
        var elipseStr = "a" + lengthStr + "," + lengthStr + flagStr + xChange + "," + yChange;
    
        var pathStr = startStr + elipseStr;
    
        var eli = paper.path(pathStr);
        eli.attr('stroke', spMaster.spiralColor.getOneColor(bigRectangle.squares.length));
        eli.attr('stroke-width', spMaster.spiralWidth);
        eli.attr('stroke-linecap', 'butt');
        return {
            x : oppositeX,
            y : oppositeY,
            elipse : eli
        };
    };
    
    var createSpiral = function(paper)
    {
        //Case A: We can start the curve either at the bottom left
        //corner of the left square1 or the bottom right corner of the
        //right square1.
    
        //We have the spiralStartPoint, we use that as a base to work off of.
        //We make a copy so the original is there if we ever need it again.
        var elipseStartPoint = {
            x:spiralStartPoint.x,
            y:spiralStartPoint.y
        };
        var spirals = [];
        for(var i = 0; i < bigRectangle.squares.length; i++){
            var currentSquare = bigRectangle.squares[i];
            elipseStartPoint = drawCurve(paper, currentSquare, elipseStartPoint);
            //We keep track of the drawn spirals.
            spirals.push(elipseStartPoint.elipse);
        }
        console.log("Done drawing the spiral.");
        return spirals;
    };
    
    var spiralStartPoint = {
        x:null,
        y:null
    };
    
    //Can be either CW or CCW (Clockwise or Counter ClockWise).
    var spiralDirection;
    
    //A number from 1 to 8. Denotes the starting orientation.
    //Can't draw them here, but 4 of the orientations are illustrated
    //in the case diagram below.
    var startingOrientation;
    
    
    // There are eight different orientations the program can have when starting.
    // Each Case below can have a second case with the two initial squares having
    // opposite starting points. This changes the direction of the Spiral from
    // CW to CCW.
    // Brackets denote the startingOrientation number.
    // Case A  (For CW: 1, For CCW: 5) :
    //
    // [1][1]
    // |  2 |
    // |____|
    //
    // Case B (For CW: 2, For CCW: 6):
    //  ____
    // |  2 |
    // |____|
    // [1][1]
    //
    // Case C (For CW: 3, For CCW: 7):
    //     ___
    // [1]| 2 | 
    // [1]|___|
    //
    // Case D (For CW: 4, For CCW: 8):
    //  ___
    // | 2 |[1]
    // |___|[1]
    //
    
    // The starting function. This will setup our
    // starting position and what not.
    var initialize = function(paper, paperX, paperY)
    {
        // The initial length.
        var L = 1;
        // For the time being, let's just start in the center.
        var X = paperX + (paper.width/2);
        var Y = paperY + (paper.height/2);
    
        // We create the initial square.
        var firstSquare = paper.rect(X,Y,L, L);
        
        bigRectangle.x = X;
        bigRectangle.y = Y;
        bigRectangle.squares.push(firstSquare);
        bigRectangle.height = L;
        bigRectangle.width = L;
    
        // We decide where we are going to put our second square.
        // and to do so, we first decide how we want the end result
        // to look.
        
        setOrientation();
        switch(startingOrientation) {
            case 1:
                var secondSquare = paper.rect(X+L,Y,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.width = L + L;
                //The next square will be on the bottom and the
                //one after will be on the left.
                bigRectangle.right = false;
                bigRectangle.bottom = true;
                spiralStartPoint.x = X;
                spiralStartPoint.y = Y+L;
                break;
            case 2:
                var secondSquare = paper.rect(X-L,Y,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.width = L + L;
                bigRectangle.x = X-L;
                //The next square will be on the top and the
                //one after will be on the right.
                bigRectangle.right = true;
                bigRectangle.bottom = false;
                spiralStartPoint.x = X+L;
                spiralStartPoint.y = Y;
                break;
            case 3:
                var secondSquare = paper.rect(X,Y-L,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.height = L + L;
                bigRectangle.y = Y-L;
                //The next square will be on the right and
                //the one after will be on the bottom.
                bigRectangle.right = true;
                bigRectangle.bottom = true;
                spiralStartPoint.x = X+L;
                spiralStartPoint.y = Y+L;
                break;
            case 4:
                var secondSquare = paper.rect(X,Y+L,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.height = L + L;
                //The next square will be on the left and
                //the one after will be on the top.
                bigRectangle.right = false;
                bigRectangle.bottom = false;
                spiralStartPoint.x = X;
                spiralStartPoint.y = Y;
                break;
            case 5:
                var secondSquare = paper.rect(X-L,Y,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.width = L + L;
                bigRectangle.x = X-L;
                //The next square will be on the bottom and the
                //one after will be on the right.
                bigRectangle.right = true;
                bigRectangle.bottom = true;
                spiralStartPoint.x = X+L;
                spiralStartPoint.y = Y+L;
                break;
            case 6:
                var secondSquare = paper.rect(X+L,Y,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.width = L + L;
                //The next square will be on the top and the
                //one after will be on the left.
                bigRectangle.right = false;
                bigRectangle.bottom = false;
                spiralStartPoint.x = X;
                spiralStartPoint.y = Y;
                break;
            case 7:
                var secondSquare = paper.rect(X,Y+L,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.height = L + L;
                //The next square will be on the right and
                //the one after will be on the top.
                bigRectangle.right = true;
                bigRectangle.bottom = false;
                spiralStartPoint.x = X+L;
                spiralStartPoint.y = Y;
                break;
            case 8:
                var secondSquare = paper.rect(X,Y-L,L,L);
                bigRectangle.squares.push(secondSquare);
                bigRectangle.height = L + L;
                bigRectangle.y = Y-L;
                //The next square will be on the left and
                //the one after will be on the bottom.
                bigRectangle.right = false;
                bigRectangle.bottom = true;
                spiralStartPoint.x = X;
                spiralStartPoint.y = Y+L;
                break;
            default:
                //Incorrent number chosen for the startingOrientation.
                throw startingOrientation.toString() + " is an incorrect starting orientation."
        };
        
        //Square #3
        var newSquareEdge = bigRectangle.getEdgeForNewSquare();
        var newSquare = paper.rect(newSquareEdge.x, newSquareEdge.y, newSquareEdge.length, newSquareEdge.length);
        bigRectangle.addSquare(newSquare);
    
    };
    
    // This will set which one of the 8 starting positions we fall into.
    // It will look at whether we want a CW or CCW spiral and pick one of 
    // the 4 positions that work for that choice.
    var setOrientation = function()
    {
        if (startingOrientation > 0)
        {
            //Someone already set it.
            if (startingOrientation < 5)
            {
                spiralDirection = "CW";
            }
            else
            {
                spiralDirection = "CCW";
            }
            return startingOrientation;
        }
        //Can be either CW or CCW (Clockwise or Counter ClockWise).
        //Temporarily setting it here.
        spiralDirection = "CCW";
    
        if (spiralDirection === "CW")
        {
            startingOrientation = 4;
        }
        else
        {
            startingOrientation = 6;
        }
        return startingOrientation;
    };
    
    //This margin helps us stay off the edges of the paper
    //because lines appear to dissapear right at those edges.
    var shiftMargin = 15;
    
    // This function checks if a shift is possible.
    // If there is space on the paper and we can do a shift
    // then we do so to accomodate the new square that
    // we are trying to add.
    var attemptShift = function(paper, newSquareEdge)
    {
        var paperX2 = paperX + paper.width; //Horizontal limit.
        var paperY2 = paperX + paper.height; //Vertical limit.
    
        var ourX2 = bigRectangle.x + bigRectangle.width;
        var ourY2 = bigRectangle.y + bigRectangle.height;
    
        var xShift = 0;
        var yShift = 0;
    
        if (newSquareEdge.x < paperX)
        {
            //We are trying to go too far left.
            //We need to check how much space we have on the
            //right that we can move into.
    
            var emptyRightSpace = paperX2 - ourX2;
            var emptyLeftSpace = bigRectangle.x - paperX;
            var spaceRequired = newSquareEdge.length - emptyLeftSpace + shiftMargin;
    
            if (emptyRightSpace >= spaceRequired)
            {
                //We have enough space, so we can do a left shift.
                xShift = spaceRequired;
            }
            else
            {
                //Even though we need to, we can't shift right.
                //Life sucks or something.
                return false;
            }
        }
        else
        {
            //Note: For the second case, we are 
            //adding in a square whose top edge falls on the paper
            //but X2 does not!
            //This edge (heh) case can only happen if it is a square
            //being added to the right side. For a left side square, the square's x
            //will always be below paperX1 if it doesn't fit.
            if (newSquareEdge.x > paperX2 ||
                    (newSquareEdge.x + newSquareEdge.length) > paperX2)
            {
                //We are trying to go too far right.
                //We need to check how much space we have on the
                //left that we can move into.
                
                var emptyRightSpace = paperX2 - ourX2;
                var emptyLeftSpace = bigRectangle.x - paperX;
                var spaceRequired = newSquareEdge.length - emptyRightSpace + shiftMargin;
    
                if (emptyLeftSpace >= spaceRequired)
                {
                    xShift = -1 * spaceRequired; //Negative because shifting left.
                }
                else
                {
                    //Can't shift left.
                    return false;
                }
            }
        }
    
        // Note: For the second case, we are adding in a square whose first corner
        // falls on the paper, but the second, bottom corner does not.
        if (newSquareEdge.y > paperY2 || 
                (newSquareEdge.y + newSquareEdge.length > paperY2))
        {
            //We are trying to go too far down.
            //We need to check how much space we have above us
            //that we can move into.
    
            var emptySpaceAbove = bigRectangle.y - paperY;
            var emptySpaceBelow = paperY2 - ourY2;
            var spaceRequired = newSquareEdge.length - emptySpaceBelow + shiftMargin;
    
            if (emptySpaceAbove >= spaceRequired)
            {
                //We have space, so we can do a shift up.
                yShift = -1 * spaceRequired; //Negative because y grows downwards.
            }
            else
            {
                return false;
            }
        }
        else
        {
            if (newSquareEdge.y < paperY)
            {
                //We are trying to go too far up.
                //We need to check how much space we have below us
                //that we can move into.
                var emptySpaceAbove = bigRectangle.y - paperY;
                var emptySpaceBelow = paperY2 - ourY2;
                var spaceRequired = newSquareEdge.length - emptySpaceAbove + shiftMargin;
    
                if (emptySpaceBelow >= spaceRequired)
                {
                    yShift = spaceRequired;
                }
                else
                {
                    return false;
                }
            }
        }
        
        if (xShift != 0 || yShift != 0)
        {
            //We need to do a shift and can do so.
            shiftEverything(paper, xShift, yShift);
        }
        return true;
    };
    
    var moveBigRectangle = function(paper, newX, newY){
        var xShift = (bigRectangle.x > newX) ? ((bigRectangle.x - newX) * -1) : (newX - bigRectangle.x);
        var yShift = (bigRectangle.y > newY) ? ((bigRectangle.y - newY) * -1) : (newY - bigRectangle.y);
        shiftEverything(paper, xShift, yShift);
    };
    
    var shiftEverything = function(paper, xShift, yShift){
        if (xShift != 0 || yShift != 0)
        {
            paper.forEach(function (el) {
                var currentX = el.attrs.x;
                var currentY = el.attrs.y;
                el.attr({ x: currentX + xShift, y: currentY + yShift });
            });
    
            //Reset the x and y of our big rectangle.
            bigRectangle.x = bigRectangle.x + xShift;
            bigRectangle.y = bigRectangle.y + yShift;
            
            //We have to adjust the spiral starting point as well.
            spiralStartPoint.x = spiralStartPoint.x + xShift;
            spiralStartPoint.y = spiralStartPoint.y + yShift;
        }
    };
    
    var notInRange = function(newSquareEdge)
    {
        return newSquareEdge.x < paperX ||
            newSquareEdge.y < paperY ||
            newSquareEdge.x > (paperX2) ||
            newSquareEdge.y > (paperY2) ||
            ((newSquareEdge.x + newSquareEdge.length) > paperX2) || 
            ((newSquareEdge.y + newSquareEdge.length) > paperY2);  
            
    };
    
    var spMaster;
    var paperX = 15;
    var paperY = 15;
    var paperX2;
    var paperY2;
    
    var run = function(masterObject)
    {    
        spMaster = masterObject || spiralMaster();
        startingOrientation = spMaster.startingOrientation;
    
        //Hopefully most of this can be used, but it will
        //probably depend on the starting orientation.
        var paper = Raphael(paperX, paperY, spMaster.width, spMaster.height); 
    
        paperX2 = paperX + paper.width;
        paperY2 = paperY + paper.height;
    
        initialize(paper, paperX, paperY);
        var newSquareEdge;
        var newSquare;
        while(bigRectangle.squares.length < 80) {
            newSquareEdge = bigRectangle.getEdgeForNewSquare();
            if (notInRange(newSquareEdge))
            {
                // console.dir(newSquareEdge);
                console.log("New square doesn't fit. Trying shift.");
                if (attemptShift(paper, newSquareEdge))
                {
                    console.log("Shift successful.");
                    continue; //Loop again to get a better edge.
                }
                else
                {
                    console.log("Can not shift anymore. Square generation terminating.");
                    break;
                }
            }
    
            newSquare = paper.rect(newSquareEdge.x, newSquareEdge.y, newSquareEdge.length, newSquareEdge.length);
            bigRectangle.addSquare(newSquare);
        }
    
        //We move the big rectangle to be positioned exactly at the top corner of
        //the paper parent container.
    
        moveBigRectangle(paper, paperX, paperY);
        paper.setSize(bigRectangle.width + 25, bigRectangle.height + 25);
    
        //We color our squares.
        console.log("Coloring the squares.");
        //This is a little bit messy, but basically the colorMaster class
        //deals with coloring stuff using colorWheel.js. colorFill simply
        //adds color to the 'fill' attribute of a Raphael object. colorStroke
        //sets the stroke attribute to a color. colorStroke can also take
        //a callback function that do whatever else you may want (for each square).
        //In this case, we use it to set the stroke width, so we don't have to
        //loop a second time.
        spMaster.squareColor.colorFill(bigRectangle.squares);
        spMaster.squareStroke.colorStroke(bigRectangle.squares, function(square){
            square.attr('stroke-width', spMaster.squareStrokeWidth)
        });
        console.log("Done.");
    
        return paper;
    };
    
    //Source for this: http://stackoverflow.com/a/14175397
    var fiboToImage = function(paper) {
        //Using raphael.export
        //var svg = paper.toSVG();
    
        //No need to use raphael.export since the outerHTML property has it all,
        //and more importantly, raphael.export does not seem to include our
        //gradient colors. :(
        var svg = paper.canvas.outerHTML;
    
        var canvasElement = document.createElement('canvas');
        canvasElement.setAttribute('width', bigRectangle.width.toString());
        canvasElement.setAttribute('height', bigRectangle.height.toString());
        canvasElement.setAttribute('style', 'display:none;');
    
        canvg(canvasElement, svg);
        
        setTimeout(function() {
            //fetch the dataURL from the canvas and set it as src on the image.
            var dataURL = canvasElement.toDataURL("image/png");
            var imgTag = document.getElementById('myImg');
            imgTag.src = dataURL;
            imgTag.style.display= 'inline-block';
            //Hide the paper
            paper.canvas.style.display = 'none'; 
        }, 100);
    };
    
    return {
        'run' : run,
        'createSpiral' : createSpiral,
        'makePNG' : fiboToImage
    }
};