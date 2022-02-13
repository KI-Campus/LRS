// Send login request
function login() {
    // API endpoint for login
    const LOGIN_URL = "../users/authenticate";
    let emailValue = document.getElementById("email").value;
    let passwordValue = document.getElementById("password").value;

    // Basic validation
    // If email is empty then show email error
    if (emailValue == "") {
        document.getElementById("invalidEmail").innerHTML = "Please enter your password";
    }
    else {
        document.getElementById("invalidEmail").innerHTML = "<br />";
    }

    // If password is empty then show email error
    if (passwordValue == "") {
        document.getElementById("invalidPassword").innerHTML = "Please write a valid email address";
    }
    else {
        document.getElementById("invalidPassword").innerHTML = "<br />";
    }

    const data = { email: emailValue, password: passwordValue };
    axios.post(LOGIN_URL, data)
        .then(function (response) {
            if (response.data) {
                window.location = "index.html";
                storeAuth(response.data);
            }
        })
        .catch(function (error) {
            document.getElementById("error").innerHTML = "Error: " + error;
            console.log(error);
        });
}

// Store authentication token in session storage
function storeAuth(authObj) {
    sessionStorage.setItem("token", authObj.token);
    sessionStorage.setItem("role", authObj.role);
    sessionStorage.setItem("firstName", authObj.firstName);
    sessionStorage.setItem("lastName", authObj.lastName);
    sessionStorage.setItem("id", authObj.id);
}