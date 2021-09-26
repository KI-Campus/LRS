let usersLoading = true;
let selectedUserId;
function getUsers() {
  const GETUSERS_URL = "../users/getall";
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  axios.get(GETUSERS_URL, config)
    .then(function (response) {
      document.getElementById("showingLabel").innerHTML = "Showing " + response.data.length + " users";
      if (response.data) {
        response.data.forEach(element => {
          addUserToTable(element);
        });
      }
      document.getElementById("loadingText").innerHTML = "Listing all users";
      usersLoading = false;
    })
    .catch(function (error) {
      console.log(error);
      document.getElementById("loadingText").innerHTML = "Error loading users";
      usersLoading = false;
    });
}

function addUserToTable(user) {
  var node = document.createElement("tr");
  node.id = "user_" + user.id;
  user.lastLogin = new Date(user.lastLogin).toLocaleDateString() + " " + new Date(user.lastLogin).toLocaleTimeString()
  user.createdAt = new Date(user.createdAt).toLocaleDateString() + " " + new Date(user.createdAt).toLocaleTimeString()
  document.getElementById("usersTable").appendChild(node)
  document.getElementById("user_" + user.id).outerHTML = `
                <tr id="user_${user.id}" class="text-gray-700 dark:text-gray-400">
                    <td class="px-4 py-3">
                      <div class="flex items-center text-sm">
                      <!-- Avatar with inset shadow -->
                      <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                        <div class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></div>
                      </div>
                        <div>
                          <p class="font-semibold">${user.firstName + " " + user.lastName}</p>
                          <p class="text-xs text-gray-600 dark:text-gray-400">
                            ${user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      ${user.lastLogin ? user.lastLogin : ""}
                    </td>
                    <td class="px-4 py-3 text-xs">
                      <span
                        class="uppercase px-2 py-1 font-semibold leading-tight ${user.role == "admin" ? "text-red-700 bg-red-100" : "text-green-700 bg-green-100"} rounded-full dark:bg-green-700 dark:text-green-100">
                        ${user.role}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      ${user.createdAt ? user.createdAt : ""}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-4 text-sm">
                        <button onclick="updateUser('${(user.id)}','${user.email}','${user.firstName}','${user.lastName}','${user.role}')"
                          class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                          aria-label="Edit">
                          <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z">
                            </path>
                          </svg>
                        </button>
                        <button onclick="delUser('${user.id}', '${user.firstName} ${user.lastName}')"
                          class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                          aria-label="Delete">
                          <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clip-rule="evenodd"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                </tr>
    `
}
function removeUserFromTable(userId) {
  document.getElementById("user_" + userId).remove();
}

docReady(function () {
  // Fetch users
  getUsers();
});

function delUser(userId, nameToDisplay) {
  if (!userId) return;

  if (confirm(`Are you sure you want to delete ${nameToDisplay}? This cannot be undone.`)) {

    let DELETE_USER_API = "../users/" + userId;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    axios.delete(DELETE_USER_API, config)
      .then(function (response) {
        console.log(response.data)
        removeUserFromTable(userId);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

}
function createUser() {
  let email = document.getElementById("newUserEmail").value;
  let password = document.getElementById("newUserPassword").value;
  let firstName = document.getElementById("newUserFirstName").value;
  let lastName = document.getElementById("newUserLastName").value;
  let role = document.getElementById("newUserRole").value;

  if (email && password) {
    let CREATE_USER_API = "../users/register"
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const data = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: role,
    }
    axios.post(CREATE_USER_API, data, config)
      .then(function (response) {
        document.getElementById("newUserLabel").classList.remove("hidden");
        setTimeout(() => { window.location.reload() }, 3000);
      })
      .catch(function (error) {
        document.getElementById("newUserErrorLabel").innerHTML = "Error creating new user: " + error;
        document.getElementById("newUserErrorLabel").classList.remove("hidden");
        setTimeout(() => { document.getElementById("newUserErrorLabel").classList.add("hidden"); }, 3000)
        console.log(error);
      });
  }
  else {
    document.getElementById("newUserErrorLabel").innerHTML = "Email and password cannot be empty";
    document.getElementById("newUserErrorLabel").classList.remove("hidden");
    setTimeout(() => { document.getElementById("newUserErrorLabel").classList.add("hidden"); }, 3000)
  }
}

function updateUser(id, email, firstName, lastName, role) {
  document.getElementById("updateUserId").value = id

  document.getElementById("updateUserEmail").value = email
  document.getElementById("updateUserFirstName").value = firstName
  document.getElementById("updateUserLastName").value = lastName
  document.getElementById("updateUserRole").value = role

  document.getElementsByClassName("updateUserUI")[0].classList.remove("hidden");
  document.getElementsByClassName("updateUserUI")[1].classList.remove("hidden");

  document.getElementById("updateButton").focus();
}

function updateUserCancel() {
  document.getElementsByClassName("updateUserUI")[0].classList.add("hidden");
  document.getElementsByClassName("updateUserUI")[1].classList.add("hidden");
}

function updateUserServer() {
  let id = document.getElementById("updateUserId").value;
  let email = document.getElementById("updateUserEmail").value;

  let firstName = document.getElementById("updateUserFirstName").value;
  let lastName = document.getElementById("updateUserLastName").value;
  let role = document.getElementById("updateUserRole").value;

  if (email) {
    let UPDATE_USER_API = "../users/" + id;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const data = {
      id: id,
      email: email,

      firstName: firstName,
      lastName: lastName,
      role: role,
    }
    axios.put(UPDATE_USER_API, data, config)
      .then(function (response) {
        document.getElementById("updateUserLabel").classList.remove("hidden");
        setTimeout(() => { window.location.reload() }, 3000);
      })
      .catch(function (error) {
        document.getElementById("updateUserErrorLabel").innerHTML = "Error creating new user: " + error;
        document.getElementById("updateUserErrorLabel").classList.remove("hidden");
        setTimeout(() => { document.getElementById("updateUserErrorLabel").classList.add("hidden"); }, 3000)
        console.log(error);
      });
  }
  else {
    document.getElementById("updateUserErrorLabel").innerHTML = "Email cannot be empty";
    document.getElementById("updateUserErrorLabel").classList.remove("hidden");
    setTimeout(() => { document.getElementById("updateUserErrorLabel").classList.add("hidden"); }, 3000)
  }
}