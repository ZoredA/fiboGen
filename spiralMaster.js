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
    options.setDefault('gradientType', 'radial');
    options.setDefault('spreadMethod', 'reflect');
    if (options.gradientType === 'radial'){
        options.setDefault('cx', '50%');
        options.setDefault('cy', '50%');
        options.setDefault('r', '50%');
        options.setDefault('fy', '0%');
        options.setDefault('fx', '0%');
        
    }
    var r_spiralWheel = options.spiralWheel;
    var r_spiralStartColor = options.spiralStartColor;
    var r_getColor;
    if (r_spiralWheel === 'singleColor'){
        r_getCurveColor = function(totalCount){return r_spiralStartColor;};
    }
    else{
        var spiralWheelObject;
        r_getColor = function(totalCount){
            if(!spiralWheelObject){
                spiralWheelObject = getColorWheel(r_spiralWheel, totalCount);
            }
            var colorToReturn =  spiralWheelObject.getHex();
            spiralWheelObject.advance();
            return colorToReturn;
        }
    }
    var r_width = options.width || 1000;
    var r_height = options.height || 1000;
    
    // In the absence of using random, we will just use defaults.
    var useRandom = options.useRandom || false;

    // Randomly generate the starting orientation.
    var r_startingOrientation = options.startingOrientation || 1;

    // Pick the color wheel to use.
    var r_colorWheel = options.colorWheel || "gradientWheel";

    // Randomly generate the starting colors.
    var r_startingRed = options.startingRed || options.startingColor || 10;
    var r_startingGreen = options.startingGreen || options.startingColor || 10;
    var r_startingBlue = options.startingBlue || options.startingColor || 10;

    // These are settings used in either
    // the linearIncreaseWheel or the
    // multiIncreaseWheel. Either the increaseFactor
    // will be used by itself, or individual values
    // will be specified.
    var r_increaseFactor = options.increaseFactor || 1.2;
    var r_redIncreaseFactor = options.redIncreaseFactor || options.IncreaseFactor || 1.2;
    var r_greenIncreaseFactor = options.greenIncreaseFactor || options.IncreaseFactor || 1.2;
    var r_blueIncreaseFactor = options.blueIncreaseFactor || options.IncreaseFactor || 1.2;

    // Randomly generate the ending colors.
    // Only applies to rangedLinearWheel.
    var r_finalRed = options.finalRed || options.finalColor || 230;
    var r_finalGreen = options.finalGreen || options.finalColor || 230;
    var r_finalBlue = options.finalBlue || options.finalColor || 230;

    // Randomly generate the gradient settings,
    // i.e. whether to go forward incrementally
    // and whether to go forward or backword.
    // See rangedLinearWheel for info.
    var r_equalIncrease;
    if (options.hasOwnProperty("equalIncrease")){
        r_equalIncrease = options.equalIncrease;
    }
    else{
        r_equalIncrease = false;
    }
    
    var r_backwords;
    if (options.hasOwnProperty("backwords")) {
        r_backwords = options.backwords;
    }
    else {
        r_backwords = false;
    }

    var NS = "http://www.w3.org/2000/svg";

    var createLinearGradient = function(hexList, elementToColor) {
        if (hexList.length == 1) {
            //The element only needs one color, no need to make a gradient
            //for it.
            elementToColor.attr({ fill : hexList[0] });
            return;
        }

        var gradientStr = "90-"+hexList[0];
        var percentIncrementRate = 100 / (hexList.length - 1);
        var currentPercent = percentIncrementRate;
        for(var i = 1; i < hexList.length-1; i++) {
            gradientStr = gradientStr + "-" + hexList[i] + ":" + currentPercent.toInt().toString();
            currentPercent += percentIncrementRate;
        }
        gradientStr = gradientStr + "-" + hexList.last().toString();
        elementToColor.attr({ fill : gradientStr});
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
        parentDefsNode.html = ''; //Clear any existing gradients.
        parentDefsNode.appendChild(radialNode);
        elementToColor.node.setAttribute("fill", "url(#" + radialNode.id + ")");
    }

    // Constructs and returns a color wheel that can be used to color stuff.
    var getColorWheel = function(colorWheelName, numberToColor, wheelOptions) {
        var wheel = getFunctionFromString(colorWheelName);
        if (wheel == undefined) {
            throw "Unable to find colorWheel with id: " + r_colorWheel;
        }
        options.setDefault('stepsRequired', numberToColor - 1);
        return wheel(options);
    }

    //A generic way to apply the color...in case we use a different library
    //thing.
    var applyColors = function(wheel, objectCollection, methodToCall, propertyToSet){
        var collectionSize = objectCollection.length;
        var svg = objectCollection[0].paper.canvas;
        var svgChildren = svg.childNodes;
        var defsNode;
        for (var i = 0; i < svgChildren.length; i++){
          var childNode = svgChildren[i];
          if (childNode.nodeName == "defs"){
            defsNode = childNode;
            break;
          }
        }
        if (r_colorWheel === "gradientWheel"){
            for(var i = 0; i < collectionSize; i++){
                var item = objectCollection[i];
                //var currentColor = wheel.getHex();
                //item.attr({fill : currentColor});
                //Why does this not work. ;_;
                //ourMethod = getFunctionFromString(methodToCall, item);
                //ourMethod.call(item, { propertyToSet : currentColor});
                //createRadialElementTag(defsNode, wheel.getHexList(), item);
                //createLinearGradient(wheel.getHexList(), item);
                if (options.gradientType === 'radial')
                {
                    createRadialElementTag(defsNode, wheel.getHexList(), item);    
                }
                else
                {
                    createLinearGradient(wheel.getHexList(), item);
                }
                
                wheel.advance();
            }
        }
        else{
            //var colors = wheel.getColorArrays().hexList;
            var item;
            for(var i = 0; i < collectionSize; i++){
                item = objectCollection[i];
                var temp = {};
                temp[propertyToSet] = wheel.getHex();
                getFunctionFromString(methodToCall, item).call(item, temp);
                console.log("Assigned color: " + wheel.getHex());
                // console.log("Advanced " + i.toString() + " times.");
                wheel.advance();
            }
            //console.dir(wheel.getColorArrays());
        }
        // console.dir(wheel.getColorArrays());
    }

    var colorRaphObjects = function(objectCollection){
        var wheel = getColorWheel(r_colorWheel,objectCollection.length, options);
        console.log("OBJECT SIZE");
        console.log(objectCollection.length);
        applyColors(wheel, objectCollection, "attr", "fill");
        //console.dir(wheel.getColorArrays());
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
        color : colorRaphObjects
    };
}



