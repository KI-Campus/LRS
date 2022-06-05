// Make global variables so that the whole application can access
let token = ""
let firstName = ""
let lastName = ""
let role = ""
let id = ""

var consumer;
var courseId;

var VERSION = null;

var consumersList = [];


// Document ready helper function 
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// When the document is ready, call this function
docReady(function () {
    // Check if the user is logged in or not, if not, redirect it to login page
    checkLogin();

    // If logged in, get token and other details 
    token = sessionStorage.getItem("token");
    firstName = sessionStorage.getItem("firstName");
    lastName = sessionStorage.getItem("lastName");
    role = sessionStorage.getItem("role");
    id = sessionStorage.getItem("id");

    // Hide users tab if the user is not admin
    if (role == "admin") {
        for (let index = 0; index < document.getElementsByClassName("usersMenu").length; index++) {
            const element = document.getElementsByClassName("usersMenu")[index];
            element.classList.remove("hidden");
        }

        for (let index = 0; index < document.getElementsByClassName("consumersMenu").length; index++) {
            const element = document.getElementsByClassName("consumersMenu")[index];
            element.classList.remove("hidden");
        }
    }


    // Set default Axios calls
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;

    // Fetch the LRS version
    axios.get("/status")
        .then(function (response) {
            if (response.data) {
                if (response.data.version) {
                    VERSION = response.data.version;
                    if (document.getElementById("lrsVersion")) document.getElementById("lrsVersion").innerHTML = response.data.version;
                }
            }

        })
        .catch(function (error) {
            console.log(error);
            VERSION = null;

        }
        );


});


function loadConsumerFromStorage() {
    // Set session storage for consumers
    // Check for consumer in session storage, if not then set it to all
    if (sessionStorage.getItem("consumer") == null) {
        sessionStorage.setItem("consumer", JSON.stringify(consumersList[0]));
        consumer = String(consumersList[0].id);

    }
    try {
        // Load the consumer from session storage
        consumer = JSON.parse(sessionStorage.getItem("consumer"));
        consumerID = consumer.id;

    }
    catch (e) {
        console.log("Error loading consumer from storage", e);
    }
}

// If not logged in, navigate to login
function checkLogin() {
    sessionStorage.token ? "" : window.location = "login.html";
}

// Clear the session storage and send the user to login
function logout() {
    sessionStorage.clear();
    window.location = "login.html";
}

// A helper function to download memory variables as files
function downloadBlob(blob, name = 'file.txt') {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );

    // Remove link from body
    document.body.removeChild(link);
}

function simplifyData(element, includexAPIRaw = false) {
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
            response["Question"] = element.xAPI?.object?.definition?.description["en-US"];

            // Flatten the choices array
            let choices = [];
            for (let index = 0; index < element.xAPI?.object?.definition?.choices?.length; index++) {
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
            if (String(element.xAPI?.object?.definition?.correctResponsesPattern).includes("[,]")) {
                // Multiple correct responses
                let correctResponses = String(element.xAPI?.object?.definition?.correctResponsesPattern).split("[,]");
                response["Correct response"] = "";
                for (let index = 0; index < correctResponses?.length; index++) {
                    let id = correctResponses[index];
                    response["Correct response"] += "[" + id + "] " + choices[id]?.name + "\n";
                }
            }
            else {
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
            }
            else {
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
    if (element?.xAPI?.object?.definition?.extensions["http://h5p.org/x-api/h5p-subContentId"]) {
        response["Sub Content ID"] = element?.xAPI?.object?.definition?.extensions["http://h5p.org/x-api/h5p-subContentId"];
    }

    // Assign the time
    response["Time"] = element?.metadata?.createdAt;


    return response;
}

async function getAllConsumers() {
    // Get all consumers
    const GETCONSUMERS_URL = "../consumers/getall";
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    await axios.get(GETCONSUMERS_URL, config)
        .then(function (response) {
            if (response.data?.result) {
                consumersList = response.data.result;
            }

        })
        .catch(function (error) {
            console.log("Error while getting consumers", error);
            consumersList = [];
        });

}