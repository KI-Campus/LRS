const express = require("express");
const jwtAuthz = require("express-jwt-authz");
const router = express.Router();

let jwtScopeOptions = {
    failWithError: true,
    customScopeKey: "role",
};

var m_client;

module.exports = { router, init };


function init(mongoClient) {
    m_client = mongoClient;
}

// Check for user access
router.use("/courses", checkUserAccess);
router.use("/course/:id", checkUserAccess);
router.use("/exercises", checkUserAccess);
router.use("/exercise/:id", checkUserAccess);

// openLRS routes
router.get("/stats", getStats);
router.get("/courses", getCourses);
router.get("/course/:id", getCourse);
router.get("/exercises", getExercises);
router.get("/exercise/:id", getExercise);


async function checkUserAccess(req, res, next) {
    req.query.consumer ? consumer = req.body.consumer : consumer = "all";
    req.query.courseId ? courseId = req.body.courseId : courseId = "all";

    let hasConsumerAccess = false;
    // Check in the user collection mongodb if consumerAccess array includes consumer
    await m_client.db().collection("users").findOne({ email: req.user.email }, (err, resultUser) => {
        if (err) {
            console.log("Error while getting records", err);
            res.status(500).end();
            return;
        }
        else {
            if (resultUser.consumersAccess.includes(req.body.consumer) || resultUser.role == "admin") {

                hasConsumerAccess = true;

                next();

            }
            else {
                console.log("User " + req.user.email + " does not have access to consumer: ", req.body.consumer);
                res.status(403).end();
                return;
            }
        }
    });




}

async function getStats(req, res, next) {

    let result = {};

    try {
        // Get total records
        let totalRecordsPipeline =
            [
                {
                    "$count": "totalRecords"
                }
            ]


        let totalRecords = await m_client.db().collection("records").aggregate(totalRecordsPipeline).toArray();
        result.totalRecords = totalRecords[0].totalRecords;

        // Get total submissions
        let totalSubmissionsPipeline =
            [
                {
                    "$match": {

                        "$or": [
                            {
                                "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed"
                            },
                            {
                                "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered"
                            }
                        ]
                    }
                },

                {
                    "$count": "totalSubmissions"
                }


            ]

        let totalSubmissions = await m_client.db().collection("records").aggregate(totalSubmissionsPipeline).toArray();
        result.totalSubmissions = totalSubmissions[0].totalSubmissions;

        // Get total exercise types
        let totalExerciseTypesPipeline = [
            {
                "$group": {
                    "_id": "$xAPI.context.contextActivities.category.id"
                }
            },
            {
                "$count": "exerciseTypes"
            }
        ]
        let totalExerciseTypes = await m_client.db().collection("records").aggregate(totalExerciseTypesPipeline).toArray();
        result.exerciseTypes = totalExerciseTypes[0].exerciseTypes;


        // Get total consumers
        let totalConsumersPipeline = [
            {
                "$group": {
                    "_id": "$metadata.session.custom_consumer"
                }
            },
            {
                "$count": "totalConsumers"
            }
        ]
        let totalConsumers = await m_client.db().collection("records").aggregate(totalConsumersPipeline).toArray();
        result.totalConsumers = totalConsumers[0].totalConsumers;

        // Get total passing exercises
        let totalPassingExercisesPipeline = [
            {
                "$match": {
                    "xAPI.result.success": true,
                    "$or": [
                        {
                            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed"
                        },
                        {
                            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered"
                        }
                    ]
                }
            },

            {
                "$group": { "_id": "$xAPI.verb.results", "count": { "$sum": 1 } }
            },

            {
                "$sort": {
                    "_id": 1
                }
            }
        ]

        let totalPassingExercises = await m_client.db().collection("records").aggregate(totalPassingExercisesPipeline).toArray();
        result.totalPassingExercises = totalPassingExercises[0].count;


        res.status(200).send({ result }).end();


    }
    catch (err) {
        console.log("Error while getting stats", err);
        res.status(500).end();
    }

}

async function getCourses(req, res, next) {
    let pipeline =
        [
            {
                "$group": {
                    "_id": "$metadata.session.context_id",
                    "title": { "$first": "$metadata.session.context_title" },
                    "consumer": { "$first": "$metadata.session.custom_consumer" }
                }
            },
            {
                "$sort": { "_id": 1 }
            },
        ]
    let courseId = req.query.courseId ? req.query.courseId : "all";
    let consumer = req.query.consumer ? req.query.consumer : "all";
    if (courseId != "all") {
        pipeline.unshift({
            "$match": {
                "metadata.session.context_id": courseId
            }
        })
    }
    if (consumer != "all") {
        pipeline.unshift({
            "$match": {
                "metadata.session.custom_consumer": consumer
            }
        })
    }

    try {

        m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(pipeline).toArray(function (err, result) {
            if (err) {
                console.log("Error while Aggregating: ", err);
                console.log("Pipeline: ", pipeline);
                res.status(500).end();
            }
            else {

                res.status(200).send({ result }).end();
            }
        });
    }
    catch (err) {
        console.log("Error while aggregating records", err);
        console.log("Pipeline was: ", pipeline);
        res.status(500).end();
    }
}

async function getCourse(req, res, next) {

    let courseId = req.params.id ? req.params.id : undefined;

    if (!courseId) {
        res.status(400).send({ error: "Invalid courseId" }).end();
        return;
    }

    let pipeline =
        [
            {
                "$group": {
                    "_id": "$metadata.session.context_id",
                    "title": { "$first": "$metadata.session.context_title" },
                    "consumer": { "$first": "$metadata.session.custom_consumer" }
                }
            },
            {
                "$match": {
                    "_id": courseId
                }
            }
        ]

    try {

        m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(pipeline).toArray(async function (err, result) {
            if (err) {
                console.log("Error while Aggregating: ", err);
                console.log("Pipeline: ", pipeline);
                res.status(500).end();
            }
            else {

                try {

                    let totalRecordsPipleline = [
                        {
                            "$match": {
                                "metadata.session.context_id": courseId
                            }
                        },

                        {
                            "$count": "totalRecords"
                        }
                    ]
                    let totalRecords = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(totalRecordsPipleline).toArray();
                    totalRecords = totalRecords[0]?.totalRecords;
                    // Push it into result
                    if (totalRecords) result[0].totalRecords = totalRecords;

                    let exerciseTypesPipeline = [
                        {
                            "$match": {
                                "metadata.session.context_id": courseId
                            }
                        },
                        {
                            "$group": {
                                "_id": "$xAPI.context.contextActivities.category.id"
                            }
                        },
                        {
                            "$count": "exerciseTypes"
                        }
                    ]
                    let exerciseTypes = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(exerciseTypesPipeline).toArray();
                    exerciseTypes = exerciseTypes[0]?.exerciseTypes;
                    // Push it into result
                    if (exerciseTypes) result[0].exerciseTypes = exerciseTypes;

                    let totalSubmissionsPipeline =
                        [
                            {
                                "$match": {
                                    "metadata.session.context_id": courseId
                                }
                            },
                            // Exclude sub exercises
                            {
                                "$match": {
                                    "xAPI.object.id": {
                                        "$regex": "^((?!subContentId).)*$"
                                    }
                                }
                            },

                            {
                                "$match": {
                                    "$or": [
                                        {
                                            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed"
                                        },
                                        {
                                            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered"
                                        }
                                    ]
                                }
                            },
                            {
                                "$count": "totalSubmissions"
                            }

                        ]

                    let totalSubmissions = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(totalSubmissionsPipeline).toArray();
                    totalSubmissions = totalSubmissions[0]?.totalSubmissions;
                    // Push it into result
                    if (totalSubmissions) result[0].totalSubmissions = totalSubmissions;

                    // Get exercises list
                    let exercisesPipeline = [
                        {
                            "$match": {
                                "metadata.session.context_id": courseId
                            }

                        },
                        {
                            "$match": {
                                "xAPI.object.id": {
                                    "$not": {
                                        "$regex": "subContentId"
                                    }
                                }
                            }
                        },
                        {
                            "$group": {
                                "_id": "$xAPI.object.id",
                                "title": {
                                    "$first": "$xAPI.object.definition.name.en-US"
                                },
                                "type": {
                                    "$first": "$xAPI.context.contextActivities.category.id"
                                }
                            }
                        },

                        {
                            "$sort": { "_id": 1 }
                        }
                    ]

                    let exercises = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(exercisesPipeline).toArray();
                    // Push it into result
                    if (exercises) result[0].exercises = exercises;

                    res.status(200).send({ result }).end();
                }
                catch (err) {
                    console.log("Error while getting course: ", err);
                    res.status(500).end();
                }
            }
        });
    }
    catch (err) {
        console.log("Error while aggregating records", err);
        console.log("Pipeline was: ", pipeline);
        res.status(500).end();
    }
}

async function getExercises(req, res, next) {

    let consumer = req.query.consumer ? req.query.consumer : "all";
    let courseId = req.query.course ? req.query.course : undefined;

    let ignoreSubExercises = req.query.ignoreSubExercises ? req.query.ignoreSubExercises : false;

    if (!courseId) {
        res.status(400).send({ error: "Invalid courseId" }).end();
        return;
    }
    try {

        let pipeline =
            [
                {
                    "$match": {
                        "metadata.session.context_id": courseId
                    }
                },
                {
                    "$group": {
                        "_id": "$xAPI.object.id",
                        "title": { "$first": "$xAPI.object.definition.name.en-US" },
                        "type": { "$first": "$xAPI.context.contextActivities.category.id" }
                    }
                },
                {
                    "$sort": { "_id": 1 }
                }

            ]

        if (consumer != "all") {
            pipeline.unshift({
                "$match": {
                    "metadata.session.custom_consumer": consumer
                }
            })
        }

        if (ignoreSubExercises) {
            pipeline.unshift({

                "$match": {
                    "xAPI.object.id": {
                        "$regex": "^((?!subContentId).)*$"
                    }
                }
            });
        }


        let exercises = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(pipeline).toArray();
        res.status(200).send({ result: exercises }).end();


    }
    catch (err) {
        console.log("Error while aggregating records", err);
        console.log("Pipeline was: ", pipeline);
        res.status(500).end();
    }

}

async function getExercise(req, res, next) {


    let exerciseId = req.params.id ? req.params.id : undefined;

    let includeAllRecords = req.query.includeAllRecords ? req.query.includeAllRecords : false;

    if (!exerciseId) {
        res.status(400).send({ error: "Invalid courseId or exerciseId" }).end();
        return;
    }
    try {
        let pipeline =
            [

                {
                    "$match": {
                        "xAPI.object.id": exerciseId
                    }
                },
                {
                    "$group": {
                        "_id": "$xAPI.object.id",
                        "title": { "$first": "$xAPI.object.definition.name.en-US" },
                        "type": { "$first": "$xAPI.context.contextActivities.category.id" }
                    }
                },
                {
                    "$sort": { "_id": 1 }
                }

            ]

        let exercise = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(pipeline).toArray();


        if (includeAllRecords) {
            let rawRecordsPipeline =
                [
                    {
                        "$match": {
                            "xAPI.object.id": exerciseId
                        }
                    }
                ];
            let rawRecords = await m_client.db().collection(process.env.MONGO_XAPI_COLLECTION).aggregate(rawRecordsPipeline).toArray();
            exercise[0].rawRecords = rawRecords;
        }



        res.status(200).send({ result: exercise }).end();

    }
    catch (err) {
        console.log("Error while aggregating records", err);
        console.log("Pipeline was: ", pipeline);
        res.status(500).end();
    }



}