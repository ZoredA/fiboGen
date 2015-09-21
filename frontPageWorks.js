//This file is in charge of doing the dynamic HTML formatting
//and figuring out what the user entered when they press run.
//This creates several colorMaster objects and passes them
//to spiral.js along with other options like height and width.
//This file also handles the dynamic changing of options
//from dropdown selections and what not. 

var FrontPageWorks = (function(){
    var masterOptions;
    
    var paper;
    var spiralObj;
    var toPNG = function(){
        if (!spiralObj){
            run();
        }
        spiralObj.makePNG(paper);
    }
    var run = function(){
        if (paper){
            paper.clear();
            paper.remove();
            //If the png image already happens to exist, we just hide it.
            //This doesn't get rid of the image content itself mind you.
            var imgTag = document.getElementById('myImg');
            imgTag.style.display= 'none';
        }
        
        var orientationValue;
        var spiralClockwise; //Is the spiral clockwise or counterclockwise.
        //From: http://stackoverflow.com/a/9618826
        var radios = document.getElementsByName('orientation');
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                orientationValue = radios[i].value;
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
        
        radios = document.getElementsByName('spDirection'); 
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                // spiralClockwise is true or false.
                spiralClockwise = (radios[i].value === 'CW');
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
        
        var height = parseInt(document.getElementById('height').value);
        var width = parseInt(document.getElementById('width').value);
        var spiralWidth = document.getElementById('curveStrokeWidth').value;
        var squareStrokeWidth = document.getElementById('squareStrokeWidth').value;
        
        var orientationToNumberMap = {
        A : spiralClockwise ? 1 : 5,
        B : spiralClockwise ? 2 : 6, 
        C : spiralClockwise ? 3 : 7,
        D : spiralClockwise ? 4 : 8,  
        };
        
        masterOptions = {
            height : height,
            width : width,
            startingOrientation : orientationToNumberMap[orientationValue],
            spiralWidth : spiralWidth,
            squareStrokeWidth : squareStrokeWidth
        };
        
        var spiralColorOptions = nabOptions('cus_');
        var squareStrokeOptions = nabOptions('sqs_');
        var squareColorOptions = nabOptions('sqf_');    
        
        masterOptions.spiralColor = spiralMaster(spiralColorOptions);
        masterOptions.squareStroke = spiralMaster(squareStrokeOptions);
        masterOptions.squareColor = spiralMaster(squareColorOptions);
        
        var sp = spiral();
        paper = sp.run(masterOptions);
        sp.createSpiral(paper);
        spiralObj = sp;
    };
    
    var nabOptions = function(idPrefix){
        var nabbedOptions = {};
        
        var dropDown = document.getElementById(idPrefix + 'wheelSelect');
        var selectedWheel = dropDown.options[dropDown.selectedIndex].value;
        var initialColors = hexToRgbObject(document.getElementById(idPrefix + 'initialColor').color.toString());
        var optionsNeeded =  wheelOptions.optionMap[selectedWheel];
    
        nabbedOptions.colorWheel = selectedWheel;
        nabbedOptions.startingRed = initialColors.red;
        nabbedOptions.startingGreen = initialColors.green;
        nabbedOptions.startingBlue = initialColors.blue;
    
        console.dir(nabbedOptions);
        if(wheelTypes.ranged.indexOf(selectedWheel) > -1){
            var finalColors = hexToRgbObject(document.getElementById(idPrefix + 'finalColor').color.toString());
            nabbedOptions.finalRed = finalColors.red;
            nabbedOptions.finalGreen = finalColors.green;
            nabbedOptions.finalBlue = finalColors.blue;
        }
        
        for (var i = 0; i < optionsNeeded.length; i++){
            var opt = document.getElementById(idPrefix + optionsNeeded[i]);
            if (opt.type === 'checkbox'){
                nabbedOptions[optionsNeeded[i]] = opt.checked;
            }
            else
            {
                if (opt.type === 'number')
                {
                nabbedOptions[optionsNeeded[i]] = parseInt(opt.value); 
                }
                else
                {
                    if(wheelOptions.options[optionsNeeded[i]].type === 'select'){
                        var selectValue = opt.options[opt.selectedIndex].value;
                        nabbedOptions[optionsNeeded[i]] = selectValue;
                        if (wheelOptions.options[optionsNeeded[i]].subOptions){
                            //This particular option has suboptions associated with it.
                            var subOptions = wheelOptions.options[optionsNeeded[i]].subOptions[selectValue];
                            for (var j = 0; j < subOptions.length; j++){
                                //Note subOption is an object like {name:.., type:..., value:...}
                                var subOption = subOptions[j];
                                nabbedOptions[subOption.name] = document.getElementById(idPrefix + subOption.name).value;
                            }
                        }
                    }
                    else
                    {
                        nabbedOptions[optionsNeeded[i]] = opt.value;    
                    }
                }
            }
        };
        return nabbedOptions;
    };
    
    var createParam = function(parent, optionID, optionDesc, idPrefix){
        if (optionDesc.type === 'select'){
            createDropdown(parent, idPrefix + optionID, optionDesc, idPrefix);
            return;
        }
        var newTextNode = document.createTextNode(optionDesc.name);
        var newNode = document.createElement('input');
        newNode.type = optionDesc.type;
        newNode.id = idPrefix + optionID;
        if (optionDesc.type === 'checkbox'){
            newNode.checked = optionDesc.checked;
        }
        else{
            newNode.value = optionDesc.value;
        }
        parent.appendChild(newTextNode);
        parent.appendChild(newNode);
        parent.appendChild(document.createElement('br'));
    }
    
    var subOptionHandler = function(parentDropdown, idPrefix){
        var subOptionDiv = document.getElementById(idPrefix + 'subOptions');
        subOptionDiv.innerHTML = '';
        //A bit ugly, but we get the original option name.
        var parentOption = parentDropdown.id.replace(idPrefix,'');
        var optionDesc = wheelOptions.options[parentOption];
        if(!optionDesc.subOptions){
            return false;
        }
        var selectedOption = parentDropdown.options[parentDropdown.selectedIndex].value;
        var requiredSubOptions = optionDesc.subOptions[selectedOption];
    
        for(var i = 0; i < requiredSubOptions.length; i++){
            createParam(subOptionDiv, requiredSubOptions[i].name, requiredSubOptions[i], idPrefix);
        }
        return false;
    }
    
    //This requires the id of the dropdown to be created, but also needs idPrefix 
    //as that value is then passed on to subOptionHandler.
    var createDropdown = function(parentElement, dropdownID, dropdownInfo, idPrefix ){
        var newDropdown = document.createElement('select');
        newDropdown.id = dropdownID;
        var options = dropdownInfo.values;
        for(var i = 0; i < options.length; i++){
            var newOption = document.createElement('option');
            newOption.value = options[i].value;
            newOption.text = options[i].name;
            newDropdown.appendChild(newOption);
            if (options[i].value === dropdownInfo.selected){
                newDropdown.options[i].selected = true;
            }
        };
        parentElement.html = '';
        parentElement.appendChild(newDropdown);
        //This onchange handler deals with suboptions, or options
        //required by an option. e.g. A radial gradient has different
        //attributes than a linear one.
        if(dropdownInfo.subOptions){
            newDropdown.onchange = function(){subOptionHandler(newDropdown, idPrefix)};
            subOptionHandler(newDropdown, idPrefix); //Call the sub handler, so they options are there from the get go.
        }
    };
    
    //An event handler attached to the dropdown letting a user select
    //a color wheel. This just changes a different div and adds in the required
    //options.
    var wheelChange = function(wDropdown, idPrefix){
        var selectedWheel = wDropdown.options[wDropdown.selectedIndex].value;
        var optionsNeeded =  wheelOptions.optionMap[selectedWheel];
        if (!optionsNeeded){
            alert("Unsupported wheel ended up in the dropdown. Check wheelOptions.optionMap");
            return;
        }
        var optionsDiv = document.getElementById(idPrefix + 'wheelOptions');
        optionsDiv.innerHTML = '';
        var subOptionsNeeded = false;
        for(var i = 0; i < optionsNeeded.length; i++){
            var optionDesc = wheelOptions.options[optionsNeeded[i]];
            createParam(optionsDiv, optionsNeeded[i], optionDesc, idPrefix);
            if (optionDesc.subOptions){
                subOptionsNeeded = true;
            }
        }
        if(wheelTypes.ranged.indexOf(selectedWheel) > -1){
            document.getElementById(idPrefix + 'endingColorDiv').style.display = 'block';
        }
        else{
            document.getElementById(idPrefix + 'endingColorDiv').style.display = 'none';
        }
        if (!subOptionsNeeded) {
            var subOptionDiv = document.getElementById(idPrefix + 'subOptions');
            subOptionDiv.innerHTML = '';
        }
    }
    
    // This function creates the little display showcasing starting orientations 
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
    
    // I am too lazy to figure this out properly, so
    // grunt work it is.
    var setupOrientationDisplay = function(){
        var p = Raphael(["orientationBox", 160, 200, {
            type: "rect",
            x: 10,
            y: 10,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 35,
            y: 10,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 10,
            y: 35,
            width: 50,
            height: 50,
            stroke: "#fff",
            fill: 'red'
        }, {
            type: "text",
            x: 35,
            y: 50,
            text: "A",
            fill: 'black',
            "font-size": 20  
        }, {
            type: "rect",
            x: 10,
            y: 150,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 35,
            y: 150,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 10,
            y: 100,
            width: 50,
            height: 50,
            stroke: "#fff",
            fill: 'red'
        }, {
            type: "text",
            x: 35,
            y: 130,
            text: "B",
            fill: 'black',
            "font-size": 20  
        }, {
            type: "rect",
            x: 80,
            y: 10,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 80,
            y: 35,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 105,
            y: 10,
            width: 50,
            height: 50,
            stroke: "#fff",
            fill: 'red'
        }, {
            type: "text",
            x: 115,
            y: 50,
            text: "C",
            fill: 'black',
            "font-size": 20  
        }, {
            type: "rect",
            x: 130,
            y: 100,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 130,
            y: 125,
            width: 25,
            height: 25,
            stroke: "#fff",
            fill: 'blue'
        }, {
            type: "rect",
            x: 80,
            y: 100,
            width: 50,
            height: 50,
            stroke: "#fff",
            fill: 'red'
        }, {
            type: "text",
            x: 115,
            y: 130,
            text: "D",
            fill: 'black',
            "font-size": 20  
        }]);
    };
    return{
        run : run,
        toPNG : toPNG,
        wheelChange : wheelChange,
        setupOrientationDisplay : setupOrientationDisplay
    }
})();