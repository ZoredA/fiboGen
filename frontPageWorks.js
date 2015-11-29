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
        
        masterOptions.spiralColor = colorMaster(spiralColorOptions);
        masterOptions.squareStroke = colorMaster(squareStrokeOptions);

        if(squareColorOptions.colorWheel === "imageWheel"){
            masterOptions.squareColor = undefined;
            masterOptions.useImages = true;
            masterOptions.imageOptions = squareColorOptions;
        }
        else{
            masterOptions.squareColor = colorMaster(squareColorOptions);    
        }
        
        var sp = spiral();
        paper = sp.run(masterOptions);
        sp.createSpiral(paper);
        spiralObj = sp;
    };
    
    var nabSelectedRadio = function(radioName){
        //From: http://stackoverflow.com/a/9618826
        var radios = document.getElementsByName(radioName);
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                 // only one radio can be logically checked, don't check the rest
                return radios[i].value;
            }
        }
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
    
        if(wheelTypes.ranged.indexOf(selectedWheel) > -1){
            var finalColors = hexToRgbObject(document.getElementById(idPrefix + 'finalColor').color.toString());
            nabbedOptions.finalRed = finalColors.red;
            nabbedOptions.finalGreen = finalColors.green;
            nabbedOptions.finalBlue = finalColors.blue;
        }
        
        for (var i = 0; i < optionsNeeded.length; i++){
            var optionName = optionsNeeded[i];
            var requiredType = wheelOptions.options[optionName].type;
            if(requiredType === 'radio')
            {
                nabbedOptions[optionName] = nabSelectedRadio(wheelOptions.options[optionsNeeded[i]].name);
                continue;
            }
            //This one is actually checking a non-DOM type. In theory, we could check for DOM type: input,
            //but that would imply that all input types are used as fileLists and we don't know yet if that will 
            //always be true.
            if(requiredType === 'fileList'){
                //Reference for URL creation: http://stackoverflow.com/a/24818245
                var tempList = []; //This will be a list of URLs.
                var fileList = fileObjects[idPrefix + optionName];
                for (var j = 0; j < fileList.length; j++){
                    tempList.push(URL.createObjectURL(fileList[j]));
                };
                //URL.createObjectURL(event.target.files[0]));
                nabbedOptions[optionName] = tempList;
                console.log("Nabbing list~");
                //console.dir(fileObjects);
                continue;
            }
            
            var opt = document.getElementById(idPrefix + optionName);
            //Technically, we could check requiredType instead, but meh.
            //(The difference is that requiredType comes from our predefined wheelOptions object,
            //opt.type is looking at DOM types. This works in this case, but doesn't for all options. The reverse
            //would work here, but eh, it shouldn't matter much either way, and well this is
            //how it was originally written before I realized not all DOM types are easy to handle (e.g. dropdowns).
            if (opt.type === 'checkbox'){
                nabbedOptions[optionName] = opt.checked;
                continue;
            }
            if (opt.type === 'number')
            {
                nabbedOptions[optionName] = parseFloat(opt.value);
                continue; 
            }
            //This one isn't quite a DOM type check. 
            if(requiredType === 'select')
            {
                var selectValue = opt.options[opt.selectedIndex].value;
                nabbedOptions[optionName] = selectValue;
                if (wheelOptions.options[optionName].subOptions){
                    //This particular option has suboptions associated with it.
                    var subOptions = wheelOptions.options[optionName].subOptions[selectValue];
                    for (var j = 0; j < subOptions.length; j++){
                        //Note subOption is an object like {name:.., type:..., value:...}
                        var subOption = subOptions[j];
                        nabbedOptions[subOption.name] = document.getElementById(idPrefix + subOption.name).value;
                    }
                }
            }
            else
            {
                nabbedOptions[optionName] = opt.value;    
            }
        };
        console.dir(nabbedOptions);
        return nabbedOptions;
    };
    
    var createColorList = function(parent, optionID, optionDesc, idPrefix){
        var listDiv = document.createElement('div');
        listDiv.className = "colorListLabel";
        
        var colorInput = document.createElement('input');
        colorInput.id = idPrefix + "listAddColor";
        var picker = new jscolor.color(colorInput, {})
        picker.fromString(optionDesc.value);
        
        var button = document.createElement('button');
        button.appendChild(document.createTextNode('->'));

        var textArea = document.createElement('textarea');
        textArea.id = idPrefix + optionID;
        
        button.onclick = function(){
            if (textArea.value){
                textArea.value =  textArea.value + wheelOptions.listDelimiter + "#" + colorInput.value;    
            }
            else{
                textArea.value =  '#' + colorInput.value;
            }
        };
        
        listDiv.appendChild(colorInput);
        listDiv.appendChild(button);
        listDiv.appendChild(textArea);
        parent.appendChild(listDiv);
    };
    
    //This will contain all of the urls created by creatURL for any images
    //that this generator will use as backgrounds.
    //Maps like ['optionID'] = [urlList]
    var fileObjects = {};
    //Reference: http://www.html5rocks.com/en/tutorials/file/dndfiles/
    var createFileList = function(parent, optionID, optionDesc, idPrefix){
        var listDiv = document.createElement('div');
        listDiv.className = "fileListLabel";
        var fileButton = document.createElement('input');
        fileButton.type = "file";
        fileButton.name = "files[]";
        fileButton.multiple = true;
        fileButton.id = idPrefix + optionDesc.name;
        
        listDiv.appendChild(fileButton);
        parent.appendChild(listDiv);
        //We store the file objects in a global list. We will turn them
        //into temporary URLs later on.
        //Reference for URL creation: http://stackoverflow.com/a/24818245
        fileButton.onchange = function(evt){
            var files = evt.target.files;
            var outputList = [];
            for(var i = 0; i < files.length; i++){
                outputList.push(files[i]);
            }
            console.log("Button event fired~");
            console.dir(outputList);
            fileObjects[idPrefix + optionID] = outputList;
        }
    };
    
    var createRadios = function(parent, optionDesc, idPrefix){
        var radioDiv = document.createElement('div');
        radioDiv.id = idPrefix + optionDesc.name;
        radioDiv.className = "radioDiv";
        var newTextNode = document.createTextNode(optionDesc.title);
        var newTitleDiv = document.createElement('div');
        newTitleDiv.appendChild(newTextNode);
        newTitleDiv.className = "subTitle";
        parent.appendChild(radioDiv);
        radioDiv.appendChild(newTitleDiv);
        var radiosRequired = optionDesc.radios;
        var selectedRadio = optionDesc.selected;
        for(var i = 0; i < radiosRequired.length; i++){
            var newNode = document.createElement('input');
            newNode.type = 'radio';
            newNode.name = optionDesc.name;
            newNode.value = radiosRequired[i].value;
            newNode.id = idPrefix + radiosRequired[i].value;
            
            if(newNode.value === selectedRadio){
                newNode.checked = true; 
            }
            
            var newLabelNode = document.createElement('label');
            newLabelNode.htmlFor = idPrefix + radiosRequired[i].value;
            newLabelNode.appendChild(document.createTextNode(radiosRequired[i].title));
            
            var newDiv = document.createElement('div');
            newDiv.className = "labelInputPair";
            newDiv.appendChild(newLabelNode);
            newDiv.appendChild(newNode);
            
            radioDiv.appendChild(newDiv);
        };
    }
    
    var createParam = function(parent, optionID, optionDesc, idPrefix){
        if (optionDesc.type === 'select'){
            createDropdown(parent, optionID, optionDesc, idPrefix);
            return;
        }
        if (optionDesc.type === 'radio'){
            createRadios(parent, optionDesc, idPrefix);
            return;
        }
        if (optionDesc.type === 'colorList'){
            createColorList(parent, optionID, optionDesc, idPrefix);
            return;
        }
        if (optionDesc.type === 'fileList'){
            createFileList(parent, optionID, optionDesc, idPrefix);
            return;
        }
        var newLabel = document.createElement('label');
        var newTextNode = document.createTextNode(optionDesc.name);
        newLabel.appendChild(newTextNode);
        newLabel.htmlFor = idPrefix + optionID;
        
        var newNode = document.createElement('input');
        newNode.type = optionDesc.type;
        newNode.id = idPrefix + optionID;
        if (optionDesc.type === 'checkbox'){
            newNode.checked = optionDesc.checked;
        }
        else{
            newNode.value = optionDesc.value;
        }
        
        var newDiv = document.createElement('div');
        newDiv.className = "labelInputPair";
        newDiv.appendChild(newLabel);
        newDiv.appendChild(newNode);
        parent.appendChild(newDiv);
        //parent.appendChild(document.createElement('br'));
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
        var dropdownDiv = document.createElement('div');
        dropdownDiv.className = "labelInputPair";
        
        var dropdownLabel = document.createElement('label');
        dropdownLabel.appendChild(document.createTextNode(dropdownInfo.name));
        dropdownLabel.htmlFor = idPrefix + dropdownID;
        
        var newDropdown = document.createElement('select');
        newDropdown.id = idPrefix + dropdownID;
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
        
        dropdownDiv.appendChild(dropdownLabel);
        dropdownDiv.appendChild(newDropdown);
        
        parentElement.appendChild(dropdownDiv);
        //This onchange handler deals with suboptions, or options
        //required by an option. e.g. A radial gradient has different
        //attributes than a linear one.
        if(dropdownInfo.subOptions){
            newDropdown.onchange = function(){subOptionHandler(newDropdown, idPrefix)};
            subOptionHandler(newDropdown, idPrefix); //Call the sub handler, so the options are there from the get go.
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
