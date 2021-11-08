const fs = require('fs');
function getObjectsDifference(obj1, obj2) {
    var diff = {};
    // for (var key in obj1) {
    //     if (obj1.hasOwnProperty(key) && !obj2.hasOwnProperty(key)) {
    //         diff[key] = obj1[key];
    //     }
    // }
    for (var key in obj2) {
        if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
            diff[key] = obj2[key];
        }
    }
    return diff;
}


let file1 = fs.readFileSync('libs at server.json');
let a_libsAtServer = JSON.parse(file1);


let file2 = fs.readFileSync('libs from exercises.json');
let b_libsAtExercises = JSON.parse(file2);


let result = getObjectsDifference(a_libsAtServer, b_libsAtExercises);


console.log(result);
