const fs = require("fs")
const { MongoClient } = require("mongodb");


// Mongo Config stuff
const MONGO_URL = "mongodb://localhost:27017";
const MONGO_DB = "h5p-ahmed-test";
const MONGO_COLLECTION = "h5plibraries"


const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });

async function connectMongo() {
    try {
        await client.connect();
        console.log("Native MongoDB Driver connected");
    } catch (err) {
        console.log("Error connecting to Mongo Server: ", err);
    }
}


// Reads the library.json file from subfolders and returns the parsed JSON object
function readLibraryJsonFile(path) {
    let libraryJson = fs.readFileSync(path + "/library.json", "utf8")
    return JSON.parse(libraryJson)
}

// Get all folders in the given path
function getFolders(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + "/" + file).isDirectory()
    })
}



// Add libraryJson to MongoDB
async function addLibraryJsonToMongoDB(libraryJson) {
    let obj = {}
    obj["_id"] = libraryJson.machineName + "-" + libraryJson.majorVersion + "." + libraryJson.minorVersion;
    obj["metadata"] = libraryJson;
    obj["additionalMetadata"] = { "restricted": false };


    await client.db(MONGO_DB).collection(MONGO_COLLECTION).insertOne(obj, { upsert: false, }, function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Inserted libraryJson: " + libraryJson.machineName);
        }
    });
}



async function start() {

    // Connect to MongoDB
    await connectMongo();


    let allFolders = getFolders("../__H5P diff libs downloaded");

    // Loop in allFolders array
    for (let i = 0; i < allFolders.length; i++) {
        let folder = allFolders[i];
        let path = "../__H5P diff libs downloaded/" + folder;
        let libraryJson = readLibraryJsonFile(path);

        // Add libraryJson to MongoDB
        await addLibraryJsonToMongoDB(libraryJson);

    }

    setTimeout(() => { client.close() }, 5000);

}


start();