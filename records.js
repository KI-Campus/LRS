const express = require("express");
const jwtAuthz = require("express-jwt-authz");
const router = express.Router();
const fs = require("fs");

let jwtScopeOptions = {
  failWithError: true,
  customScopeKey: "role",
};

var m_client;

module.exports = { router, init };

function init(mongoClient) {
  m_client = mongoClient;
}

// Middleware check for user access
router.use("/stats", checkUserAccess);
router.use("/courses", checkUserAccess);
router.use("/course/:id", checkUserAccess);

router.use("/courseSubmissionsOverTime/:id", checkUserAccess);
router.use("/courseExerciseTypesAndCount/:id", checkUserAccess);
router.use("/download", checkUserAccess);

router.use("/exercises", checkUserAccess);
router.use("/exerciseDetails/:id", checkUserAccess);
router.use("/exerciseDetails/:id/:subExerciseId", checkUserAccess);
router.use("/exerciseSubmissionsOverTime/:id", checkUserAccess);
router.use("/exerciseSubmissionsOverTime/:id/:subExerciseId", checkUserAccess);
router.use("/mcqChat/:id", checkUserAccess);
router.use("/mcqChat/:id/:subExerciseId", checkUserAccess);

// openLRS routes
router.get("/stats", getStats);
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
router.get("/mcqChat/:id", getMCQChart);
router.get("/mcqChat/:id/:subExerciseId", getMCQChart);

async function checkUserAccess(req, res, next) {
  req.query.consumer ? (consumer = req.body.consumer) : (consumer = "all");
  req.query.courseId ? (courseId = req.body.courseId) : (courseId = "all");

  let hasConsumerAccess = false;
  // Check in the user collection mongodb if consumerAccess array includes consumer
  await m_client
    .db()
    .collection("users")
    .findOne({ email: req.user.email }, (err, resultUser) => {
      if (err) {
        console.log("Error while getting records", err);
        res.status(500).end();
        return;
      } else {
        if (
          resultUser.consumersAccess.includes(req.body.consumer) ||
          resultUser.role == "admin"
        ) {
          hasConsumerAccess = true;

          next();
        } else {
          console.log(
            "User " + req.user.email + " does not have access to consumer: ",
            req.body.consumer
          );
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
    let totalRecordsPipeline = [
      {
        $count: "totalRecords",
      },
    ];

    let totalRecords = await m_client
      .db()
      .collection("records")
      .aggregate(totalRecordsPipeline)
      .toArray();
    result.totalRecords = totalRecords[0].totalRecords;

    // Get total submissions
    let totalSubmissionsPipeline = [
      {
        $match: {
          $or: [
            {
              "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
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
      .collection("records")
      .aggregate(totalSubmissionsPipeline)
      .toArray();
    result.totalSubmissions = totalSubmissions[0].totalSubmissions;

    // Get total exercise types
    let totalExerciseTypesPipeline = [
      {
        $group: {
          _id: "$xAPI.context.contextActivities.category.id",
        },
      },
      {
        $count: "exerciseTypes",
      },
    ];
    let totalExerciseTypes = await m_client
      .db()
      .collection("records")
      .aggregate(totalExerciseTypesPipeline)
      .toArray();
    result.exerciseTypes = totalExerciseTypes[0].exerciseTypes;

    // Get total consumers
    let totalConsumersPipeline = [
      {
        $group: {
          _id: "$metadata.session.custom_consumer",
        },
      },
    ];
    let totalConsumers = await m_client
      .db()
      .collection("records")
      .aggregate(totalConsumersPipeline)
      .toArray();
    result.totalConsumers = totalConsumers.length;
    result.totalConsumersList = totalConsumers;

    // Get total passing exercises
    let totalPassingExercisesPipeline = [
      {
        $match: {
          "xAPI.result.success": true,
          $or: [
            {
              "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
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

      {
        $sort: {
          _id: 1,
        },
      },
    ];

    let totalPassingExercises = await m_client
      .db()
      .collection("records")
      .aggregate(totalPassingExercisesPipeline)
      .toArray();
    result.totalPassingExercises = totalPassingExercises[0].count;

    res.status(200).send({ result }).end();
  } catch (err) {
    console.log("Error while getting stats", err);
    res.status(500).end();
  }
}

async function getCourses(req, res, next) {
  let pipeline = [
    {
      $group: {
        _id: "$metadata.session.context_id",
        title: { $last: "$metadata.session.context_title" },
        consumer: { $last: "$metadata.session.custom_consumer" },
      },
    },
    {
      $sort: { title: 1 },
    },
  ];
  let courseId = req.query.courseId ? req.query.courseId : "all";
  let consumer = req.query.consumer ? req.query.consumer : "all";
  if (courseId != "all") {
    pipeline.unshift({
      $match: {
        "metadata.session.context_id": courseId,
      },
    });
  }
  if (consumer != "all") {
    pipeline.unshift({
      $match: {
        "metadata.session.custom_consumer": consumer,
      },
    });
  }

  try {
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(pipeline)
      .toArray(function (err, result) {
        if (err) {
          console.log("Error while Aggregating: ", err);
          console.log("Pipeline: ", pipeline);
          res.status(500).end();
        } else {
          // Filter out null values
          result = result.filter((course) => course._id != null);
          res.status(200).send({ result }).end();
        }
      });
  } catch (err) {
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

  try {
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
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
              .collection(process.env.MONGO_XAPI_COLLECTION)
              .aggregate(totalRecordsPipleline)
              .toArray();
            totalRecords = totalRecords[0]?.totalRecords;
            // Push it into result
            if (totalRecords) result[0].totalRecords = totalRecords;

            // Get total exercise types in course
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
                $count: "exerciseTypes",
              },
            ];
            let exerciseTypes = await m_client
              .db()
              .collection(process.env.MONGO_XAPI_COLLECTION)
              .aggregate(exerciseTypesPipeline)
              .toArray();
            exerciseTypes = exerciseTypes[0]?.exerciseTypes;
            // Push it into result
            if (exerciseTypes) result[0].exerciseTypes = exerciseTypes;

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
              .collection(process.env.MONGO_XAPI_COLLECTION)
              .aggregate(totalSubmissionsPipeline)
              .toArray();
            totalSubmissions = totalSubmissions[0]?.totalSubmissions;
            // Push it into result
            if (totalSubmissions) result[0].totalSubmissions = totalSubmissions;

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
                    $not: {
                      $regex: "subContentId",
                    },
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
              .collection(process.env.MONGO_XAPI_COLLECTION)
              .aggregate(totalExercisesPipeline)
              .toArray();
            totalExercises = totalExercises[0]?.totalExercises;
            // Push it into result
            if (totalExercises) result[0].totalExercises = totalExercises;

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
              .collection(process.env.MONGO_XAPI_COLLECTION)
              .aggregate(passingExercisesPipeline)
              .toArray();
            passingExercises = passingExercises[0]?.count;
            // Push it into result
            if (passingExercises)
              result[0].totalPassingExercises = passingExercises;

            res.status(200).send({ result }).end();
          } catch (err) {
            console.log("Error while getting course: ", err);
            res.status(500).end();
          }
        }
      });
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getExercises(req, res, next) {
  let consumer = req.query.consumer ? req.query.consumer : "all";
  let courseId = req.query.course ? req.query.course : undefined;

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

    if (ignoreSubExercises) {
      pipeline.unshift({
        $match: {
          "xAPI.object.id": {
            $regex: "^((?!subContentId).)*$",
          },
        },
      });
    }

    let count = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(pipeline)
      .toArray();

    count = count.length;

    // Calculate the page count
    let pageCount = Math.ceil(count / pageSize);

    let exercises = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(pipeline)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Loop through each exercise and get the total submissions
    for (let i = 0; i < exercises.length; i++) {
      let exercise = exercises[i];
      let exerciseId = exercise._id;
      let totalSubmissions = await helperGetTotalSubmissions(exerciseId);
      exercise.totalSubmissions = totalSubmissions;
    }

    // Loop through each exercise and get average score
    for (let i = 0; i < exercises.length; i++) {
      let exercise = exercises[i];
      let exerciseId = exercise._id;
      let averageScore = await helperGetAverageScore(exerciseId);
      exercise.averageScore = averageScore;
    }

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
  let exerciseId = req.params.id ? req.params.id : undefined;

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
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
          totalRecords: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    let exercise = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
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

    let passingEvents = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(passingEventsPipeline)
      .toArray();

    passingEvents = passingEvents[0]?.count || 0;
    // Push it into result
    if (exercise[0]) exercise[0].totalPassingEvents = passingEvents;

    // Get total submissions
    let totalSubmissions = await helperGetTotalSubmissions(exerciseId);

    if (exercise[0]) exercise[0].totalSubmissions = totalSubmissions || 0;

    // Get total interactions
    let totalInteractionsPipeline = [
      {
        $match: {
          "xAPI.object.id": exerciseId,
        },
      },
      {
        $match: {
          "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/interacted",
        },
      },

      {
        $count: "totalInteractions",
      },
    ];
    let totalInteractions = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(totalInteractionsPipeline)
      .toArray();
    totalInteractions = totalInteractions[0]?.totalInteractions;
    if (exercise[0]) exercise[0].totalInteractions = totalInteractions;

    // Get exercise average score
    let averageScore = await helperGetAverageScore(exerciseId);
    if (exercise[0]) exercise[0].averageScore = averageScore;

    // Get exercise attempted
    let attempted = await helperGetAttempted(exerciseId);
    if (exercise[0]) exercise[0].attempted = attempted;

    // Try to get exercise question or more info (for example MCQ question)
    let question = await helperGetQuestion(exerciseId);
    if (exercise[0]) exercise[0].question = question;

    // Try to get exercise choices (for MCQs)
    let choices = await helperGetChoices(exerciseId);
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
      .collection(process.env.MONGO_XAPI_COLLECTION)
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
    let childExercises = await helperGetChildExercises(exerciseId);
    if (exercise[0]) exercise[0].childExercises = childExercises;

    res.status(200).send({ result: exercise[0] }).end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getExerciseSubmissionsOverTime(req, res, next) {
  let exerciseId = req.params.id ? req.params.id : undefined;

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
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
        $or: [
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
          },
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
          },
        ],
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
            format: "%Y-%m-%d",
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

  try {
    let submissions = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
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
        $or: [
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
          },
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
          },
        ],
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
            format: "%Y-%m-%d",
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

  try {
    let submissions = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
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

  try {
    let exerciseTypesAndCount = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(pipeline)
      .toArray();
    res.status(200).send({ result: exerciseTypesAndCount }).end();
  } catch (err) {
    console.log("Error while aggregating records", err);
    console.log("Pipeline was: ", pipeline);
    res.status(500).end();
  }
}

async function getMCQChart(req, res, next) {
  let exerciseId = req.params.id ? req.params.id : undefined;
  // let subExerciseId

  if (!exerciseId) {
    res.status(400).send({ error: "Invalid exerciseId" }).end();
    return;
  }

  let subExerciseId = req.params.subExerciseId
    ? req.params.subExerciseId
    : undefined;
  if (subExerciseId) {
    exerciseId = exerciseId + "?subContentId=" + subExerciseId;
  }

  // Try to get exercise choices (for MCQs)
  let choices = await helperGetChoices(exerciseId);
  // if (exercise[0]) exercise[0].choices = choices;

  // Get the number of counts per choice

  let countsPerChoicepipeline = [
    {
      $match: {
        "xAPI.context.contextActivities.category.id":
          "http://h5p.org/libraries/H5P.MultiChoice-1.14",
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

  let countsPerChoices = await m_client
    .db()
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(countsPerChoicepipeline)
    .toArray();

  // Loop through choices and add the count
  for (let i = 0; i < choices.length; i++) {
    let choice = choices[i];
    let countsPerChoice = countsPerChoices.find((s) => s._id === choice.key);
    if (countsPerChoice) {
      choice.count = countsPerChoice.count;
    } else {
      choice.count = 0;
    }
    choice.title = choice._id;
  }

  // Sort the choices by key
  choices.sort((a, b) => parseInt(b.count) - parseInt(a.count));

  // Get the correct answers query
  let correctResponsesPattern;

  correctResponsePipeline = [
    {
      $match: {
        "xAPI.context.contextActivities.category.id":
          "http://h5p.org/libraries/H5P.MultiChoice-1.14",
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

  let correctResponsesPatternQuery = await m_client
    .db()
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(correctResponsePipeline)
    .toArray();

  if (correctResponsesPatternQuery[0]) {
    correctResponsesPattern = correctResponsesPatternQuery[0]._id[0];
  }

  res.status(200).send({ choices, correctResponsesPattern });
}

async function download(req, res, next) {
  let consumer = req.query.consumer ? req.query.consumer : "all";
  let courseId = req.query.course ? req.query.course : undefined;
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
        "xAPI.object.id": exerciseId,
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

  try {
    let records = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(pipeline)
      .toArray();

    let myResponse = [];
    // Loop through all records and delete session object and do some magic
    for (let i = 0; i < records.length; i++) {
      let element = records[i];
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

    fs.writeFileSync(
      `tmp/${req.user.email || ""}_tmp.json`,
      JSON.stringify({ result: myResponse })
    );

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
        choicesString += "[" + choices[index]?.id + "] " + choices[index]?.name;
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
            "[" + id + "] " + choices[id]?.name + "\n";
        }
      } else {
        // Single correct response
        let id = element?.xAPI?.object?.definition?.correctResponsesPattern;
        response["Correct response"] = "[" + id + "] " + choices[id]?.name;
      }

      // Assign the user answer
      if (element?.xAPI?.result?.response.includes("[,]")) {
        // Multiple responses
        let responses = String(element?.xAPI?.result?.response).split("[,]");
        response["User answer"] = "";
        for (let index = 0; index < responses.length; index++) {
          let id = responses[index];
          response["User answer"] += "[" + id + "] " + choices[id]?.name + "\n";
        }
      } else {
        // Single response
        let id = element.xAPI?.result?.response;
        response["User answer"] = "[" + id + "] " + choices[id]?.name;
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

async function helperGetTotalSubmissions(exerciseId) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        $or: [
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
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
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(pipeline)
    .toArray();
  totalSubmissions = totalSubmissions[0]?.totalSubmissions;
  return totalSubmissions;
}
async function helperGetAverageScore(exerciseId) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": exerciseId,
      },
    },
    {
      $match: {
        $or: [
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed",
          },
          {
            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered",
          },
        ],
      },
    },
    {
      $group: {
        _id: "$xAPI.verb.id",
        avg: { $avg: "$xAPI.result.score.scaled" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];
  let averageScore = await m_client

    .db()
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(pipeline)
    .toArray();

  averageScore = averageScore[0]?.avg;

  return averageScore;
}

async function helperGetAttempted(exerciseId) {
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
  let attempted = await m_client
    .db()
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(pipeline)
    .toArray();
  attempted = attempted[0]?.attempted;
  return attempted;
}
async function helperGetQuestion(exerciseId) {
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
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(pipeline)
    .toArray();
  question = question[0]?.question;
  return question;
}

async function helperGetChoices(exerciseId) {
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
    .collection(process.env.MONGO_XAPI_COLLECTION)
    .aggregate(pipeline)
    .toArray();

  return choices;
}

async function helperGetChildExercises(exerciseId) {
  let pipeline = [
    {
      $match: {
        "xAPI.object.id": { $regex: exerciseId },
      },
    },
    {
      $group: {
        _id: "$xAPI.object.id",
      },
    },

    {
      $sort: {
        key: 1,
      },
    },
  ];
  let childExercises = await m_client
    .db()
    .collection(process.env.MONGO_XAPI_COLLECTION)
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
    let info = await m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .aggregate(pipeline)
      .toArray();

    let thisInfo = info[0];
    thisInfo.childId = thisExerciseId;
    thisInfo.parentId = exerciseId;

    childExercisesInfo.push(thisInfo);
  }

  return childExercisesInfo;
}
