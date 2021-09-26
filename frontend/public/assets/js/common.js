// Make global variables so that the whole application can access
let token = ""
let firstName = ""
let lastName = ""
let role = ""
let id = ""

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
    }
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
