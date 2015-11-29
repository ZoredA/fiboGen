// This file figures out the "random" or dynamic parts of the spiral wheel.
// It decides things like a starting orientation and the colors (which
// colors to start and end with, which direction should the gradient go), etc
// Note This file itself does not handle the random number generation.
// Accepts an options object that allows someone to override all of the
// randomness if desired. Useful for debugging and trying out stuff.
var colorMaster = function(options) {
    options = options || {};
    options.setDefault('spiralWheel', 'singleColor');
    options.setDefault('spiralStartColor', 'black');
    options.setDefault('colorWheel', 'singleColor');
    
    // Pick the color wheel to use.
    var r_colorWheel = options.colorWheel;
    if(r_colorWheel === 'gradientWheel'){
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
    
    var r_startingIndex = 0;
    options.setDefault('colorStartNum', 1);
    if (options.colorStartNum > 1){
        //Internally, we are dealing with arrays, so 
        //we need to subtract 1. Index should never be negative.
        r_startingIndex = options.colorStartNum - 1;
    }
    
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

    var r_startingOrientation = options.startingOrientation || 1;

    var NS = "http://www.w3.org/2000/svg";

    // An attempt at using Paper's built in gradients, but manually creating gradient tags
    // exposes a few other options. Though angles are easier to make here.
    // var createLinearGradient = function(hexList, elementToColor) {
    //     if (hexList.length == 1) {
    //         //The element only needs one color, no need to make a gradient
    //         //for it.
    //         elementToColor.attr({ fill : hexList[0] });
    //         return;
    //     }

    //     var gradientStr = "45-"+hexList[0];
    //     var percentIncrementRate = 100 / (hexList.length - 1);
    //     var currentPercent = 0;
    //     for(var i = 1; i < hexList.length-1; i++) {
    //         gradientStr = gradientStr + "-" + hexList[i] + ":" + currentPercent.toInt().toString();
    //         currentPercent += percentIncrementRate;
    //     }
    //     gradientStr = gradientStr + "-" + hexList.last().toString();
    //     elementToColor.attr({ fill : gradientStr});
    // };
    
    var createLinearElementTag = function(parentDefsNode, hexList, elementToColor, gradOptions){
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
        radialNode.setAttribute("x1", gradOptions.x1);
        radialNode.setAttribute("y1", gradOptions.y1);
        radialNode.setAttribute("x2", gradOptions.x2);
        radialNode.setAttribute("y2", gradOptions.y2);
        radialNode.setAttribute("spreadMethod", gradOptions.spreadMethod);
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
    
    //Expects the parentDef (child of SVG) and a hexList
    //that is returned by a call to gradientWheel's getHexList
    //function.
    var createRadialElementTag = function(parentDefsNode, hexList, elementToColor, gradOptions){
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
        radialNode.setAttribute("cx", gradOptions.cx);
        radialNode.setAttribute("cy", gradOptions.cy);
        radialNode.setAttribute("r", gradOptions.r);
        radialNode.setAttribute("fx", gradOptions.fx);
        radialNode.setAttribute("fy", gradOptions.fy);
        radialNode.setAttribute("spreadMethod", gradOptions.spreadMethod);

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
    
    //This accomplishes the same task as createRadialElementTag, but doesn't use
    //a list of hex colors to figure out what stops to create, rather it looks
    //for stops in a gradient string of the format:
    //‹colour›[-‹colour›[:‹offset›]]*-‹colour›. Basically like
    //http://raphaeljs.com/reference.html
    //Note: Inbetween colors without explicit offsets have their offsets interpolated.
    var createRadialElementTagFromString = function(parentDefsNode, gradString, elementToColor, gradOptions){
        var colorList = gradString.split('-');
        var numberOfColors = colorList.length;
        if (numberOfColors < 1){
            return ; //There is nothing we can do as no colors were provided.
        }
        var radialNode = document.createElementNS(NS, "radialGradient");
        //We assume the elements have a unique height. This should normally
        //be true.
        radialNode.id = "RGradient" + elementToColor.attrs.height;
        radialNode.setAttribute("cx", gradOptions.cx);
        radialNode.setAttribute("cy", gradOptions.cy);
        radialNode.setAttribute("r", gradOptions.r);
        radialNode.setAttribute("fx", gradOptions.fx);
        radialNode.setAttribute("fy", gradOptions.fy);
        radialNode.setAttribute("spreadMethod", gradOptions.spreadMethod);
        
        var colorObjects = colorList.map(function(cur, index, arr){
            var temp = cur.split(':');
            var color = temp[0];
            var offset = temp[1];
            if (!offset){
                return {
                    color : color
                };
            }
            return {
                color : color,
                offset : parseFloat(offset)
            };
        });
        
        //The first and last offsets aren't provided, so we add them.
        colorObjects[0].offset = 0;
        colorObjects[numberOfColors-1].offset = 100;
        
        //Interpolates the values for .offset between startingIndex and endingIndex.
		var fillUp = function(startingIndex, endingIndex){
            var previousIndex = startingIndex - 1;
			var previousValue = colorObjects[previousIndex].offset;
			var nextValue = colorObjects[endingIndex].offset;
			var incrementRate = (nextValue - previousValue)/(endingIndex - previousIndex);
			var currentValue = previousValue + incrementRate;
			for(var i = startingIndex; i < endingIndex; i++){
				colorObjects[i].offset = currentValue;
				currentValue = currentValue + incrementRate;
			}
		};
        
		var currentIndex = 1;
		while(currentIndex < numberOfColors){
			if(colorObjects[currentIndex].offset){
                currentIndex += 1;
				continue;
			}
			for(var j = currentIndex; j < numberOfColors; j++){
                if(colorObjects[j].offset){
                    fillUp(currentIndex, j);
                    currentIndex = j + 1;
                    break;
                }
            };
		};
        
        for(var i = 0; i < numberOfColors; i++) {
            var stopNode = document.createElementNS(NS, "stop");
            stopNode.setAttribute("offset", colorObjects[i].offset.toInt().toString() + "%");
            stopNode.setAttribute("stop-color", colorObjects[i].color);
            radialNode.appendChild(stopNode);
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
        if (numberToColor < options.colorStartNum){
            //If the user entered a strange value for the starting number,
            //we just set stepsRequired to 1 (the wheel will only make one color),
            //but the wheel will never actually be used because of the var i = r_startingIndex
            //in the applyColor loops.
            options.setDefault('stepsRequired', 1);    
        }
        else{
            options.setDefault('stepsRequired', numberToColor - 1 - r_startingIndex);    
        }
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
            for(var i = r_startingIndex; i < collectionSize; i++){
                item = objectCollection[i];
                if (options.gradientType === 'radial')
                {
                    createRadialElementTag(defsNode, wheel.getHexList(), item, options);    
                }
                else
                {
                    //createLinearGradient(wheel.getHexList(), item);
                    createLinearElementTag(defsNode, wheel.getHexList(), item, options);
                }
                wheel.advance();
                if (postColorFN){postColorFN(item)};
            };
        }
        else{
            for(var i = r_startingIndex; i < collectionSize; i++){
                item = objectCollection[i];
                var color = wheel.getHex().trim();
                if (color.charAt(0) === '{'){
                    createGradientFromJSON(defsNode, color, item);
                    wheel.advance();
                    continue;
                }
                var temp = {};
                temp[propertyToSet] = wheel.getHex();
                getFunctionFromString(methodToCall, item).call(item, temp);
                wheel.advance();
                if (postColorFN){postColorFN(item)};
            };
        }
    };
    
    var createGradientFromJSON = function(defsNode, jsonString, itemToColor){
        
        var gradObject = JSON.parse(jsonString);
        if((!(gradObject.initialColor && gradObject.finalColor)) && !gradObject.gradString){
            //If no coloring option is specified, we return.
            console.log("JSON object found, but no colors or grad string specified. Not coloring.");
            return;    
        }
        
        gradObject.setDefault('cx', '50%');
        gradObject.setDefault('cy', '50%');
        gradObject.setDefault('r', '50%');
        gradObject.setDefault('fy', '0%');
        gradObject.setDefault('fx', '0%');
        gradObject.setDefault('spreadMethod', 'pad');
        
        if(gradObject.initialColor){
            gradObject.setDefault('stepsRequired', 5);
            //Making sure that if stepsRequired was specified, we get an
            //int and not a string.
            gradObject.stepsRequired = parseInt(gradObject.stepsRequired);
            gradObject.setDefault('rangedWheelToUse', 'rangedLinearWheel');
            var rangedColorOptions = {};
            var hexStartColor = gradObject.initialColor.replace('#','');
            var hexEndColor = gradObject.finalColor.replace('#','');
            var rgbStart = hexToRgbObject(hexStartColor);
            var rgbEnd = hexToRgbObject(hexEndColor);
            rangedColorOptions.startingRed = rgbStart.red;
            rangedColorOptions.startingGreen = rgbStart.green;
            rangedColorOptions.startingBlue = rgbStart.blue;
            rangedColorOptions.finalRed = rgbEnd.red;
            rangedColorOptions.finalGreen = rgbEnd.green;
            rangedColorOptions.finalBlue = rgbEnd.blue;
            rangedColorOptions.stepsRequired = gradObject.stepsRequired;
            
            var wheel = colorWheels[gradObject.rangedWheelToUse](rangedColorOptions);
            //If the wheel specified in the JSON blob isn't a ranged wheel,
            //this call here will fail. Please specify a ranged wheel such as 
            //rangedLinearWheel or shortestRangedLinearWheel.
            var colors = wheel.getColorArrays().hexList;
            createRadialElementTag(defsNode, colors, itemToColor, gradObject);
        }
        else{
            createRadialElementTagFromString(defsNode, gradObject.gradString, itemToColor, gradObject);
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
        console.log("Number of Raphael objects:");
        console.log(objectCollection.length);
        applyColors(wheel, objectCollection, "attr", "fill", postColorFN);
        //console.dir(wheel.getColorArrays());
    };
    
    //Applies only one color to an object. Assumes, the color wheel used was 'singleColor',
    //otherwise this will fail and undefined will be set as the color.
    var applySingleColorToRaphObj = function(objectCollection, propertyToColor, postColorFN){
        var collectionSize = objectCollection.length;
        for(var i = r_startingIndex; i < collectionSize; i++){
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
        applyFill : colorRaphObjects,
        applyStroke : colorRaphStrokes,
        getOneColor : r_getColor
    };
};



