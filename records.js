const express = require("express");
const jwtAuthz = require("express-jwt-authz");
const router = express.Router();
const fs = require("fs");

let jwtScopeOptions = {
  failWithError: false,
  customScopeKey: "role",
};

var m_client;

module.exports = { router, init };

function init(mongoClient) {
  m_client = mongoClient;
}

// Middleware check for user access
router.use("/course/:id", checkUserAccess);

router.use("/courseSubmissionsOverTime/:id", checkUserAccess);
router.use("/courseExerciseTypesAndCount/:id", checkUserAccess);
router.use("/download", checkUserAccess);

router.use("/exercises", checkUserAccess);
router.use("/exerciseDetails/:id", checkUserAccess);
router.use("/exerciseDetails/:id/:subExerciseId", checkUserAccess);
router.use("/exerciseSubmissionsOverTime/:id", checkUserAccess);
router.use("/exerciseSubmissionsOverTime/:id/:subExerciseId", checkUserAccess);
router.use("/mcqChart/:id", checkUserAccess);
router.use("/mcqChart/:id/:subExerciseId", checkUserAccess);

router.use("/actors", checkUserAccess);

router.use("/trueFalseChart/:id", checkUserAccess);
router.use("/trueFalseChart/:id/:subExerciseId", checkUserAccess);

// openLRS routes
router.get("/stats", jwtAuthz(["admin"], jwtScopeOptions), getStats);
router.get("/courses", getCourses);
router.get("/course/:id", getCourse);

router.get("/courseSubmissionsOverTime/:id", getCourseSubmissionsOverTime);
router.get("/courseExerciseTypesAndCount/:id", getCourseExerciseTypesAndCount);
router.get("/download", download);

router.get("/exercises", getExercises);
router.get("/exerciseDetails/:id", getExerciseDetails);
router.get("/exerciseDetails/:id/:subExerciseId", getExerciseDetails);
router.get("/exerciseSubmissionsOverTime/:id", getExerciseSubmissionsOverTime);
router.get(
  "/exerciseSubmissionsOverTime/:id/:subExerciseId",
  getExerciseSubmissionsOverTime
);
router.get("/mcqChart/:id", getMCQChart);
router.get("/mcqChart/:id/:subExerciseId", getMCQChart);

router.get("/trueFalseChart/:id", getTrueFalseChart);
router.get("/trueFalseChart/:id/:subExerciseId", getTrueFalseChart);

router.get("/actors", jwtAuthz(["admin"], jwtScopeOptions), getActors);

router.get(
  "/coursesAdmin",
  jwtAuthz(["admin"], jwtScopeOptions),
  getAllCoursesAdmin
);

async function checkUserAccess(req, res, next) {
  let consumer = req.query.consumer;
  let courseId = req.query.course ?? req.params.id;

  let hasAccess = false;
  // Fetch the user from the database
  await m_client
    .db()
    .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "users")
    .findOne({ email: req.user.email }, (err, resultUser) => {
      if (err) {
        console.log("Error while getting user records", err);
        res.status(500).end();
        return;
      } else {
        if (
          resultUser?.coursesAccess?.includes(
            consumer + "_courseId_" + courseId
          ) ||
          resultUser?.coursesAccess?.includes(consumer + "_courseId_*") ||
          resultUser?.role == "admin"
        ) {
          hasAccess = true;

          next();
        } else {
          console.log(
            "User " + req.user.email + " does not have access to: ",
            req.body.consumer + "_courseId_" + req.body.courseId
          );
          res.status(403).end();
          return;
        }
      }
    });
}

async function getStats(req, res, next) {
  // We need to return the following
  //   {
  //     "totalRecords": NUMBER,
  //     "totalSubmissions": NUMBER,
  //     "exerciseTypes": NUMBER,
  //     "totalConsumers": NUMBER,
  //     "totalConsumersList": [
  //         {
  //             "_id": null
  //         },
  //         {
  //             "_id": "SOME ID A"
  //         },
  //         {
  //             "_id": "SOME ID B"
  //         }
  //     ],
  //     "totalPassingExercises": NUMBER,
  //     "totalActorsCount": NUMBER,
  // }

  // Fetch all the collections in the database with the following format
  // process.env.MONGO_XAPI_COLLECTION_consumerId_<consumer>_courseId_*

  // Get all the collections
  let collections = await m_client.db().listCollections().toArray();

  // Filter out the collections
  let filteredCollections = collections.filter((collection) => {
    return collection.name.includes(
      process.env.MONGO_XAPI_COLLECTION + "_consumerId_"
    );
  });

  // Get the total consumers
  let totalConsumers = [];
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let consumerId = collection.name.split("_consumerId_")[1].split("_")[0];

    // Only push to collection if not present
    if (!totalConsumers.includes(consumerId)) totalConsumers.push(consumerId);
  }

  let totalConsumersArrayObject = [];
  for (let i = 0; i < totalConsumers.length; i++) {
    totalConsumersArrayObject.push({ _id: totalConsumers[i] });
  }

  // Get the total records
  let totalRecords = 0;
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let count = await m_client
      .db()
      .collection(collection.name)
      .countDocuments();
    totalRecords += count;
  }

  // Get the total submissions
  let totalSubmissions = 0;
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let count = await m_client
      .db()
      .collection(collection.name)
      .countDocuments({
        $or: [
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
          },
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
          },
        ],
      });
    totalSubmissions += count;
  }

  // Get the total exercise types
  let exerciseTypes = [];
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let types = await m_client
      .db()
      .collection(collection.name)
      .distinct("xAPI.context.contextActivities.category.id");
    exerciseTypes = exerciseTypes.concat(types);
  }
  // Filter out null values
  exerciseTypes = exerciseTypes.filter((type) => type != null);
  // Get unique values
  exerciseTypes = [...new Set(exerciseTypes)];

  // Get the total passing exercises
  let totalPassingExercises = 0;

  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let count = await m_client
      .db()
      .collection(collection.name)
      .countDocuments({
        "xAPI.result.success": true,
        $or: [
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
          },
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
          },
        ],
      });
    totalPassingExercises += count;
  }

  // Get the total actors count
  let totalActorsCount = 0;
  let totalActorsList = [];
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let returnedActors = await m_client
      .db()
      .collection(collection.name)
      .aggregate([
        {
          $group: {
            _id: "$xAPI.actor.name",
          },
        },
      ])
      .toArray();

    // Loop through returnedActors
    for (let i = 0; i < returnedActors.length; i++) {
      if (!totalActorsList.includes(returnedActors[i]._id))
        totalActorsList.push(returnedActors[i]._id);
    }
  }
  totalActorsCount = totalActorsList.length;

  // Return the result
  res.status(200).send({
    result: {
      totalRecords: totalRecords,
      totalSubmissions: totalSubmissions,
      exerciseTypes: exerciseTypes.length,
      totalConsumers: totalConsumers.length,
      totalConsumersList: totalConsumersArrayObject,
      totalPassingExercises: totalPassingExercises,
      totalActorsCount: totalActorsCount,
    },
  });
}

async function getCourses(req, res, next) {
  try {
    // Get all the collections
    let collections = await m_client.db().listCollections().toArray();

    // Filter out the collections
    let filteredCollections = collections.filter((collection) => {
      return collection.name.includes(
        process.env.MONGO_XAPI_COLLECTION + "_consumerId_"
      );
    });

    filteredCollections;

    let consumer = req.query.consumer ? req.query.consumer : "all";

    // filteredCollections has list of consumers like this format
    // [ 'process.env.MONGO_XAPI_COLLECTION_consumerId_<consumer>_courseId_123', 'process.env.MONGO_XAPI_COLLECTION_consumerId_<consumer>_courseId_456' ]

    // Extract courseIds from the req.totalConsumers
    // Create array of arrays. Each consumer has an array of courseIds
    let totalConsumers = {};
    for (let i = 0; i < filteredCollections.length; i++) {
      let collection = filteredCollections[i];
      let consumerId = collection.name.split("_consumerId_")[1].split("_")[0];
      let courseId = collection.name.split("_courseId_")[1];
      if (!totalConsumers[consumerId]) totalConsumers[consumerId] = [];
      totalConsumers[consumerId].push(courseId);
    }

    // Fetch current user
    let user = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "users")
      .findOne({ email: req.user.email });

    let collectionNamesToFetch = [];

    if (consumer != "all") {
      // Fetch all the courseId's for the consumer
      let courseIds = totalConsumers[consumer];
      // Loop through courseIds and push to collectionNamesToFetch
      for (let i = 0; i < courseIds?.length; i++) {
        if (
          user.coursesAccess.includes(consumer + "_courseId_" + courseIds[i]) ||
          user.role == "admin"
        ) {
          collectionNamesToFetch.push(
            process.env.MONGO_XAPI_COLLECTION +
              "_consumerId_" +
              consumer +
              "_courseId_" +
              courseIds[i]
          );
        }
      }
    } else {
      // Fetch all the courseId's for all consumers
      for (let consumerId in totalConsumers) {
        let courseIds = totalConsumers[consumerId];
        // Loop through courseIds and push to collectionNamesToFetch
        for (let i = 0; i < courseIds.length; i++) {
          if (
            user.coursesAccess.includes(
              consumerId + "_courseId_" + courseIds[i]
            ) ||
            user.role == "admin"
          ) {
            collectionNamesToFetch.push(
              process.env.MONGO_XAPI_COLLECTION +
                "_consumerId_" +
                consumerId +
                "_courseId_" +
                courseIds[i]
            );
          }
        }
      }
    }

    // For each collectionNamesToFetch, fetch the title and consumer
    let outputCourses = [];

    // Populate outputCourses like this from collectionNamesToFetch
    // [
    //   {
    //     _id: '123',
    //     title: '123',
    //     consumer: 'consumerId'
    //   },
    //   ... etc
    // ]

    for (let i = 0; i < collectionNamesToFetch.length; i++) {
      let collectionName = collectionNamesToFetch[i];
      let course = await m_client
        .db()
        .collection(collectionName)
        .find({})
        .sort({ _id: -1 })
        .limit(1)
        .toArray();

      let courseTitle = course[0]?.metadata?.session?.context_title ?? null;
      let courseConsumer =
        course[0]?.metadata?.session?.custom_consumer ?? null;

      outputCourses.push({
        _id: collectionName.split("_courseId_")[1],
        title: courseTitle,
        consumer: courseConsumer,
      });
    }

    // Sort the outputCourses by title
    outputCourses.sort((a, b) => {
      return a?.title?.localeCompare(b.title);
    });

    res.send({ result: outputCourses }).end();
  } catch (err) {
    console.log("Error while getting courses", err);
    res.status(500).end();
  }
}

async function getCourse(req, res, next) {
  let courseId = req.params.id;
  let consumerId = await getConsumerIdFromCourseId(courseId);

  if (!consumerId) {
    res.status(400).send({ error: "Invalid consumerId" }).end();
    return;
  }

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let pipeline = [
    {
      $group: {
        _id: "$metadata.session.context_id",
        title: { $last: "$metadata.session.context_title" },
        consumer: { $last: "$metadata.session.custom_consumer" },
      },
    },
    {
      $match: {
        _id: courseId,
      },
    },
  ];

  // Add filters to pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  try {
    m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumerId +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray(async function (err, result) {
        if (err) {
          console.log("Error while Aggregating: ", err);
          console.log("Pipeline: ", pipeline);
          res.status(500).end();
        } else {
          try {
            // Get total records in course
            let totalRecordsPipleline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },

              {
                $count: "totalRecords",
              },
            ];
            let totalRecords = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(totalRecordsPipleline)
              .toArray();
            totalRecords = totalRecords[0]?.totalRecords ?? 0;
            // Push it into result
            if (result[0]) result[0].totalRecords = totalRecords;

            // Get exercise types in course
            let exerciseTypesPipeline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },
              {
                $group: {
                  _id: "$xAPI.context.contextActivities.category.id",
                },
              },
              {
                $sort: { _id: 1 },
              },
            ];
            let exerciseTypes = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(exerciseTypesPipeline)
              .toArray();

            // Push it into result
            if (result[0]) result[0].exerciseTypes = exerciseTypes.length;
            // Loop through exercise types and get only the id
            if (result[0])
              result[0].exerciseTypesList = exerciseTypes.map(
                (exerciseType) => exerciseType?._id
              );

            // Get root exercise types in course
            let rootExerciseTypesPipeline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },
              {
                $match: {
                  "xAPI.object.id": {
                    $regex: "^((?!subContentId).)*$",
                  },
                },
              },
              {
                $group: {
                  _id: "$xAPI.context.contextActivities.category.id",
                },
              },
              {
                $sort: { _id: 1 },
              },
            ];
            let rootExerciseTypes = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(rootExerciseTypesPipeline)
              .toArray();

            // Push it into result
            if (result[0])
              result[0].rootExerciseTypes = rootExerciseTypes.length;
            // Loop through exercise types and get only the id
            if (result[0])
              result[0].rootExerciseTypesList = rootExerciseTypes.map(
                (exerciseType) => exerciseType?._id
              );

            // Get total submissions in course
            let totalSubmissionsPipeline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },
              // // Exclude sub exercises
              // {
              //   $match: {
              //     "xAPI.object.id": {
              //       $regex: "^((?!subContentId).)*$",
              //     },
              //   },
              // },

              {
                $match: {
                  $or: [
                    {
                      "xAPI.verb.id":
                        "http://adlnet.gov/expapi/verbs/completed",
                    },
                    {
                      "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
                    },
                  ],
                },
              },
              {
                $count: "totalSubmissions",
              },
            ];

            let totalSubmissions = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(totalSubmissionsPipeline)
              .toArray();
            totalSubmissions = totalSubmissions[0]?.totalSubmissions ?? 0;
            // Push it into result
            if (result[0]) result[0].totalSubmissions = totalSubmissions;

            // Get total sum of exercises
            let totalExercisesPipeline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },
              {
                $match: {
                  "xAPI.object.id": {
                    $regex: "^((?!subContentId).)*$",
                  },
                },
              },
              {
                $group: {
                  _id: "$xAPI.object.id",
                  title: {
                    $last: "$xAPI.object.definition.name.en-US",
                  },
                  type: {
                    $last: "$xAPI.context.contextActivities.category.id",
                  },
                },
              },
              {
                $count: "totalExercises",
              },
            ];

            let totalExercises = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(totalExercisesPipeline)
              .toArray();
            totalExercises = totalExercises[0]?.totalExercises ?? 0;
            // Push it into result
            if (result[0]) result[0].totalExercises = totalExercises;

            // Get total passing exercises
            let passingExercisesPipeline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },
              {
                $match: {
                  "xAPI.result.success": true,
                  $or: [
                    {
                      "xAPI.verb.id":
                        "http://adlnet.gov/expapi/verbs/completed",
                    },
                    {
                      "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
                    },
                  ],
                },
              },
              {
                $group: { _id: "$xAPI.verb.results", count: { $sum: 1 } },
              },
            ];

            let passingExercises = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(passingExercisesPipeline)
              .toArray();
            passingExercises = passingExercises[0]?.count ?? 0;
            // Push it into result

            if (result[0]) result[0].totalPassingExercises = passingExercises;

            // Get total actors in course
            let totalActorsCountPipeline = [
              {
                $match: {
                  "metadata.session.context_id": courseId,
                },
              },
              {
                $group: {
                  _id: "$xAPI.actor.name",
                },
              },
              {
                $count: "totalActorsCount",
              },
            ];

            let totalActorsCount = await m_client
              .db()
              .collection(
                process.env.MONGO_XAPI_COLLECTION +
                  "_consumerId_" +
                  consumerId +
                  "_courseId_" +
                  courseId
              )
              .aggregate(totalActorsCountPipeline)
              .toArray();
            if (result[0])
              result[0].totalActorsCount =
                totalActorsCount[0]?.totalActorsCount ?? 0;

            res.status(200).send({ result }).end();
          } catch (err) {
            console.log("Error while getting course: ", err);
            res.status(500).end();
          }
        }
      });
  } catch (err) {
    console.log("Error while getting course details", err);
    res.status(500).end();
  }
}

async function getExercises(req, res, next) {
  let courseId = req.query.course ? req.query.course : undefined;

  if (!courseId) {
    res.status(400).send({ error: "Invalid course ID" }).end();
    return;
  }

  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  let search = req.query.search ? req.query.search : undefined;
  let exerciseTypeFilters = req.query.exerciseTypeFilters
    ? req.query.exerciseTypeFilters
    : undefined;

  // Convert exerciseTypeFilters into Javascript array
  if (exerciseTypeFilters) {
    exerciseTypeFilters = JSON.parse(exerciseTypeFilters);
  }

  if (!courseId) {
    res.status(400).send({ error: "Invalid course ID" }).end();
    return;
  }

  // We need this in the meta
  //   "pagination": {
  //     "page": 1,
  //     "pageSize": 25,
  //     "pageCount": 1,
  //     "total": 6
  // }

  let pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

  // Make the pageSize positive
  if (pageSize < 0) pageSize = -pageSize;
  if (pageSize > 100) pageSize = 100;
  if (pageSize < 1) pageSize = 1;

  let page = req.query.page ? parseInt(req.query.page) : 1;

  // Make the page always positive
  if (page < 1) page = 1;
  if (page > 100) page = 100;
  if (page < 1) page = 1;

  // Calculate skip
  let skip = pageSize * (page - 1);

  let limit = pageSize;

  let ignoreSubExercises = req.query.ignoreSubExercises
    ? req.query.ignoreSubExercises
    : false;

  try {
    let pipeline = [
      {
        $match: {
          "metadata.session.context_id": courseId,
        },
      },
      {
        $group: {
          _id: "$xAPI.object.id",
          title: { $last: "$xAPI.object.definition.name.en-US" },
          type: { $last: "$xAPI.context.contextActivities.category.id" },
        },
      },
      {
        $sort: { title: 1 },
      },
    ];

    if (consumer != "all") {
      pipeline.unshift({
        $match: {
          "metadata.session.custom_consumer": consumer,
        },
      });
    }

    if (search) {
      let searchPipeline = {
        $match: {
          $or: [
            {
              title: {
                $regex: search,
                $options: "i",
              },
            },
            {
              _id: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      };
      pipeline.splice(3, 0, searchPipeline);
    }

    if (exerciseTypeFilters) {
      let exerciseTypeFiltersPipeline = {
        $match: {
          type: {
            $in: exerciseTypeFilters,
          },
        },
      };
      pipeline.splice(3, 0, exerciseTypeFiltersPipeline);
    }

    if (ignoreSubExercises) {
      pipeline.unshift({
        $match: {
          "xAPI.object.id": {
            $regex: "^((?!subContentId).)*$",
          },
        },
      });
    }

    // Add filter parameters to the pipeline
    addFiltersToPipeline(pipeline, req.query.filters);

    let count = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();

    count = count.length;

    // Calculate the page count
    let pageCount = Math.ceil(count / pageSize);

    let exercises = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Loop through each exercise and get the total submissions

    // DISABLING TOTAL SUBMISSIONS FOR NOW TO OPTIMIZE PERFORMANCE
    // for (let i = 0; i < exercises.length; i++) {
    //   let exercise = exercises[i];
    //   let exerciseId = exercise._id;
    //   let totalSubmissions = await helperGetTotalSubmissions(req, exerciseId, consumer, courseId);
    //   exercise.totalSubmissions = totalSubmissions;
    // }

    // Loop through each exercise and get average score
    // DISABLING AVERAGE SCORE FOR NOW TO OPTIMIZE PERFORMANCE
    // for (let i = 0; i < exercises.length; i++) {
    //   let exercise = exercises[i];
    //   let exerciseId = exercise._id;
    //   let [averageScore, averageScoreOutOf] = await helperGetAverageScore(
    //     req,
    //     exerciseId
    //   );
    //   exercise.averageScore = averageScore;
    //   exercise.averageScoreOutOf = averageScoreOutOf;
    // }

    res
      .status(200)
      .send({
        pagination: {
          page: page,
          pageSize: pageSize,
          pageCount: pageCount,
          total: count,
        },
        result: exercises,
      })
      .end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getExerciseDetails(req, res, next) {
  let courseId = req.query.course ? req.query.course : undefined;
  let exerciseId = req.params.id ? req.params.id : undefined;
  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
    return;
  }

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let subExerciseId = req.params.subExerciseId
    ? req.params.subExerciseId
    : undefined;
  if (subExerciseId) {
    exerciseId = exerciseId + "?subContentId=" + subExerciseId;
  }

  try {
    let pipeline = [
      {
        $match: {
          "xAPI.object.id": exerciseId,
        },
      },
      {
        $group: {
          _id: "$xAPI.object.id",
          title: { $last: "$xAPI.object.definition.name.en-US" },
          type: { $last: "$xAPI.context.contextActivities.category.id" },
          // DISABLING TOTAL RECORDS FOR NOW TO OPTIMIZE PERFORMANCE
          // totalRecords: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    // Add filter parameters to the pipeline
    addFiltersToPipeline(pipeline, req.query.filters);

    let exercise = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();

    // Fetch total passing
    let passingEventsPipeline = [
      {
        $match: {
          "xAPI.object.id": exerciseId,
        },
      },
      {
        $match: {
          "xAPI.result.success": true,
        },
      },
      {
        $group: {
          _id: "xAPI.result.success",
          count: { $sum: 1 },
        },
      },
    ];

    // Add filter parameters to the pipeline
    addFiltersToPipeline(passingEventsPipeline, req.query.filters);

    let passingEvents = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(passingEventsPipeline)
      .toArray();

    passingEvents = passingEvents[0]?.count ?? 0;
    // Push it into result
    if (exercise[0]) exercise[0].totalPassingEvents = passingEvents;

    // Get total submissions
    let totalSubmissions = await helperGetTotalSubmissions(
      req,
      exerciseId,
      consumer,
      courseId
    );

    if (exercise[0]) exercise[0].totalSubmissions = totalSubmissions ?? 0;

    // Get exercise average score
    let [averageScore, averageScoreOutOf] = await helperGetAverageScore(
      req,
      exerciseId,
      consumer,
      courseId
    );
    if (exercise[0]) exercise[0].averageScore = averageScore;
    if (exercise[0]) exercise[0].averageScoreOutOf = averageScoreOutOf;

    // Get exercise attempted
    // DISABLING ATTEMPTED FOR NOW TO OPTIMIZE PERFORMANCE
    // let attempted = await helperGetAttempted(req, exerciseId, consumer, courseId);
    // if (exercise[0]) exercise[0].attempted = attempted;

    // Get total actors count
    let totalActorsCount = await helperGetTotalActorsCount(
      req,
      exerciseId,
      consumer,
      courseId
    );
    if (exercise[0]) exercise[0].totalActorsCount = totalActorsCount;

    // Get total actors completed count
    let totalActorsCompletedCount = await helperGetTotalActorsCompletedCount(
      req,
      exerciseId,
      consumer,
      courseId
    );
    if (exercise[0])
      exercise[0].totalActorsCompletedCount = totalActorsCompletedCount;

    // Try to get exercise question or more info (for example MCQ question)
    let question = await helperGetQuestion(req, exerciseId, consumer, courseId);
    if (exercise[0]) exercise[0].question = question;

    // Try to get exercise choices (for MCQs)
    let choices = await helperGetChoices(req, exerciseId, consumer, courseId);
    if (exercise[0]) exercise[0].choices = choices;

    // For each distinct verbs get the number of events
    let verbCountPipeline = [
      {
        $match: {
          "xAPI.object.id": exerciseId,
        },
      },
      {
        $group: {
          _id: "$xAPI.verb.id",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ];
    let verbCount = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(verbCountPipeline)
      .toArray();
    verbCount = verbCount.map((verb) => {
      return {
        title: verb._id,
        count: verb.count,
      };
    });
    if (exercise[0]) exercise[0].eventTypes = verbCount;

    // Get the child exercises if any
    let childExercises = await helperGetChildExercises(
      req,
      exerciseId,
      consumer,
      courseId
    );
    if (exercise[0]) exercise[0].childExercises = childExercises;

    res.status(200).send({ result: exercise[0] }).end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getExerciseSubmissionsOverTime(req, res, next) {
  let courseId = req.query.course ? req.query.course : undefined;
  let exerciseId = req.params.id ? req.params.id : undefined;
  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
    return;
  }

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let subExerciseId = req.params.subExerciseId
    ? req.params.subExerciseId
    : undefined;
  if (subExerciseId) {
    exerciseId = exerciseId + "?subContentId=" + subExerciseId;
  }

  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        "xAPI.result.completion": true,
      },
    },

    {
      $project: {
        date: {
          $dateFromString: {
            dateString: "$metadata.createdAt",
          },
        },
      },
    },
    {
      $project: {
        YearMonthDay: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$date",
          },
        },
      },
    },
    {
      $group: {
        _id: "$YearMonthDay",
        submissions: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  try {
    let submissions = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();
    res.status(200).send({ result: submissions }).end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getCourseSubmissionsOverTime(req, res, next) {
  let courseId = req.params.id ? req.params.id : undefined;

  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let pipeline = [
    {
      $match: {
        "metadata.session.context_id": courseId,
      },
    },
    {
      $match: {
        "xAPI.result.completion": true,
      },
    },

    {
      $project: {
        date: {
          $dateFromString: {
            dateString: "$metadata.createdAt",
          },
        },
      },
    },
    {
      $project: {
        YearMonthDay: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$date",
          },
        },
      },
    },
    {
      $group: {
        _id: "$YearMonthDay",
        submissions: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  try {
    let submissions = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();
    res.status(200).send({ result: submissions }).end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getCourseExerciseTypesAndCount(req, res, next) {
  let courseId = req.params.id ? req.params.id : undefined;

  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let pipeline = [
    {
      $match: {
        "metadata.session.context_id": courseId,
      },
    },
    {
      $group: {
        _id: "$xAPI.context.contextActivities.category.id",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  try {
    let exerciseTypesAndCount = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();

    // Filter out the ones which _id is null or undefined
    exerciseTypesAndCount = exerciseTypesAndCount.filter((exercise) => {
      return exercise._id;
    });

    res.status(200).send({ result: exerciseTypesAndCount }).end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getMCQChart(req, res, next) {
  let courseId = req.query.course ? req.query.course : undefined;
  let exerciseId = req.params.id ? req.params.id : undefined;
  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  // let subExerciseId

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
    return;
  }

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let subExerciseId = req.params.subExerciseId
    ? req.params.subExerciseId
    : undefined;
  if (subExerciseId) {
    exerciseId = exerciseId + "?subContentId=" + subExerciseId;
  }

  // Try to get exercise choices (for MCQs)
  let choices = await helperGetChoices(req, exerciseId, consumer, courseId);
  // if (exercise[0]) exercise[0].choices = choices;

  // Get the number of counts per choice

  let countsPerChoicepipeline = [
    {
      $match: {
        "xAPI.context.contextActivities.category.id": {
          $regex: "http://h5p.org/libraries/H5P.MultiChoice",
        },
        "xAPI.object.id": exerciseId,
        "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
      },
    },

    {
      $group: { _id: "$xAPI.result.response", count: { $sum: 1 } },
    },

    {
      $sort: { _id: 1 },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(countsPerChoicepipeline, req.query.filters);

  let countsPerChoices = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(countsPerChoicepipeline)
    .toArray();

  // Get the number of correct answers per choice
  for (let index = 0; index < countsPerChoices.length; index++) {
    if (!countsPerChoices[index]._id) continue;
    if (countsPerChoices[index]._id.trim() === "") continue;
    // If its a group of choices, then ignore it
    if (countsPerChoices[index]._id.includes("[,]")) continue;

    choices.forEach((element) => {
      if (String(element.key) === String(countsPerChoices[index]._id)) {
        element.count = countsPerChoices[index].count;
      }
    });
  }

  // When grouped choices are used, we need to add the counts to the individual choices
  let groupedChoices = countsPerChoices.filter((s) => s._id.includes("[,]"));
  for (let i = 0; i < groupedChoices.length; i++) {
    let groupedChoice = groupedChoices[i];
    let individualChoices = groupedChoice._id.split("[,]");
    for (let j = 0; j < individualChoices.length; j++) {
      let individualChoice = individualChoices[j];
      let choice = choices.find((s) => s.key === individualChoice);
      if (choice) {
        if (choice.count) {
          choice.count += groupedChoice.count;
        } else {
          choice.count = groupedChoice.count;
        }
      }
    }
  }

  // Sort the choices by key
  choices.sort((a, b) => parseInt(b.key) + parseInt(a.key));

  // Get the correct answers query
  let correctResponsesPattern;

  correctResponsePipeline = [
    {
      $match: {
        "xAPI.context.contextActivities.category.id": {
          $regex: "http://h5p.org/libraries/H5P.MultiChoice",
        },
        "xAPI.object.id": exerciseId,
        "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $limit: 1,
    },
    {
      $group: {
        _id: "$xAPI.object.definition.correctResponsesPattern",
      },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(correctResponsePipeline, req.query.filters);

  let correctResponsesPatternQuery = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(correctResponsePipeline)
    .toArray();

  if (correctResponsesPatternQuery[0]) {
    correctResponsesPattern = correctResponsesPatternQuery[0]._id[0];
  }

  res.status(200).send({ choices, correctResponsesPattern });
}

async function getTrueFalseChart(req, res, next) {
  let courseId = req.query.course ? req.query.course : undefined;
  let exerciseId = req.params.id ? req.params.id : undefined;
  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);
  // let subExerciseId

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
    return;
  }

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let subExerciseId = req.params.subExerciseId
    ? req.params.subExerciseId
    : undefined;
  if (subExerciseId) {
    exerciseId = exerciseId + "?subContentId=" + subExerciseId;
  }

  // Get the correct answers query
  correctResponsePipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
        "xAPI.result.completion": true,
      },
    },

    {
      $group: {
        _id: "$xAPI.result.response",
        title: { $last: "$xAPI.result.response" },
        isCorrect: { $last: "$xAPI.result.success" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        title: -1,
      },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(correctResponsePipeline, req.query.filters);

  let correctResponsesPatternQuery = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(correctResponsePipeline)
    .toArray();

  res.status(200).send(correctResponsesPatternQuery);
}

async function getActors(req, res, next) {
  // Get all actors from a particular course

  let consumer = req.query.consumer ? req.query.consumer : "all";
  let courseId = req.query.course ? req.query.course : undefined;
  let search = req.query.search ? req.query.search : undefined;

  let pipeline;

  if (!courseId) {
    res.status(400).send({ error: "Invalid course ID" }).end();
    return;
  }

  // We need this in the meta
  //   "pagination": {
  //     "page": 1,
  //     "pageSize": 25,
  //     "pageCount": 1,
  //     "total": 6
  // }

  let pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

  // Make the pageSize positive
  if (pageSize < 0) pageSize = -pageSize;
  if (pageSize > 100) pageSize = 100;
  if (pageSize < 1) pageSize = 1;

  let page = req.query.page ? parseInt(req.query.page) : 1;

  // Make the page always positive
  if (page < 1) page = 1;
  if (page > 100) page = 100;
  if (page < 1) page = 1;

  // Calculate skip
  let skip = pageSize * (page - 1);

  let limit = pageSize;

  try {
    pipeline = [
      {
        $match: {
          "metadata.session.context_id": courseId,
        },
      },

      {
        $group: {
          _id: "$xAPI.actor.name",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    if (consumer != "all") {
      pipeline.unshift({
        $match: {
          "metadata.session.custom_consumer": consumer,
        },
      });
    }

    if (search) {
      let searchPipeline = {
        $match: {
          "xAPI.actor.name": {
            $regex: search,
            $options: "i",
          },
        },
      };
      pipeline.splice(2, 0, searchPipeline);
    }

    let count = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();

    count = count.length;

    // Calculate the page count
    let pageCount = Math.ceil(count / pageSize);

    let actors = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .skip(skip)
      .limit(limit)
      .toArray();

    res
      .status(200)
      .send({
        pagination: {
          page: page,
          pageSize: pageSize,
          pageCount: pageCount,
          total: count,
        },
        result: actors,
      })
      .end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function download(req, res, next) {
  let courseId = req.query.course ? req.query.course : undefined;

  let consumer = req.query.consumer
    ? req.query.consumer
    : await getConsumerIdFromCourseId(courseId);

  let exerciseId = req.query.exercise ? req.query.exercise : undefined;
  let ignoreSubExercises = req.query.ignoreSubExercises
    ? req.query.ignoreSubExercises
    : false;

  let includeSimplifyRecords = req.query.includeSimplifyRecords
    ? req.query.includeSimplifyRecords
    : false;

  let includeRAWRecords = req.query.includeRAWRecords
    ? req.query.includeRAWRecords
    : false;

  if (courseId === "") courseId = undefined;
  if (exerciseId === "") exerciseId = undefined;

  if (!courseId) {
    res.status(400).send({ error: "Invalid courseId" }).end();
    return;
  }

  let pipeline = [];

  if (consumer != "all") {
    pipeline.unshift({
      $match: {
        "metadata.session.custom_consumer": consumer,
      },
    });
  }

  if (courseId) {
    pipeline.push({
      $match: {
        "metadata.session.context_id": courseId,
      },
    });
  }

  if (exerciseId) {
    pipeline.push({
      $match: {
        "xAPI.object.id": { $regex: exerciseId },
      },
    });
  }

  if (ignoreSubExercises) {
    pipeline.unshift({
      $match: {
        "xAPI.object.id": {
          $regex: "^((?!subContentId).)*$",
        },
      },
    });
  }

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  try {
    let records = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();

    let myResponse = [];
    // Loop through all records and delete session object and simplify the data as required
    // Also encrypt actor name if already not encrypted and remove the email
    for (let i = 0; i < records.length; i++) {
      let element = records[i];

      // Encrypt the actor name if it is not already encrypted
      if (element.xAPI.actor.name && element.xAPI.actor.name.includes("-")) {
        element.xAPI.actor.name = require("crypto")
          .createHash("sha256")
          .update(element.xAPI.actor.name)
          .digest("hex");
      }
      // Remove the email from the actor name
      delete element.xAPI.actor.mbox;

      // Remove the session object
      delete element.metadata.session;

      if (includeSimplifyRecords && includeRAWRecords) {
        myResponse.push({
          rawRecord: element,
          simplifiedRecord: helperSimplifyData(element),
        });
      } else if (includeSimplifyRecords && !includeRAWRecords) {
        myResponse.push(helperSimplifyData(element));
      } else if (!includeSimplifyRecords && includeRAWRecords) {
        myResponse.push(element);
      }
    }

    try {
      fs.writeFileSync(
        `tmp/${req.user.email || ""}_tmp.json`,
        JSON.stringify({ result: myResponse })
      );
    } catch (err) {
      console.log("Error writing file for download", err);
    }

    res
      .status(200)
      .download(`tmp/${req.user.email || ""}_tmp.json`, "download.json");
  } catch (err) {
    console.log("Error while downloading records", err);
    res.status(500).end();
  }
}

function helperSimplifyData(element, includexAPIRaw = false) {
  // Format the data based on what Zuhra has suggested

  let response = {};

  // Assign the User ID
  response["User ID"] = element.xAPI?.actor?.name;

  // Include raw xAPI data
  if (includexAPIRaw === true) {
    response["Raw xAPI Data"] = element.xAPI;
  }

  // Assign the verb type
  switch (element.xAPI?.verb?.id) {
    case "http://adlnet.gov/expapi/verbs/answered":
      response["Verb"] = "answered";
      response["Question"] =
        element.xAPI?.object?.definition?.description["en-US"];

      // Flatten the choices array
      let choices = [];
      for (
        let index = 0;
        index < element.xAPI?.object?.definition?.choices?.length;
        index++
      ) {
        let choice = {};

        const thisElement = element.xAPI?.object?.definition?.choices[index];
        choice.name = thisElement.description["en-US"];
        choice.id = thisElement.id;
        choices.push(choice);
      }

      // Sort the choices by id
      choices.sort(function (a, b) {
        return Number(a.id) - Number(b.id);
      });

      // Put the choices in the response in correct order and new lines
      let choicesString = "";
      for (let index = 0; index < choices.length; index++) {
        choicesString +=
          "[" +
          (choices[index]?.id ?? "") +
          "] " +
          (choices[index]?.name ?? "");
      }
      response["Choices"] = choicesString;

      // Loop through correctResponses array and add the correct responses to the response
      if (
        String(
          element.xAPI?.object?.definition?.correctResponsesPattern
        ).includes("[,]")
      ) {
        // Multiple correct responses
        let correctResponses = String(
          element.xAPI?.object?.definition?.correctResponsesPattern
        ).split("[,]");
        response["Correct response"] = "";
        for (let index = 0; index < correctResponses?.length; index++) {
          let id = correctResponses[index];
          response["Correct response"] +=
            "[" + (id ?? "") + "] " + (choices[id]?.name ?? "") + "\n";
        }
      } else {
        // Single correct response
        let id = element?.xAPI?.object?.definition?.correctResponsesPattern;
        response["Correct response"] =
          "[" + (id ?? "") + "] " + (choices[id]?.name ?? "");
      }

      // Assign the user answer
      if (element?.xAPI?.result?.response.includes("[,]")) {
        // Multiple responses
        let responses = String(element?.xAPI?.result?.response).split("[,]");
        response["User answer"] = "";
        for (let index = 0; index < responses.length; index++) {
          let id = responses[index];
          response["User answer"] +=
            "[" + (id ?? "") + "] " + (choices[id]?.name ?? "") + "\n";
        }
      } else {
        // Single response
        let id = element.xAPI?.result?.response;
        response["User answer"] =
          "[" + (id ?? "") + "] " + (choices[id]?.name ?? "");
      }

      // Result completion
      response["Result completion"] = element?.xAPI?.result?.completion;

      // Result success
      response["Result success"] = element?.xAPI?.result?.success;

      // Duration
      response["Duration"] = element?.xAPI?.result?.duration;

      break;
    case "http://adlnet.gov/expapi/verbs/completed":
      response["Verb"] = "completed";

      response["Result Score Raw"] = element?.xAPI?.result?.score?.raw;
      response["Result Score Scaled"] = element?.xAPI?.result?.score?.scaled;
      response["Result Completion"] = element?.xAPI?.result?.completion;
      response["Result Success"] = element?.xAPI?.result?.success;
      response["Result Duration"] = element?.xAPI?.result?.duration;

      break;
    case "http://adlnet.gov/expapi/verbs/attempted":
      response["Verb"] = "attempted";
      break;
    case "http://adlnet.gov/expapi/verbs/interacted":
      response["Verb"] = "interacted";
      break;
    case "http://adlnet.gov/expapi/verbs/passed":
      response["Verb"] = "passed";
      response["Result Completion"] = element?.xAPI?.result?.completion;
      response["Result Success"] = element?.xAPI?.result?.success;
      break;
    case "http://adlnet.gov/expapi/verbs/mastered":
      response["Verb"] = "mastered";
      response["Result Completion"] = element?.xAPI?.result?.completion;
      response["Result Success"] = element?.xAPI?.result?.success;
      break;
  }

  // Assign content ID
  response["Content ID"] = element.xAPI?.object?.id;

  // Assign the subcontent ID is it exists
  if (
    element?.xAPI?.object?.definition?.extensions[
      "http://h5p.org/x-api/h5p-subContentId"
    ]
  ) {
    response["Sub Content ID"] =
      element?.xAPI?.object?.definition?.extensions[
        "http://h5p.org/x-api/h5p-subContentId"
      ];
  }

  // Assign the time
  response["Time"] = element?.metadata?.createdAt;

  return response;
}

async function helperGetTotalSubmissions(
  req,
  exerciseId,
  consumer = null,
  courseId = null
) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        "xAPI.result.completion": true,
      },
    },
    {
      $count: "totalSubmissions",
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  let totalSubmissions = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();
  totalSubmissions = totalSubmissions[0]?.totalSubmissions;
  return totalSubmissions;
}

async function helperGetTotalActorsCount(
  req,
  exerciseId,
  consumer = null,
  courseId = null
) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $group: { _id: "$xAPI.actor.name" },
    },
    {
      $count: "totalActorsCount",
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  let totalActorsCount = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();
  totalActorsCount = totalActorsCount[0]?.totalActorsCount;
  return totalActorsCount;
}

async function helperGetTotalActorsCompletedCount(
  req,
  exerciseId,
  consumer = null,
  courseId = null
) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        "xAPI.result.completion": true,
      },
    },
    {
      $group: { _id: "$xAPI.actor.name" },
    },
    {
      $count: "totalActorsCompletedCount",
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  let totalActorsCompletedCount = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();
  totalActorsCompletedCount =
    totalActorsCompletedCount[0]?.totalActorsCompletedCount;
  return totalActorsCompletedCount;
}

async function helperGetAverageScore(
  req,
  exerciseId,
  consumer = null,
  courseId = null
) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        "xAPI.result.completion": true,
      },
    },
    {
      $group: {
        _id: "$xAPI.verb.id",
        avg: { $avg: "$xAPI.result.score.scaled" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  let pipelineResult = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();

  let averageScore = pipelineResult[0]?.avg;
  let count = pipelineResult[0]?.count;

  return [averageScore, count];
}

async function helperGetAttempted(req, exerciseId, consumer = null, courseId) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/attempted",
      },
    },
    {
      $count: "attempted",
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  let attempted = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();
  attempted = attempted[0]?.attempted;
  return attempted;
}
async function helperGetQuestion(req, exerciseId, consumer = null, courseId) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $group: {
        _id: "$xAPI.object.definition.description.en-US",
        question: { $last: "$xAPI.object.definition.description.en-US" },
      },
    },
  ];
  let question = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();
  // Filter out null values
  question = question.filter((element) => element.question != null);
  question = question[0]?.question;
  return question;
}

async function helperGetChoices(
  req,
  exerciseId,
  consumer = null,
  courseId = null
) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $unwind: "$xAPI.object.definition.choices",
    },
    {
      $group: {
        _id: "$xAPI.object.definition.choices.description.en-US",
        key: {
          $last: "$xAPI.object.definition.choices.id",
        },
      },
    },
    {
      $sort: {
        key: 1,
      },
    },
  ];
  let choices = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();

  return choices;
}

async function helperGetChildExercises(
  req,
  exerciseId,
  consumer = null,
  courseId = null
) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": { $regex: exerciseId },
      },
    },
    {
      $group: {
        _id: "$xAPI.object.id",
        title: { $last: "$xAPI.object.definition.name.en-US" },
      },
    },
    {
      $sort: {
        title: 1,
      },
    },
  ];

  // Add filter parameters to the pipeline
  addFiltersToPipeline(pipeline, req.query.filters);

  let childExercises = await m_client
    .db()
    .collection(
      process.env.MONGO_XAPI_COLLECTION +
        "_consumerId_" +
        consumer +
        "_courseId_" +
        courseId
    )
    .aggregate(pipeline)
    .toArray();

  let childExIds = [];

  for (let index = 0; index < childExercises.length; index++) {
    const exercise = childExercises[index];
    exercise._id.split("?subContentId=")[1] &&
      childExIds.push(exercise._id.split("?subContentId=")[1]);
  }

  // Loop through the child exercises and get the title and type
  let childExercisesInfo = [];
  for (let index = 0; index < childExIds.length; index++) {
    const thisExerciseId = childExIds[index];
    let pipeline = [
      {
        $match: {
          "xAPI.object.id": exerciseId + "?subContentId=" + thisExerciseId,
        },
      },
      {
        $group: {
          _id: "$xAPI.object.id",
          type: { $last: "$xAPI.context.contextActivities.category.id" },
          title: { $last: "$xAPI.object.definition.name.en-US" },
        },
      },
    ];

    // Add filter parameters to the pipeline
    addFiltersToPipeline(pipeline, req.query.filters);

    let info = await m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumer +
          "_courseId_" +
          courseId
      )
      .aggregate(pipeline)
      .toArray();

    let thisInfo = info[0];
    thisInfo.childId = thisExerciseId;
    thisInfo.parentId = exerciseId;

    childExercisesInfo.push(thisInfo);
  }

  return childExercisesInfo;
}

async function addFiltersToPipeline(pipeline, filters) {
  if (typeof filters === "object" && pipeline instanceof Array) {
    // Loop through the filters object and add them to the pipeline
    for (const [key, value] of Object.entries(filters)) {
      let filter = {};
      filter[key] = value;

      pipeline.unshift({ $match: { [key]: value } });
    }
  }
}

async function getConsumerIdFromCourseId(courseId) {
  // Find consumerId by searching through the collections
  let consumerId = null;
  // Get all the collections
  let collections = await m_client.db().listCollections().toArray();

  // Filter out the collections
  let filteredCollections = collections.filter((collection) => {
    return collection.name.includes(
      process.env.MONGO_XAPI_COLLECTION + "_consumerId_"
    );
  });

  // Loop through filteredCollections and find the collection that has the courseId
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let collectionName = collection.name;
    if (collectionName.includes("_courseId_" + courseId)) {
      consumerId = collectionName.split("_consumerId_")[1].split("_")[0];
      break;
    }
  }

  return consumerId;
}

async function getAllCoursesAdmin(req, res, next) {
  // Return all courses from all consumers
  // Get all the collections
  let collections = await m_client.db().listCollections().toArray();

  // Filter out the collections
  let filteredCollections = collections.filter((collection) => {
    return collection.name.includes(
      process.env.MONGO_XAPI_COLLECTION + "_consumerId_"
    );
  });

  // Create a tree structure like
  // [
  //   {
  //     consumer: "consumer1",
  //     courses: [
  //       {
  //         id: "course1",
  //        }
  //     ]
  //   }
  // ]

  let courses = [];
  // Loop through filteredCollections and find the collection that has the courseId
  for (let i = 0; i < filteredCollections.length; i++) {
    let collection = filteredCollections[i];
    let collectionName = collection.name;

    let consumerId = collectionName.split("_consumerId_")[1].split("_")[0];
    let courseId = collectionName.split("_courseId_")[1];

    // For now do not add consumerId with null
    if (consumerId === "null") continue;

    // Check if the consumer already exists in the courses array
    let consumer = courses.find((s) => s.consumer === consumerId);

    if (consumer) {
      // Consumer already exists in the courses array
      // Check if the course already exists in the consumer
      let course = consumer.courses.find((s) => s.id === courseId);
      if (!course) {
        // Course does not exist in the consumer, so add it
        consumer.courses.push({ id: courseId });
      }
    } else {
      // Consumer does not exist in the courses array, so add it
      courses.push({
        consumer: consumerId,
        courses: [{ id: courseId }],
      });
    }
  }

  try {
    res.status(200).send({ result: courses }).end();
  } catch (e) {
    console.log("Error in getAllCoursesAdmin", e);
    res.status(500).end();
  }
}
