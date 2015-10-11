var wheelTypes = (function(){
    return {
        'ranged' : ['shortestRangedLinearWheel', 'rangedLinearWheel', 'gradientWheel'],
        'not ranged' : ['singleColor', 'multiIncreaseWheel', 'linearIncreaseWheel'],
        'no color' : ['imageWheel'],        
        'default' : 'rangedLinearWheel'
    }
})();

var wheelOptions = (function(){
    return {
        //This is only used by color list.
        listDelimiter : ';',
        options : {
            //Technically, colorStartNum is a property only colorMaster.js
            //cares about, but I am placing it here mostly out of laziness
            //and because it is sort of relevant.
            colorStartNum : {
                'type' : 'number',
                'value' : 4,
                'name' : 'Start at'
            },
            redIncreaseFactor : {
                'type' : 'number',
                'value' : 2,
                'name' : 'Red Increase Factor'
            },
            greenIncreaseFactor : {
                'type' : 'number',
                'value' : 2,
                'name' : 'Green Increase Factor'
            },
            blueIncreaseFactor : {
                'type' : 'number',
                'value' : 2,
                'name' : 'Blue Increase Factor'
            },
            equalIncrease : {
                'type' : 'checkbox',
                'checked' : false,
                'name' : 'Equal Increase'
            },
            backwords : {
                'type' : 'checkbox',
                'checked' : false,
                'name' : 'Go Backwords'
            },
            loop : {
                'type' : 'checkbox',
                'checked' : false,
                'name' : 'Loop'
            },
            colorList : {
                'type' : 'colorList',
                'value' : 'FFFFFF'
            },
            gradientStartIndex : {
                'type' : 'number',
                'value' : 3,
                'name' : 'Gradient Start Index'
            },
            gradientFuncExponent : {
                'type' : 'number',
                'value' : 1.618,
                'name' : 'Gradient Function Exponent'
            },
            gradientFuncConstant : {
                'type' : 'number',
                'value' : 0,
                'name' : 'Gradient Function Constant'
            },
            gradientDifference : {
                'type' : 'radio',
                'name' : 'gradDifferenceType',
                'selected' : 'start-current',
                'title' : 'Gradient Difference',
                'radios' : [{
                    'value' : 'current-next',
                    'title' : 'Current -> Next'   
                },{
                    'value' : 'start-current',
                    'title' : 'Start -> Current'   
                },{
                    'value' : 'current-end',
                    'title' : 'Current -> End'   
                },{
                    'value' : 'start-end',
                    'title' : 'Start -> End'   
                }]
            },
            gradientType : {
                'type' : 'select',
                'selected' : 'radial',
                'name' : 'Grad Type',
                'values' : [{
                    'value' : 'linear',
                    'name' : 'Linear'
                },{
                    'value' : 'radial',
                    'name' : 'Radial'
                }],
                'subOptions' : {
                    'linear' : [{
                        'value' : '0%',
                        'name' : 'x1',
                        'type' : 'text'
                    },{
                        'value' : '0%',
                        'name' : 'y1',
                        'type' : 'text'
                    },{
                        'value' : '100%',
                        'name' : 'x2',
                        'type' : 'text'
                    },{
                        'value' : '0%',
                        'name' : 'y2',
                        'type' : 'text'
                    }],
                    'radial' : [{
                        'value' : '50%',
                        'name' : 'cx',
                        'type' : 'text'
                    },{
                        'value' : '50%',
                        'name' : 'cy',
                        'type' : 'text'
                    },{
                        'value' : '50%',
                        'name' : 'r',
                        'type' : 'text'
                    },{
                        'value' : '0%',
                        'name' : 'fx',
                        'type' : 'text'
                    },{
                        'value' : '0%',
                        'name' : 'fy',
                        'type' : 'text'
                    }]
                }
            },
            spreadMethod : {
                'type' : 'select',
                'selected' : 'pad',
                'values' : [{
                    'value' : 'pad',
                    'name' : 'Pad'
                },{
                    'value' : 'reflect',
                    'name' : 'Reflect'
                },{
                    'value' : 'repeat',
                    'name' : 'Repeat'
                }],
                'name' : 'Spread Method'
            },
            rangedWheelToUse : {
                'type' : 'select',
                'selected' : 'rangedLinearWheel',
                'name' : 'Difference Wheel',
                'values' : [{
                    'value' : 'rangedLinearWheel',
                    'name' : 'Ranged Linear Wheel'
                },{
                    'value' : 'shortestRangedLinearWheel',
                    'name' : 'Shortest R Linear Wheel'
                }],
            },
        },
       optionMap : {
           'multiIncreaseWheel' : ['colorStartNum', 'redIncreaseFactor', 'greenIncreaseFactor', 'blueIncreaseFactor'],
           'linearIncreaseWheel' : ['colorStartNum', 'redIncreaseFactor', 'greenIncreaseFactor', 'blueIncreaseFactor'],
           'rangedLinearWheel' : ['colorStartNum', 'equalIncrease', 'backwords'],
           'gradientWheel' : ['colorStartNum', 'equalIncrease', 'backwords', 'gradientFuncExponent', 'gradientFuncConstant', 'rangedWheelToUse','gradientDifference','gradientType', 'spreadMethod'],
           'shortestRangedLinearWheel' : ['colorStartNum'],
           'singleColor' : ['colorStartNum'],
           'listWheel' : ['colorStartNum', 'loop', 'colorList']
       }
    };
})();

//This file deals with colors and helps us pick them.
//The code here internally operates with RGB values
//but can return a hex value.
//
//The color can be incremented via one of two ways:
//  -A start -> end, gradient based approach, so if you have
//  two colors and want the 15 in between them or something.
//
//  -A straight up, increase in the numbers via a multiplicative
//  factor. e.g. Every new color is the previous one multiplied 
//  by 1.61803398875.
//

var colorWheels = (function(){
    //This is like a prototype used by other wheels. It is useless on its own.
    var colorWheel = function(options) {
    
        options = options || {};
        
        //We set our starting colors if they weren't already provided. setDefault is
        //akin to options.startingRed = options.startingRed || default, but 
        //doesn't accidentally overwrite 0.
        options.setDefault('startingRed', 0);
        options.setDefault('startingGreen', 0);
        options.setDefault('startingBlue', 0);
        
        var currentRed = options.startingRed;
        var currentGreen = options.startingGreen;
        var currentBlue = options.startingBlue;
    
        var initialRed = currentRed;
        var initialGreen = currentGreen;
        var initialBlue = currentBlue;
    
        //This resets the wheel. It either resets to a starting
        //color value provided in the passed in options parameter
        //or it resets to the initial values that were set
        //when this object was made. Those values cannot be reset,
        //so it is better to just recreate the object if that is required.
        var resetCurrent = function(options) {
            options = options || {};
            options.setDefault('startingRed', initialRed);
            options.setDefault('startingGreen', initialGreen);
            options.setDefault('startingBlue', initialBlue);
            currentRed = options.startingRed;
            currentGreen = options.startingGreen;
            currentBlue = options.startingBlue;
        }
    
        var defaultGetNext = {
            getNextValue : function() {
                return { 
                    red : currentRed,
                    green : currentGreen,
                    blue : currentBlue };  
            }
        };
    
        //Returns a hexadecimal representation of the
        //current color.
        var getCurrentHex = function() {
            return rgbToHex(currentRed.toInt(), currentGreen.toInt(), currentBlue.toInt());
        }
    
        var getCurrentRgb = function() {
            return currentRed.toInt() + "," + currentGreen.toInt() + "," + currentBlue.toInt();
        }
    
        var setColors = function(colors){
            colors.setDefault('red', currentRed);
            colors.setDefault('green', currentGreen);
            colors.setDefault('blue', currentBlue);
            currentRed = colors.red;
            currentGreen = colors.green;
            currentBlue = colors.blue;
        }
    
        //Advances the wheel and returns a new color.
        var advanceCurrent = function() {
            var newColors = that.getNextValue();
            if (newColors.red > 255 || newColors.green > 255 || newColors.blue > 255 || 
                    newColors.red < 0 || newColors.green < 0 || newColors.blue < 0){
                newColors = {
                    red : getValidColor(newColors.red),
                    green : getValidColor(newColors.green),
                    blue : getValidColor(newColors.blue)
                };
            };
            
            currentRed = newColors.red;
            currentGreen = newColors.green;
            currentBlue = newColors.blue;
            return newColors;
        };
    
        //This function rolls over if necessary,
        //i.e. if any of the colors are above 255, this
        //will roll them over.
        //The color line should look a bit like:
        //0 1... 252 253 254 255 0 1 2 3 ... 255 0 1 2 3 .. 255
        var getValidColor = function(c) {
            if (c >= 0 && c < 256) {
                return c;
            }
            if (c > 255) {
                //Dumb micro optimization. Basically unless we
                //have to, I don't want to resort to a modulo.
                if (c < 512) {
                    //256 because 0 is valid.
                    return (c - 256);
                }
                else
                {
                    //There is a fast version of modulo:
                    //c & (256-1), but that gets rid of our decimal values
                    //and I'd rather not do that. We could do a subtracting
                    //loop instead of this, but I doubt this case will be
                    //encountered all that often.
                    return (c % 256);
                }
            }
            if (c >= -256) {
                return (256 + c);
            }
            //Should have been able to figure this out on my own, but
            //couldn't, so stole it:
            //http://stackoverflow.com/a/4587286
            //This should work for all cases, but hopefully won't get
            //used all that much.
            return ( ((c % 256) + 256) % 256 );
        };
    
        //By default, this parent object thing really does nothing.
        var that = {
            getNextValue : defaultGetNext,
            getRed : function() { return currentRed },
            getGreen : function() { return currentGreen },
            getBlue : function() { return currentBlue },
            advance : advanceCurrent,
            getHex : getCurrentHex,
            getRgb : getCurrentRgb,
            getValidColor : getValidColor,
            reset : resetCurrent,
            setColors : setColors
        };
    
        return that;
    }
    
    //This color wheel increases (or decreases) by multiplying a number
    //each time. The default is 1.1.
    var multiIncreaseWheel = function(options) {
        options = options || {};
        options.setDefault('redIncreaseFactor', 1.1);
        options.setDefault('greenIncreaseFactor', 1.1);
        options.setDefault('blueIncreaseFactor', 1.1);
        var redIncreaseFactor = options.redIncreaseFactor;
        var greenIncreaseFactor = options.greenIncreaseFactor;
        var blueIncreaseFactor = options.blueIncreaseFactor;
        // If the result of our multiplication is 0, then it needs to be replaced,
        // else the wheel will never advance. By default this is 2 (1 will take
        // quite a few turns to grow). If you set this to 0, you would probably suffer which
        // is why the || check exists. (Well, kind of, I realized later on that 0 is evaluated to false, so created setDefault, but
        // that useful function isn't needed here.)
        var zeroReplacement = options.zeroReplacement || 2;
    
        var that = colorWheel(options);
        var getNextMultiplicative = function() {
            return {
                // If any value is 0, i.e 0 * factor = 0, we return
                // the zeroReplacement number which is 2 by default.
                red : that.getRed() * redIncreaseFactor || zeroReplacement,
                green : that.getGreen() * greenIncreaseFactor || zeroReplacement,
                blue : that.getBlue() * blueIncreaseFactor || zeroReplacement
            };
        };
        that.getNextValue = getNextMultiplicative;
        return that;
    };
    
    //This will linearly increase the value by adding a set number.
    //Note the increase factor can be negative if desired.
    var linearIncreaseWheel = function(options) {
        options = options || {};
        
        options.setDefault('redIncreaseFactor', 5);
        options.setDefault('greenIncreaseFactor', 5);
        options.setDefault('blueIncreaseFactor', 5);
        var redIncreaseFactor = options.redIncreaseFactor;
        var greenIncreaseFactor = options.greenIncreaseFactor;
        var blueIncreaseFactor = options.blueIncreaseFactor;
    
        var that = colorWheel(options);
    
        var getNextLinear = function() {
            return {
                red : that.getRed() + redIncreaseFactor,
                green : that.getGreen() + greenIncreaseFactor,
                blue : that.getBlue() + blueIncreaseFactor
            };
        };
        that.getNextValue = getNextLinear;
        return that;
    };
    
    //A collection of common functions that ranged linear type wheels
    //can use. Not meant to be used on its own. A prototype in the general
    //sense of the word. NOT QUITE a JS prototype (as in this isn't assigned with an object.prototype expression).
    var rangedLinearPrototype = function(options) {
        var that = colorWheel(options);
        
        //If a final color is not provided, this assumes you wish to end at 255.
        options.setDefault('finalRed', 255);
        options.setDefault('finalGreen', 255);
        options.setDefault('finalBlue', 255);
        
        //Assumes we need a maximum of 20 colors if no number is provided. 
        //Note: This does not include the starting color, but does include
        //the ending color.
        options.stepsRequired = options.stepsRequired || 20;
        var stepsRequired = options.stepsRequired;
        
        //A helper function that populates our color arrays.
        var populateArray = function(arr, startingValue, endingValue, increaseRate, stepsRequired) {
            //Shouldn't happen, but just in case so we don't end up looping
            //forever.
            if (increaseRate === 0){
                arr.push(startingValue);
                return;
            }
            var currentValue = startingValue;
            while(arr.length < stepsRequired){
                arr.push(that.getValidColor(currentValue));
                currentValue += increaseRate;
            };
            //To make sure we don't get messed around with rounding
            //and floating point errors (we will be..), we set the final
            //value to be equal to the expected end value.
            arr[stepsRequired] = endingValue;
        };
        
        var redArray = [];
        var greenArray = [];
        var blueArray = [];
        
        that.redArray = redArray;
        that.greenArray = greenArray;
        that.blueArray = blueArray;
        
        var getColorArrays = function(){
            var redSize = redArray.length;
            var greenSize = greenArray.length;
            var blueSize = blueArray.length;
            var returnObj = {
                reds : redArray,
                greens : greenArray,
                blues : blueArray
            };
            if (redSize !== greenSize || greenSize !== blueSize){
                returnObj.fillArrays(['reds', 'greens', 'blues']);
            } 
            var hexList = [];
            for(var i = 0; i < greenSize; i++){
                hexList.push(rgbToHex(redArray[i].toInt(),greenArray[i].toInt(), blueArray[i].toInt()))
            }
            returnObj.hexList = hexList;
            return returnObj;
        };
        
        that.populateArray = populateArray;
        that.getColorArrays = getColorArrays;
        
        var currentIndex = 0;
        //Returns the next element in our array.
        //This is a bit confusing because we sorta support different array sizes
        //(the whole equal increase thing). 
        var advanceCurrent = function() {
            var newColors = {};
            var redSize = redArray.length;
            var greenSize = greenArray.length;
            var blueSize = blueArray.length;
            //If our index is already at the end, we simply
            //return the last color we have.
            if (currentIndex >= stepsRequired){
                //Note the _size variables are 1 less than length anyway
                //because they were assigned to stepsRequired which does not
                //include the starting color.
                newColors.red = redArray[redSize - 1];
                newColors.green = greenArray[greenSize - 1];
                newColors.blue = blueArray[blueSize - 1];
            }
            else {
                currentIndex += 1;
                newColors.red = (currentIndex < (redSize - 1)) ? redArray[currentIndex] : redArray[redSize - 1];
                newColors.green = (currentIndex < (greenSize - 1)) ? greenArray[currentIndex] : greenArray[greenSize - 1];
                newColors.blue = (currentIndex < (blueSize - 1)) ? blueArray[currentIndex] : blueArray[blueSize - 1];
            }
            that.setColors(newColors);
            return newColors;
        };
        that.advance = advanceCurrent;
        return that;
    };
    
    //This is like ranedLinearWheel, but sort of smarter. It decides
    //the direction for you, so the wheel isn't always moving forward or backword,
    //but in either direction depending on which side is closer and this direction
    //can vary from red to blue to green, so the colors could be moving in different
    //directions. This should theoretically help eliminate some of the jarring changes
    //that occur when the starting and ending rgb values are close.
    //This variant doesn't bother with the complicated equal increase or backwords options.
    var shortestRangedLinearWheel = function(options) {
        var that = rangedLinearPrototype(options);
    
        var startingRed = options.startingRed;
        var startingGreen = options.startingGreen;
        var startingBlue = options.startingBlue;
    
        var finalRed = options.finalRed;
        var finalGreen = options.finalGreen;
        var finalBlue = options.finalBlue;
    
        var stepsRequired = options.stepsRequired;
        var redArray = that.redArray;
        var greenArray = that.greenArray;
        var blueArray = that.blueArray;
    
        //A helper function that populates our color arrays.
        var populateArray = that.populateArray;
        
        //Returns the rate with which a color needs to increase. It will calculate how far it is from start
        //to finish in one direction and then in reverse as well. It picks the smaller of the two, divides it by
        //the number of steps required and returns it. If the color needs to go backwords (e.g. from 250 to 240),
        //the returned value will be negative.
        var getIncreaseRate = function(startingValue, endingValue, stepsRequired){
            var forwardDiff = (endingValue >= startingValue) ? (endingValue - startingValue) : (256 - startingValue + endingValue);
            var backwardDiff = (startingValue >= endingValue) ? (startingValue - endingValue) : (256 - endingValue + startingValue);
            if (backwardDiff < forwardDiff){
                return (backwardDiff / stepsRequired) * -1;
            }
            return (forwardDiff / stepsRequired);
        }
        var redIncreaseRate = getIncreaseRate(startingRed, finalRed, stepsRequired);
        var blueIncreaseRate = getIncreaseRate(startingBlue, finalBlue, stepsRequired);
        var greenIncreaseRate = getIncreaseRate(startingGreen, finalGreen, stepsRequired);
        populateArray(redArray, startingRed, finalRed, redIncreaseRate, stepsRequired);
        populateArray(greenArray, startingGreen, finalGreen, greenIncreaseRate, stepsRequired);
        populateArray(blueArray, startingBlue, finalBlue, blueIncreaseRate, stepsRequired);
        
        return that;
    }
    
    //This is a linear increasing gradient as well, but it figures out the values
    //for you given a start and end color.
    //A big difference between this one and the others is that this variant will
    //calculate all of the colors ahead of time and it can do this because it
    //has an end value in mind. When the end value is reached, it will only
    //continuously return the end value and won't advance further.
    var rangedLinearWheel = function(options) {
        var that = rangedLinearPrototype(options);
    
        var startingRed = options.startingRed;
        var startingGreen = options.startingGreen;
        var startingBlue = options.startingBlue;
    
        var finalRed = options.finalRed;
        var finalGreen = options.finalGreen;
        var finalBlue = options.finalBlue;
    
        var stepsRequired = options.stepsRequired;
    
        //If equalIncrease is set to true, then 
        //the colors move forward at the same rate, i.e. they increase by the same
        //amount as one another. This means that under most cases, some of the
        //values will arrive at their final color before the others.
        //e.g If going from r:50,g:50,b:50 to r:100,g:250,b:100, the red and blue
        //will hit their final values before green does and they will stay there.
        //If this is set to false, then each color will move proportionately to
        //their respective distance and should end up reaching the final values
        //at the same time.
        var equalIncrease;
        if (options.hasOwnProperty("equalIncrease")) {
            equalIncrease = options.equalIncrease;
        }
        else {
            equalIncrease = false;
        }
    
        //We can roll backwards as well as forwards, so...
        var backwords;
        if (options.hasOwnProperty("backwords")) {
            backwords = options.backwords;
        }
        else {
            backwords = false;
        }
    
        var redArray = that.redArray;
        var greenArray = that.greenArray;
        var blueArray = that.blueArray;
    
        //A helper function that populates our color arrays.
        var populateArray = that.populateArray;
    
        var redDiff, greenDiff, blueDiff;
        if (!backwords){
            redDiff = (finalRed >= startingRed) ? (finalRed - startingRed) : (256-startingRed+finalRed); 
            greenDiff = (finalGreen >= startingGreen) ? (finalGreen - startingGreen) : (256-startingGreen+finalGreen); 
            blueDiff = (finalBlue >=startingBlue) ? (finalBlue - startingBlue) : (256-startingBlue+finalBlue); 
        }
        else{
            redDiff = (startingRed >= finalRed) ? (startingRed - finalRed) : (256 - finalRed + startingRed); 
            greenDiff = (startingGreen >= finalGreen) ? (startingGreen - finalGreen) : (256 - finalGreen + startingGreen); 
            blueDiff = (startingBlue >= finalBlue) ? (startingBlue - finalBlue) : (256 - finalBlue + startingBlue); 
        }
    
        if (equalIncrease){
            var maxDiff = Math.max(redDiff, greenDiff, blueDiff);
            var incrementRate = maxDiff / stepsRequired;
    
            var numberOfRed = redDiff / incrementRate;
            var numberOfGreen = greenDiff / incrementRate;
            var numberOfBlue = blueDiff / incrementRate;
    
            if (backwords) {
                incrementRate = -1 * incrementRate;
            }
    
            populateArray(redArray, startingRed, finalRed, incrementRate, Math.ceil(numberOfRed));
            populateArray(greenArray, startingGreen, finalGreen, incrementRate, Math.ceil(numberOfGreen));
            populateArray(blueArray, startingBlue, finalBlue, incrementRate, Math.ceil(numberOfBlue));
        }
        else {
            var redIncreaseRate, greenIncreaseRate, blueIncreaseRate;
            if (backwords) {
                redIncreaseRate = redDiff / stepsRequired * -1;
                greenIncreaseRate = greenDiff / stepsRequired * -1;
                blueIncreaseRate = blueDiff / stepsRequired * -1;
            }
            else {
                redIncreaseRate = redDiff / stepsRequired;
                greenIncreaseRate = greenDiff / stepsRequired;
                blueIncreaseRate = blueDiff / stepsRequired;
            }
            populateArray(redArray, startingRed, finalRed, redIncreaseRate, stepsRequired);
            populateArray(greenArray, startingGreen, finalGreen, greenIncreaseRate, stepsRequired);
            populateArray(blueArray, startingBlue, finalBlue, blueIncreaseRate, stepsRequired);
        }
        
        return that;
    }
    
    // The other color wheels return a single color at a time that can be used
    // to make a gradient. This one returns a gradient that can effectively
    // speaking be used to create a gradient of gradients.
    //
    var gradientWheel = function(options) {
        options.setDefault('gradientFuncExponent', 0);
        var gradientFuncExponent = options.gradientFuncExponent;
        
        options.setDefault('gradientFuncConstant', 1);
        //This gets used to determine how many colors the gradient will
        //have.
        var gradientFuncConstant = options.gradientFuncConstant;
        
        options.setDefault('rangedWheelToUse', 'rangedLinearWheel');
        var wheelToUse = options.rangedWheelToUse;
        var that;
        var wheelFunction;
        if (wheelToUse === 'rangedLinearWheel')
        {
            that = rangedLinearWheel(options);
            wheelFunction = rangedLinearWheel;
        }
        else
        {
            that = shortestRangedLinearWheel(options);
            wheelFunction = shortestRangedLinearWheel;
        }
        
        //This is the color set we start of with. We will generate gradients for
        //every pair of elements inside this object.
        //Note, this looks like :
        //{
        //  reds : [red1, red2, red3,...],
        //  greens : [green1, green2, green3,...],
        //  blues : [blue1, blue2, blue3,...]
        //}
        //Note: The above arrays aren't necessarily have to be the same size, so we
        //have to guard against that.
        var parentColorArrays = that.getColorArrays();

        var parentReds = parentColorArrays.reds;
        var parentGreens = parentColorArrays.greens;
        var parentBlues = parentColorArrays.blues;
    
        var redMaxIndex = parentReds.length - 1;
        var greenMaxIndex = parentGreens.length - 1;
        var blueMaxIndex = parentBlues.length - 1;
        var largestIndex = Math.max(redMaxIndex, greenMaxIndex, blueMaxIndex);
        
        //There are four different ways the gradientDifference can be assigned.
        //Initially, when this gradientWheel is made, it uses a rangedLinearWheel
        //to get starting colors. e.g. If we need to color 10 objects, rangedLinearWheel,
        //will create a collection of 10 colors (from start color to final color as set in options).
        //gradientWheel can then use this array of colors to create more in between colors.
        //This works as follows:
        //current-next: In this setting, a rangedLinearWheel color collection is generated for every adjacent
        //color. e.g. If the parent color is a bit like this:
        // [color1, color2, color3, color4, color5, color6], 
        // then gradientWheel, will make a collection a bit like
        // [
        //  [color1, color1.2, color1.4, color1.6, color1.8, color2]
        //  [color2, color2.2, color2.4, color2.6, color2.8, color3]
        // ...
        // ]
        // The decimal points are just to illustrate the changing number. The actual rate of change will likely be different.
        // Also note that the number of inbetween colors changes in accordance with gradientFuncConstant. 
        // So effectively speaking, you now have many more 'inbetween' colors. This means that the gradients made with this
        // setting are not very colorful (as the color changes are really minute).
        //
        // start-current: In this setting, the first color used will always be the start color and not the adjacent one.
        // so: for a parent collection like:
        // [color1, color2, color3, color4, color5, color6], 
        // you should get:
        // [
        //  [color1, color1.2, color1.4, color1.6, color1.8, color2]
        //  [color1, color1.4, color1.8, color2.2, color2.6, color3]
        // ...
        // ] 
        // 
        // current-end: The opposite of start-current. The first color will be changing, but the final color will always be constant.
        // [
        //  [color1, color2, color3, color4, color5, color6]
        //  [color2, color2.8, color3.6, color4.4, color5.2, color6]
        // ...
        // ] 
        // start-current and current-end should create more obvious gradients with the former becoming more obvious as the wheel advances
        // and the latter becoming less so.
        // 
        // start-end: Only creates a gradient between the start and end values. This will generally lead to the most obvious gradients.
        // [
        //  [color1, color2, color3, color4, color5, color6]
        //  [color1, color2, color3, color4, color5, color6]
        // ...
        // ] 
        // (Again, the size changes as the wheel progresses.)
        
        options.setDefault('gradientDifference', 'start-current');
    
        //This color array is going to be an array of 
        //rangedLinearWheel colorArrays.
        //[
        //  0 : {
        //      'reds' : [startingRed],
        //      'greens' : [startingGreen],
        //      'blues' : [startingBlue]
        //  },
        //  1 : {
        //      'reds' : [parentColorArray.reds[1] - parentColorArray.reds[0]],
        //      'greens' : [parentColorArray.greens[1] - parentColorArray.greens[0]],
        //      'blues' : [parentColorArray.blues[1] - parentColorArray.blues[0]],
        //  },...
        //  where subtraction is short form for the difference / numberOfColors
        //  required for that gradient.
        //  i.e. Each index after 0, is rangedLinearWheel( (i-1) -> (i) )
        //]
        var ourColorArray = [];
      
        //Colors Object should have startingRed,startingGreen, startingBlue
        //as well as finalRed,..., and stepsRequired.
        var getColorGradient = function(colorsObject){
            if (colorsObject.stepsRequired < 1) {
                return {
                    reds : [colorsObject.finalRed],
                    greens : [colorsObject.finalGreen],
                    blues : [colorsObject.finalBlue]
                }
            }
            var rWOptions = {};
            // We want to pass along any settings or what have you that
            // were passed into options, but don't want the original changed,
            // so we make something similar to a dirty clone. Fortunately
            // our object is simple, so this will work.
            // Note: Object.create likely won't work since rangedLinearColorWheel uses
            // hasOwnProperty.
            for (var attr in options) {
                if (options.hasOwnProperty(attr)){
                    rWOptions[attr] = options[attr];
                }
            };
    
            //The addition of gradientDifference is a bit hacky.
            //A lot of the computation for current-next is done
            //even when it is not required (like for other gradientDifferences)
            //as that was the only mode of operation
            //at first and changing it is not super easy.
            if(options.gradientDifference === 'start-current' || options.gradientDifference === 'start-end'){
                //The first value is the starting color.
                rWOptions.startingRed = options.startingRed;
                rWOptions.startingGreen = options.startingGreen;
                rWOptions.startingBlue = options.startingBlue;
            }
            else{
                rWOptions.startingRed = colorsObject.startingRed;
                rWOptions.startingGreen = colorsObject.startingGreen;
                rWOptions.startingBlue = colorsObject.startingBlue;
            }
            
            if(options.gradientDifference === 'current-next'){
                rWOptions.finalRed = colorsObject.finalRed;
                rWOptions.finalGreen = colorsObject.finalGreen;
                rWOptions.finalBlue = colorsObject.finalBlue;
            }
            else{
                 if(options.gradientDifference === 'start-current'){
                    rWOptions.finalRed = colorsObject.startingRed;
                    rWOptions.finalGreen = colorsObject.startingGreen;
                    rWOptions.finalBlue = colorsObject.startingBlue;
                 }
                 else{
                    rWOptions.finalRed = options.finalRed;
                    rWOptions.finalGreen = options.finalGreen;
                    rWOptions.finalBlue = options.finalBlue;
                 }
            }

            rWOptions.stepsRequired = colorsObject.stepsRequired;
    
            var rangedWheel = wheelFunction(rWOptions);
            var colorArrays = rangedWheel.getColorArrays();
            //Utility function found in utility.js.
            //This makes sure the end sizes will all be the same.
            colorArrays.fillArrays(['reds', 'greens', 'blues']);
            return colorArrays;
        }
    
        var count = 1;
        for (var i = 0; i <= largestIndex; i++){
            //var gradientSteps = Math.ceil(gradientFuncConstant * (count));
            var gradientSteps = Math.ceil( Math.pow(count, gradientFuncExponent) + gradientFuncConstant  );
            var colors = {
                startingRed : parentReds[i-1] || parentReds[redMaxIndex],
                startingGreen : parentGreens[i-1] || parentGreens[greenMaxIndex],
                startingBlue : parentBlues[i-1] || parentBlues[blueMaxIndex],
                finalRed : parentReds[i] || parentReds[redMaxIndex],
                finalGreen : parentGreens[i] || parentGreens[greenMaxIndex],
                finalBlue : parentBlues[i] || parentBlues[blueMaxIndex],
                stepsRequired : gradientSteps
            };
            count += 1;
            ourColorArray.push(getColorGradient(colors));
        };
    
        var currentIndex = 0;
        var currentValue = ourColorArray[0];
        var advanceGradient = function() {
            //returnValue is an object like so: 
            //{
            //  'reds' : [],
            //  'greens' : [],
            //  'blues' : []
            //}
            //All the arrays should be the same size for a given iteration.
    
            var returnValue = ourColorArray[currentIndex] || ourColorArray[ourColorArray.length - 1];
            currentValue = returnValue;
            if (currentIndex < largestIndex) {
                currentIndex ++;
            }
            //This will make it so calls to getRgb or getHex return
            //something sorta sensible, but really, one shouldn't use this
            //variant if they desire sensible RGB values.
            that.setColors({
                red:returnValue.reds.last(),
                green:returnValue.greens.last(),
                blue:returnValue.blues.last()
            });
            return returnValue;
        };
    
        that.advance = advanceGradient;
        that.getColorArrays = function(){
            return ourColorArray; 
        };
    
        //Now, this is where the fun begins.
        //This will return a list of hexadecimal values
        //that can be used to create a gradient. Note that
        //the size of the list will change as calls to advanceGradient are made.
        //It will start as a list of one and once gradientStartIndex is hit,
        //it will grow with gradientFuncConst * (a counter that likely starts at 2).
        var getCurrentHexList = function(){
            var reds = currentValue.reds;
            var greens = currentValue.greens;
            var blues = currentValue.blues;
            var length = reds.length; //All should be the same size.
            var hexList = []
            for (var i = 0; i < length; i++){
                hexList.push(rgbToHex(reds[i].toInt(), greens[i].toInt(), blues[i].toInt()));
            }
            return hexList;
        }
    
        that.getHexList = getCurrentHexList;
    
        return that; 
    };
    
    var listWheel = function(options){
        
        options = options || {};
        options.setDefault('startingRed', 255);
        options.setDefault('startingGreen', 255);
        options.setDefault('startingBlue', 255);
        
        options.setDefault('colorList', '#FFFFFF');
        options.setDefault('loop', false);
        
        var colorListStr = options.colorList;
        var colorList = colorListStr.split(wheelOptions.listDelimiter);
        var loop = options.loop;
        
        //These colors are returned if the loop option is turned off.
        //Basically the start color box used by other wheels is the
        //'default' color box for this one.
        var defaultColors = {
            red : options.startingRed,
            green : options.startingGreen,
            blue : options.startingBlue
        };
        var defaultHex = rgbToHex(defaultColors.red, defaultColors.green, defaultColors.blue);
        
        var currentIndex = 0;
        
        var getRgb = function(){
            //if something like a gradient or some other non hex value is in there,
            //this will fail.
            return hexToRgbObject(colorList[currentIndex]);
        };
        
        //This can and will return anything in the list including gradients and whatever else.
        var getHex = function(){
            if (currentIndex === colorList.length){
                if (loop){
                    return colorList[currentIndex - 1];
                }
                return defaultHex;
            }
            return colorList[currentIndex];
        };
        
        var advance = function(){
            if (currentIndex === colorList.length){
                //At the maximum index already.
                if (loop){
                    currentIndex = 0;
                    return getRgb();
                }
                return defaultColors;
            }
            currentIndex = currentIndex + 1;
            return getRgb();
        };
        
        var reset = function(){
            currentIndex = 0;
        }
        
        var that = {
            advance : advance,
            getHex : getHex,
            getRgb : getRgb,
            reset : reset
        };
        return that;
    };
    
    return {
        multiIncreaseWheel : multiIncreaseWheel,
        linearIncreaseWheel : linearIncreaseWheel,
        rangedLinearWheel : rangedLinearWheel,
        shortestRangedLinearWheel : shortestRangedLinearWheel,
        gradientWheel : gradientWheel,
        listWheel : listWheel
    }
})();


//http://stackoverflow.com/a/5624139
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

//http://stackoverflow.com/a/11508164
var hexToRgb = function(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}

var hexToRgbObject = function(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    
    return {
        red : r,
        green : g,
        blue : b
    };
}
