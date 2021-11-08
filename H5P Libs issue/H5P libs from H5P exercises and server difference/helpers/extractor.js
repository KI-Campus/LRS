const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const agg = [
    {
        '$group': {
            '_id': '$metadata.preloadedDependencies',
            'count': {
                '$sum': 1
            }
        }
    }
];

var libs = {};

MongoClient.connect(
    'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (connectErr, client) {
        assert.equal(null, connectErr);
        const coll = client.db('h5p').collection('h5plibraries');
        coll.aggregate(agg, (cmdErr, result) => {
            assert.equal(null, cmdErr);
            for (let index = 0; index < result.length; index++) {
                const element = result[index];

                if (element.majorVersion) {
                    libs[element.machineName + "-" + element.majorVersion + '.' + element.minorVersion] = element;
                }

                if (element._id) {
                    for (let index2 = 0; index2 < element._id.length; index2++) {
                        const element2 = element._id[index2];
                        libs[element2.machineName + "-" + element2.majorVersion + '.' + element2.minorVersion] = element2;
                    }
                }

            }

            console.log(libs)
        });

        client.close();
    });

