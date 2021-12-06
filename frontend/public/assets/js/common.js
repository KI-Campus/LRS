// Make global variables so that the whole application can access
let token = ""
let firstName = ""
let lastName = ""
let role = ""
let id = ""

var consumer;
var courseId;

var VERSION = null;


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

    // Check for consumer in localstorage, if not then set it to all
    if (sessionStorage.getItem("consumer") == null) {

        sessionStorage.setItem("consumer", "all");
        consumer = "all";

    }
    try {
        // Load the consumer from session storage
        consumer = JSON.parse(sessionStorage.getItem("consumer"));
        consumerID = consumer.id;

    }
    catch (e) {
        if (typeof (sessionStorage.getItem("consumer")) == 'string') {
            // Load the consumer from session storage
            consumer = sessionStorage.getItem("consumer");


        }
    }


    // Check for courseId in session storage, if not then set it to all
    if (sessionStorage.getItem("courseId") == null) {

        sessionStorage.setItem("courseId", "all");
        courseId = "all";

    }
    try {
        // Load the courseId from session storage
        courseId = sessionStorage.getItem("courseId");

    }
    catch (e) {

    }

    // Set default Axios calls
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;

    // Fetch the LRS version
    axios.get("/status")
        .then(function (response) {
            if (response.data) {
                if (response.data.version) {
                    VERSION = response.data.version;
                    document.getElementById("lrsVersion").innerHTML = response.data.version;
                }
            }

        })
        .catch(function (error) {
            console.log(error);
            VERSION = null;

        }
        );


});

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