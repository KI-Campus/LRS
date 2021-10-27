let config;
var mcqChart;
docReady(function () {
    // Get config ready
    config = {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    };

    // Fetch records

    // Populate download form fields
    populateDownloadForm();

    // Populate dashboard cards
    populateCards();

    // Populate exercise stats exercise selector dropdown
    populateExerciseStatSelector();

    // Draw Submissions by Time chart
    chartSubmissionsByTime();

    // Draw the Exercise Types pie chart
    chartExercisesTypes();

    // Draw and populate the QuizMCQs chart
    chartQuizMCQs();

    // Draw and populate the MCQs chart
    chartMCQs();

});

function populateDownloadForm() {

    // Get all distinct exercise ids
    data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.object.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("downloadExerciseId").innerHTML = "";
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    document.getElementById("downloadExerciseId").innerHTML += `<option value="${element._id}">${JSON.stringify(element._id).slice(1, -1)}</option>`;
                }
                document.getElementById("downloadExerciseId").innerHTML += `<option value="all">All</option>`;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    // Get all distinct context ids

    data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.context.contextActivities.category"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("downloadContextId").innerHTML = "";
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    document.getElementById("downloadContextId").innerHTML += `<option value="${element._id[0].id}">${JSON.stringify(element._id[0].id).slice(1, -1)}</option>`;
                }
                document.getElementById("downloadContextId").innerHTML += `<option value="all">All</option>`;
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    // Get all distinct activities
    data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.verb.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("downloadVerbType").innerHTML = "";
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    document.getElementById("downloadVerbType").innerHTML += `<option value="${element._id}">${JSON.stringify(element._id).slice(1, -1)}</option>`;
                }
                document.getElementById("downloadVerbType").innerHTML += `<option value="all">All</option>`;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Download button handler
function downloadData() {

    let exerciseId = document.getElementById("downloadExerciseId").value

    let contextId = document.getElementById("downloadContextId").value

    //let activityType = document.getElementById("downloadActivityType").value

    let data = {}
    data.pipeline = []
    data.pipeline[0] = {}
    data.pipeline[0]["$match"] = {}
    // if (contextId != "all" || !contextId) { data.pipeline[0]["$match"]["xAPI.context.contextActivities.category.id"] = contextId; }
    if (exerciseId != "all" || !exerciseId) { data.pipeline[0]["$match"]["xAPI.object.id"] = exerciseId; }
    //if (activityType != "all" || !activityType) { data.pipeline[0]["$match"]["xAPI.verb.id"] = activityType; }

    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                let csvBlob = new Blob([response.data.results])
                downloadBlob(csvBlob, 'myfile.json');
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function chartSubmissionsByTime() {
    let lineConfig = {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Submissions',
                    fill: false,
                    backgroundColor: '#7e3af2',
                    borderColor: '#7e3af2',
                    data: [],
                },
            ],
        },
        options: {
            responsive: true,
            /**
             * Default legends are ugly and impossible to style.
             * See examples in charts.html to add your own legends
             *  */
            legend: {
                display: false,
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true,
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date',
                    },
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Submissions',
                    },
                },
            },
        },
    }


    // Fetch the required aggregated request

    let data = {
        pipeline: [
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
                "$project": {
                    "DayMonthYear": {
                        "$dateToString": {
                            "format": "%d-%m-%Y",
                            "date": "$_id"
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": "$DayMonthYear",
                    "submissions": { "$sum": 1 }
                }
            },

            {
                "$sort": { "_id": 1 }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    lineConfig.data.labels.push(element._id);
                    lineConfig.data.datasets[0].data.push(element.submissions);
                }
                window.submissionsByTimeChartId = new Chart(document.getElementById('submissionsByTimeChartId'), lineConfig)
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function populateCards() {

    let data = {};
    // Fetch total records 
    data = {
        pipeline: [
            { "$unset": ["xAPI", "metadata"] }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("totalRecords").innerHTML = response.data.results.length;
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    // Fetch total submissions
    data = {
        pipeline: [
            {
                "$match": { "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/interacted" }
            },
            { "$unset": ["xAPI", "metadata"] }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("totalSubmissions").innerHTML = response.data.results.length;
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    // Fetch Exercise types
    data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.object.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("exerciseTypes").innerHTML = response.data.results.length;
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    // Fetch total completes
    data = {
        pipeline: [
            {
                "$match": { "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/completed" }
            },
            { "$unset": ["xAPI", "metadata"] }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("totalCompletes").innerHTML = response.data.results.length;
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function chartExercisesTypes() {
    let pieConfig = {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [],
                    /**
                     * These colors come from Tailwind CSS palette
                     * https://tailwindcss.com/docs/customizing-colors/#default-color-palette
                     */
                    backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
                    label: 'Dataset 1',
                },
            ],
            labels: [],
        },
        options: {
            responsive: true,
            cutoutPercentage: 80,
            /**
             * Default legends are ugly and impossible to style.
             * See examples in charts.html to add your own legends
             *  */
            legend: {
                display: false,
            },
        },
    }

    // Fetch the required aggregated request

    let data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.context.contextActivities.category.id", "count": { "$sum": 1 }
                }
            }
        ]
    }

    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    pieConfig.data.labels.push(element._id);
                    pieConfig.data.datasets[0].data.push(element.count)
                }
                //pieConfig.data.labels = response.data.results;

                window.submissionsByTimeChartId = new Chart(document.getElementById('exercisesChartId'), pieConfig)
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}
// Not used for now
function chartQuizMCQs() {
    const quizes = []
    const subMCQs = []

    // Get all distinct exercise ids
    data = {
        pipeline: [
            {
                "$match": {
                    "xAPI.context.contextActivities.category.id": "http://h5p.org/libraries/H5P.QuestionSet-1.17"
                }
            },
            {
                "$group": {
                    "_id": "$xAPI.object.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("exerciseIdQuizChart").innerHTML = "";
                let quizId = {};
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    if (element._id.includes("?")) {
                        element._id = element._id.substring(0, element._id.indexOf('?'));
                    }
                    quizId[element._id] = element;

                }
                for (let index = 0; index < Object.keys(quizId).length; index++) {
                    document.getElementById("exerciseIdQuizChart").innerHTML += `<option value="${Object.keys(quizId)[index]}">${Object.keys(quizId)[index]}</option>`;
                }
                document.getElementById("exerciseIdQuizChart").onchange();
            }
        })
        .catch(function (error) {
            console.log(error);
        });

}

// Not used for now
function chartQuizMCQsChangeQuizId() {
    let getValue = document.getElementById("exerciseIdQuizChart").value;
    let subMCQs = [];
    // Get Quiz's sub MCQs
    data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.object.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("exerciseIdQuizMCQidChart").innerHTML = "";
                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    if (!element._id) { break; }

                    if (element._id.includes("subContentId")) {
                        //element._id = element._id.substring(element._id.indexOf('?'), element._id.length);

                        if (getValue == element._id.substring(0, element._id.indexOf('?'))) {
                            let subMCQId = element._id.substring(element._id.indexOf('=') + 1, element._id.length);
                            document.getElementById("exerciseIdQuizMCQidChart").innerHTML += `<option value="${subMCQId}">${subMCQId}</option>`;
                            subMCQs.push(subMCQId)
                        }
                    }
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });

}

function chartMCQs() {
    // Get all MCQ ids
    data = {
        pipeline: [
            {
                "$match": {
                    "xAPI.context.contextActivities.category.id": "http://h5p.org/libraries/H5P.MultiChoice-1.14"
                }
            },
            {
                "$group": {
                    "_id": "$xAPI.object.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                document.getElementById("exerciseIdMCQChart").innerHTML = "";

                for (let index = 0; index < response.data.results.length; index++) {
                    const element = response.data.results[index];
                    if (!element._id.includes("?")) {
                        document.getElementById("exerciseIdMCQChart").innerHTML += `<option value="${element._id}">${element._id}</option>`;
                    }
                }
                document.getElementById("exerciseIdMCQChart").onchange();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function chartMCQsChangeId() {
    let mcqId = document.getElementById("exerciseIdMCQChart").value;

    // Fetch all the available choices from this particular MCQ
    data = {
        pipeline: [
            {
                "$match": {
                    "xAPI.context.contextActivities.category.id": "http://h5p.org/libraries/H5P.MultiChoice-1.14",
                    "xAPI.object.id": mcqId,
                    "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered"
                }
            },
            {
                "$unwind": "$xAPI.object.definition.choices"
            },
            {
                "$group": {
                    "_id": "$xAPI.object.definition.choices.description",
                    "myId": {
                        "$first": "$xAPI.object.definition.choices.id"
                    }
                }
            },
            {
                "$unset": [
                    "metadata"
                ]
            },
            {
                "$sort": {
                    "myId": 1
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                let choices = {};

                for (let index = 0; index < response.data.results.length; index++) {
                    let element = response.data.results[index];
                    element.selected = 0;
                    element.myId = Number(element.myId)
                    element._id["en-US"] = element._id["en-US"].replace("\n", "");
                    choices[element.myId] = element;
                }

                // Get the number of counts per choice
                data = {
                    pipeline: [
                        {
                            "$match": {
                                "xAPI.context.contextActivities.category.id": "http://h5p.org/libraries/H5P.MultiChoice-1.14",
                                "xAPI.object.id": mcqId,
                                "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered"
                            }
                        },

                        {
                            "$group": { "_id": "$xAPI.result.response", "count": { "$sum": 1 } }
                        },

                        {
                            "$unset": ["metadata", "xAPI.verb", "xAPI.actor", "xAPI.result"]
                        },

                        {
                            "$sort": { "_id": 1 }
                        }
                    ]
                }

                axios.post("../records/aggregate", data, config)
                    .then(function (response) {

                        if (response.data) {
                            let eachSelectedChoice;
                            for (let index = 0; index < response.data.results.length; index++) {
                                const element = response.data.results[index];
                                if (element._id == "") { continue; }

                                eachSelectedChoice = element._id.split("[,]");
                                eachSelectedChoice.forEach(splitElement => {
                                    choices[splitElement].selected += element.count
                                });

                            }


                            let labels = []
                            let myData = []


                            for (let index = 0; index < Object.keys(choices).length; index++) {
                                const element = Object.keys(choices)[index];
                                labels.push(choices[element]._id["en-US"]);
                                myData.push(choices[element].selected)

                            }



                            // Draw the chart
                            const mcqChartConfig = {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [

                                        {
                                            label: 'Number of times selected',
                                            backgroundColor: myData.map((element) => { return '#DC2626' }), //['#7e3af2', '#0694a2'],
                                            // borderColor: window.chartColors.blue,
                                            borderWidth: 1,
                                            data: myData,
                                        },
                                    ],
                                },
                                options: {
                                    scales: {
                                        yAxes: [{
                                            ticks: {
                                                beginAtZero: true
                                            }
                                        }],
                                        x: {
                                            beginAtZero: true
                                        }
                                    },
                                    responsive: true,
                                    legend: {
                                        display: false,
                                    },
                                },
                            }
                            if (mcqChart) { mcqChart.destroy() }
                            const mcqChartCanvas = document.getElementById('mcqChartId');
                            mcqChart = new Chart(mcqChartCanvas, mcqChartConfig);

                            // Color the correct answers
                            // Get the correct answers query 
                            let correctResponsesPattern;
                            data = {
                                "pipeline": [
                                    {
                                        "$match": {
                                            "xAPI.context.contextActivities.category.id": "http://h5p.org/libraries/H5P.MultiChoice-1.14",
                                            "xAPI.object.id": mcqId,
                                            "xAPI.verb.id": "http://adlnet.gov/expapi/verbs/answered"
                                        }
                                    },
                                    {
                                        "$sort": {
                                            "_id": -1
                                        }
                                    },
                                    {
                                        "$limit": 1
                                    },
                                    {
                                        "$group": {
                                            "_id": "$xAPI.object.definition.correctResponsesPattern"
                                        }
                                    }
                                ]
                            }

                            axios.post("../records/aggregate", data, config)
                                .then(function (response) {

                                    if (response.data) {
                                        correctResponsesPattern = response.data.results[0]._id[0];
                                        let splitResponses = correctResponsesPattern.split("[,]")

                                        for (let index = 0; index < splitResponses.length; index++) {
                                            const element = splitResponses[index];
                                            // Highlight the correct responses
                                            mcqChart.data.datasets[0].backgroundColor[element] = '#10B981';

                                        }
                                        mcqChart.update();


                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        }

                    })
                    .catch(function (error) {
                        console.log(error);
                    });




            }
        })
        .catch(function (error) {
            console.log(error);
        });

}

function populateExerciseStatSelector() {
    // First populate the exercise selector to get all available exercises
    // Get all distinct exercise ids
    data = {
        pipeline: [
            {
                "$group": {
                    "_id": "$xAPI.object.id"
                }
            }
        ]
    }
    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data) {
                let returnedExercises = {};
                document.getElementById("excericseStatsExerciseId").innerHTML = "";
                for (let index = 0; index < response.data.results.length; index++) {
                    let element = response.data.results[index];
                    // Ignore subtypes of exercises
                    element._id = element._id.split("?")[0];
                    //returnedExercises.push(element._id.split("?")[0]);
                    returnedExercises[element._id.split("?")[0]] = element._id.split("?")[0];
                }
                for (let index = 0; index < Object.keys(returnedExercises).length; index++) {
                    const element = Object.keys(returnedExercises)[index];
                    document.getElementById("excericseStatsExerciseId").innerHTML += `<option value="${element}">${JSON.stringify(element).slice(1, -1)}</option>`;
                }

                document.getElementById("excericseStatsExerciseId").onchange();
            }
        })
        .catch(function (error) {
            console.log(error);
        });

}

// Exercise Stats dropdown changes. Get stats for that particular exercise
function exerciseStatsChangeExercise() {
    let exerciseId = document.getElementById("excericseStatsExerciseId").value;
    // Fetch number of completed or answered records for that particular exercise
    data = {
        pipeline: [
            {
                "$match": {
                    "xAPI.object.id": exerciseId,
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
                "$group": { "_id": "$xAPI.verb.id", "count": { "$sum": 1 } }
            },

            {
                "$sort": {
                    "_id": 1
                }
            }
        ]
    }

    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data.results[0].count) {

                let count = response.data.results[0].count;
                if (response.data.results[1]) {
                    count += response.data.results[1].count
                }
                document.getElementById("excericseStatsTotalCompletesOrAnswered").innerHTML = count;
            }
        })
        .catch(function (error) {
            document.getElementById("excericseStatsTotalCompletesOrAnswered").innerHTML = "...";
            console.log(error);
        });


    // Fetch number of students who passed
    data = {
        pipeline: [
            {
                "$match": {
                    "xAPI.object.id": exerciseId, "xAPI.result.success": true,
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
    }

    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data.results[0].count) {

                document.getElementById("excericseStatsPassing").innerHTML = response.data.results[0].count;
            }
        })
        .catch(function (error) {
            document.getElementById("excericseStatsPassing").innerHTML = "...";
            console.log(error);
        });


    // Fetch average marks
    data = {
        "pipeline": [
            {
                "$match": {
                    "xAPI.object.id": exerciseId,
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
                "$group": { "_id": "$xAPI.verb.id", "avg": { "$avg": "$xAPI.result.score.scaled" } }
            },
            {
                "$sort": {
                    "_id": 1
                }
            }
        ]
    }

    axios.post("../records/aggregate", data, config)
        .then(function (response) {
            if (response.data.results[0].avg) {

                document.getElementById("excericseStatsAveragePoints").innerHTML = response.data.results[0].avg;
            }
        })
        .catch(function (error) {
            document.getElementById("excericseStatsAveragePoints").innerHTML = "...";
            console.log(error);
        });


}