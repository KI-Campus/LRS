
'use strict';

const fs = require('fs');

let file = fs.readFileSync('diff of libs.json');
let objectArray = JSON.parse(file);




let newArray = [];
// Loop through each object in the object array
for (var i = 0; i < Object.keys(objectArray).length; i++) {
    var key = Object.keys(objectArray)[i];
    var value = objectArray[key];

    // Get the machine name from the object
    var machineName = value.machineName//.replace(".", "-");

    // In machine name, when there is a capital letter, place a dash before it, but ignore first three characters
    for (var j = 3; j < machineName.length; j++) {
        if (machineName[j] === machineName[j].toUpperCase()) {
            machineName = machineName.slice(0, j) + "-" + machineName.slice(j);
            j++;
        }
    }

    // In machine name, remove the -.
    machineName = machineName.replace("-.", "");




    //machineName = machineName.replace(/([A-Z])/g, function (g) { return "-" + g[0].toLowerCase(); });

    // Get the major version from the object
    var majorVersion = value.majorVersion;
    // Get the minor version from the object
    var minorVersion = value.minorVersion;
    // Create a new object with the machine name, major version and minor version
    var newObject = {
        "machineName": machineName,
        "majorVersion": majorVersion,
        "minorVersion": minorVersion
    };
    // Add the new object to the new array
    //newArray.push(newObject);
    // Generate url for downloading tag from github

    var url = `https://github.com/h5p/${machineName}/archive/refs/tags/${majorVersion}.${minorVersion}.0.zip`

    newArray.push(url);

    console.log(url)

}

console.log(newArray.length)