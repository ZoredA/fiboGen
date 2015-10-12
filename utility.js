//This file contains stuff added to prototypes and what not for the sake of
//convenience.
//Most of these are taken from JavaScript The Good Parts by Douglas Crockford
//Originall I was using this to modify object.prototype and
//that broke jQuery (woops!), so I took a hint from here
//http://stackoverflow.com/a/5890983
Function.prototype.method = function (name, func) {
    if (!this.prototype[name]){
        //this.prototype[name] = func;
        //return this;
        Object.defineProperty(Object.prototype, name, {
            value : func,
            enumerable : false
        })
    }
};

Number.method('toInt', function() {
    return Math[this < 0 ? 'ceil' : 'floor'](this);
});

String.method('trim', function() {
    return this.replace(/^\s+|\s+$/g, '');
});

//This is such a good idea, why didn't I think of it.
//http://stackoverflow.com/a/12675966
Array.method('last', function() {
    return this[this.length-1];
});

//My own, so this one could be bad!
//This will take a list of array names that are
//part of this parent object and fill them to
//be the same size as the largest of the bunch.
//The value used for the fill will simply be the
//value present at the end of array.
Object.method('fillArrays', function(arrayNames) {
    var maxLength = 0;
    var arr;
    for (var i = 0; i < arrayNames.length; i++){
        arr = this[arrayNames[i]];
        if (arr.length > maxLength) {
            maxLength = arr.length;
        }
    }

    for (var i = 0; i < arrayNames.length; i++){
        arr = this[arrayNames[i]];

        if (arr.length < maxLength) {
            var fillValue = arr[arr.length - 1];
            while (arr.length < maxLength) {
                arr.push(fillValue);
            }
        }
    }
    return this;
});

//If a property is not defined, this will set a default.
//Similar to obj.property = opj.property || number
//but this guards against accidentally overwriting 0, false and null (not sure if the null part is wanted).
Object.method('setDefault', function(property, valueToSet){
    if (this[property] === undefined){
        this[property] = valueToSet;
    }
});
