// This file figures out the "random" or dynamic parts of the spiral wheel.
// It decides things like a starting orientation and the colors (which
// colors to start and end with, which direction should the gradient go), etc
// Note This file itself does not handle the random number generation.
// Accepts an options object that allows someone to override all of the
// randomness if desired. Useful for debugging and trying out stuff.
var spiralMaster = function(options) {
    options = options || {};
    options.setDefault('spiralWheel', 'singleColor');
    options.setDefault('spiralStartColor', 'black');
    options.setDefault('colorWheel', 'singleColor');
    // Pick the color wheel to use.
    
    if(options.colorWheel === 'gradientWheel'){
        //With the exception of spreadMethod, defaults
        //taken from http://www.w3.org/TR/SVG/pservers.html
        options.setDefault('gradientType', 'radial');
        options.setDefault('spreadMethod', 'reflect');
        if (options.gradientType === 'radial'){
            options.setDefault('cx', '50%');
            options.setDefault('cy', '50%');
            options.setDefault('r', '50%');
            options.setDefault('fy', '0%');
            options.setDefault('fx', '0%');
        }
        else{
            //The only other option we can support is linear gradients, so
            //we assume that to be the case.
            options.setDefault('x1', '0%');
            options.setDefault('y1', '0%');
            options.setDefault('x2', '100%');
            options.setDefault('y2', '0%');
        }
    }
    
    var r_colorWheel = options.colorWheel;
    var r_getColor;
    var hexColor; //Only used if there is only one color to apply.
    if (r_colorWheel === 'singleColor'){
        hexColor = rgbToHex(options.startingRed, options.startingGreen, options.startingBlue);
        r_getColor = function(totalCount){return hexColor;};
    }
    else{
        var spiralWheelObject;
        r_getColor = function(totalCount){
            if(!spiralWheelObject){
                spiralWheelObject = getColorWheel(r_colorWheel, totalCount);
            }
            var colorToReturn =  spiralWheelObject.getHex();
            spiralWheelObject.advance();
            return colorToReturn;
        }
    }
    var r_width = options.width || 1000;
    var r_height = options.height || 1000;

    // Randomly generate the starting orientation.
    var r_startingOrientation = options.startingOrientation || 1;

    var NS = "http://www.w3.org/2000/svg";

    var createLinearGradient = function(hexList, elementToColor) {
        if (hexList.length == 1) {
            //The element only needs one color, no need to make a gradient
            //for it.
            elementToColor.attr({ fill : hexList[0] });
            return;
        }

        var gradientStr = "45-"+hexList[0];
        var percentIncrementRate = 100 / (hexList.length - 1);
        var currentPercent = 0;
        for(var i = 1; i < hexList.length-1; i++) {
            gradientStr = gradientStr + "-" + hexList[i] + ":" + currentPercent.toInt().toString();
            currentPercent += percentIncrementRate;
        }
        gradientStr = gradientStr + "-" + hexList.last().toString();
        elementToColor.attr({ fill : gradientStr});
    };
    
    var createLinearElementTag = function(parentDefsNode, hexList, elementToColor){
        if (hexList.length == 1) {
            //The element only needs one color, no need to make a gradient
            //for it.
            elementToColor.attr({ fill : hexList[0] });
            return;
        }
        var radialNode = document.createElementNS(NS, "linearGradient");
        //We assume the elements have a unique height. This should normally
        //be true.
        radialNode.id = "LGradient" + elementToColor.attrs.height;
        radialNode.setAttribute("x1", options.x1);
        radialNode.setAttribute("y1", options.y1);
        radialNode.setAttribute("x2", options.x2);
        radialNode.setAttribute("y2", options.y2);
        radialNode.setAttribute("spreadMethod", options.spreadMethod);
        //radialNode.setAttribute("gradientTransform", "rotate(180)");
        var percentIncrementRate = 100 / (hexList.length - 1);
        var currentPercent = 0;
        for(var i = 0; i < hexList.length; i++) {
            var stopNode = document.createElementNS(NS, "stop");
            stopNode.setAttribute("offset", currentPercent.toInt().toString() + "%");
            stopNode.setAttribute("stop-color", hexList[i]);
            radialNode.appendChild(stopNode);
            currentPercent += percentIncrementRate;
        }
        parentDefsNode.appendChild(radialNode);
        elementToColor.node.setAttribute("fill", "url(#" + radialNode.id + ")");
    }
    
    //Expects the parentDef (child of SVG) and a hexList
    //that is returned by a call to gradientWheel's getHexList
    //function.
    var createRadialElementTag = function(parentDefsNode, hexList, elementToColor){
        if (hexList.length == 1) {
            //The element only needs one color, no need to make a radialElement
            //for it.
            elementToColor.attr({ fill : hexList[0] });
            return;
        }
        var radialNode = document.createElementNS(NS, "radialGradient");
        //We assume the elements have a unique height. This should normally
        //be true.
        radialNode.id = "RGradient" + elementToColor.attrs.height;
        radialNode.setAttribute("cx", options.cx);
        radialNode.setAttribute("cy", options.cy);
        radialNode.setAttribute("r", options.r);
        radialNode.setAttribute("fx", options.fx);
        radialNode.setAttribute("fy", options.fy);
        radialNode.setAttribute("spreadMethod", options.spreadMethod);
        //radialNode.setAttribute("gradientTransform", "rotate(180)");
        var percentIncrementRate = 100 / (hexList.length - 1);
        var currentPercent = 0;
        for(var i = 0; i < hexList.length; i++) {
            var stopNode = document.createElementNS(NS, "stop");
            stopNode.setAttribute("offset", currentPercent.toInt().toString() + "%");
            stopNode.setAttribute("stop-color", hexList[i]);
            radialNode.appendChild(stopNode);
            currentPercent += percentIncrementRate;
        }
        parentDefsNode.appendChild(radialNode);
        elementToColor.node.setAttribute("fill", "url(#" + radialNode.id + ")");
    };

    // Constructs and returns a color wheel that can be used to color stuff.
    var getColorWheel = function(colorWheelName, numberToColor) {
        var wheel = getFunctionFromString(colorWheelName, colorWheels);
        if (wheel == undefined) {
            throw "Unable to find colorWheel with id: " + r_colorWheel;
        }
        options.setDefault('stepsRequired', numberToColor - 1);
        return wheel(options);
    };

    //A generic way to apply the color...so this can be used to apply color to different
    //attributes, e.g. .attr('fill', '#...') or .attr('stroke', '#...') or even something
    //like .color('fill', '#...') if needed. Probably kinda slow because of that though.
    var applyColors = function(wheel, objectCollection, methodToCall, propertyToSet, postColorFN){
        var collectionSize = objectCollection.length;
        var svg = objectCollection[0].paper.canvas;
        var svgChildren = svg.childNodes;
        var defsNode;
        var item;
        for (var i = 0; i < svgChildren.length; i++){
          var childNode = svgChildren[i];
          if (childNode.nodeName == "defs"){
            defsNode = childNode;
            break;
          }
        }
        if (r_colorWheel === "gradientWheel"){
            defsNode.innerHTML = ''; //Clear any existing gradients.
            for(var i = 0; i < collectionSize; i++){
                item = objectCollection[i];
                if (options.gradientType === 'radial')
                {
                    createRadialElementTag(defsNode, wheel.getHexList(), item);    
                }
                else
                {
                    //createLinearGradient(wheel.getHexList(), item);
                    createLinearElementTag(defsNode, wheel.getHexList(), item);
                }
                wheel.advance();
                if (postColorFN){postColorFN(item)};
            };
        }
        else{
            for(var i = 0; i < collectionSize; i++){
                item = objectCollection[i];
                var temp = {};
                temp[propertyToSet] = wheel.getHex();
                getFunctionFromString(methodToCall, item).call(item, temp);
                wheel.advance();
                if (postColorFN){postColorFN(item)};
            };
        }
    };

    var colorRaphObjects = function(objectCollection, postColorFN){
        if (r_colorWheel === 'singleColor'){
            if(!hexColor){
                throw "hexColor not set despite using singleColor wheel. Internal state error."
            }
            applySingleColorToRaphObj(objectCollection, "fill", postColorFN);
            return;
        }
        var wheel = getColorWheel(r_colorWheel,objectCollection.length, options);
        console.log("OBJECT SIZE");
        console.log(objectCollection.length);
        applyColors(wheel, objectCollection, "attr", "fill", postColorFN);
        //console.dir(wheel.getColorArrays());
    };
    
    //Applies only one color to an object. Assumes, the color wheel used was 'singleColor',
    //otherwise this will fail and undefined will be set as the color.
    var applySingleColorToRaphObj = function(objectCollection, propertyToColor, postColorFN){
        var collectionSize = objectCollection.length;
        for(var i = 0; i < collectionSize; i++){
            var item = objectCollection[i];
            item.attr(propertyToColor, hexColor);
            if (postColorFN){postColorFN(item)};
        }
    };
    
    var colorRaphStrokes = function(objectCollection, postColorFN){
        if (r_colorWheel === 'singleColor'){
            applySingleColorToRaphObj(objectCollection, "stroke", postColorFN);
            return;
        }
        var wheel = getColorWheel(r_colorWheel,objectCollection.length, options);
        applyColors(wheel, objectCollection, "attr", "stroke", postColorFN);
    }

    //Taken from http://stackoverflow.com/a/12380392
    //by Nicolas Gauthier.
    //Very overkill, but eh, it is kinda cute.
    var getFunctionFromString = function(string, scope) {
        //This modification should let this work in node.js probably.
        var scope = scope || window || global;
        var scopeSplit = string.split('.');
        for (var i = 0; i < scopeSplit.length - 1; i++) {
            scope = scope[scopeSplit[i]];
            if (scope == undefined) return;
        }

        //console.log("returning function for " + string);
        return scope[scopeSplit[scopeSplit.length - 1]];
    };

    return {
        getHeight : function() { return r_height},
        getWidth : function() { return r_width},
        getOrientation : function() { return r_startingOrientation },
        colorFill : colorRaphObjects,
        colorStroke : colorRaphStrokes,
        getOneColor : r_getColor
    };
}



