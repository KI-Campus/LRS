let consumersLoading = true;
let selectedConsumerId;
function getConsumers() {
  const GETUSERS_URL = "../consumers/getall";
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  axios.get(GETUSERS_URL, config)
    .then(function (response) {
      console.log(response.data.result)
      document.getElementById("showingLabel").innerHTML = "Showing " + response.data.result.length + " consumers";
      if (response.data?.result) {
        response.data.result.forEach(element => {
          if (element.id != "all") {
            addConsumerToTable(element);
          }
        });
      }
      document.getElementById("loadingText").innerHTML = "Listing all consumers";
      consumersLoading = false;
    })
    .catch(function (error) {
      console.log(error);
      document.getElementById("loadingText").innerHTML = "Error loading consumers";
      consumersLoading = false;
    });
}

function addConsumerToTable(consumer) {
  var node = document.createElement("tr");
  node.id = "consumer_" + consumer.id;

  consumer.createdAt = new Date(consumer.createdAt).toLocaleDateString() + " " + new Date(consumer.createdAt).toLocaleTimeString()
  document.getElementById("consumersTable").appendChild(node)
  document.getElementById("consumer_" + consumer.id).outerHTML = `
                <tr id="consumer_${consumer.id}" class="text-gray-700 dark:text-gray-400">
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
                          <p class="font-semibold">${consumer.name}</p>
                          
                        </div>
                      </div>
                    </td>

                    <td class="px-4 py-3 text-sm">
                      <img class="consumerImg" style="max-width:180px; max-height: 60px" src="${consumer.picture ? consumer.picture : ""}" />
                    </td>

                    <td class="px-4 py-3 text-sm">
                    ${consumer.id ? consumer.id : ""}
                    </td>
                   
                    <td class="px-4 py-3 text-sm">
                      ${consumer.createdAt ? consumer.createdAt : ""}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-4 text-sm">
                        <button onclick="updateConsumer('${(consumer.id)}','${consumer.picture}','${consumer.name}')"
                          class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                          aria-label="Edit">
                          <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z">
                            </path>
                          </svg>
                        </button>
                        <button onclick="delConsumer('${consumer.id}', '${consumer.name}')"
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
function removeConsumerFromTable(consumerId) {
  document.getElementById("consumer_" + consumerId).remove();
}

docReady(function () {
  // Fetch consumers
  getConsumers();
});

function delConsumer(consumerId, nameToDisplay) {
  if (!consumerId) return;

  if (confirm(`Are you sure you want to delete ${nameToDisplay}? This cannot be undone.`)) {

    let DELETE_USER_API = "../consumers/" + consumerId;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    axios.delete(DELETE_USER_API, config)
      .then(function (response) {
        console.log(response.data)
        removeConsumerFromTable(consumerId);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

}
function createConsumer() {
  let id = document.getElementById("newConsumerId").value;
  let name = document.getElementById("newConsumerName").value;
  let picture = document.getElementById("newConsumerPicture").value;


  if (id && name && picture || String(id).toLocaleLowerCase() != "all") {
    let CREATE_USER_API = "../consumers/register"
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const data = {
      id: id,
      name: name,
      picture: picture,
    }
    axios.post(CREATE_USER_API, data, config)
      .then(function (response) {
        document.getElementById("newConsumerLabel").classList.remove("hidden");
        setTimeout(() => { window.location.reload() }, 3000);
      })
      .catch(function (error) {
        document.getElementById("newConsumerErrorLabel").innerHTML = "Error creating new consumer: " + error;
        document.getElementById("newConsumerErrorLabel").classList.remove("hidden");
        setTimeout(() => { document.getElementById("newConsumerErrorLabel").classList.add("hidden"); }, 3000)
        console.log(error);
      });
  }
  else {
    document.getElementById("newConsumerErrorLabel").innerHTML = "ID, name and picture cannot be empty or ID cannot be 'all'";
    document.getElementById("newConsumerErrorLabel").classList.remove("hidden");
    setTimeout(() => { document.getElementById("newConsumerErrorLabel").classList.add("hidden"); }, 3000)
  }
}

function updateConsumer(id, picture, name) {
  document.getElementById("updateConsumerId").value = id
  document.getElementById("updateConsumerId2").value = id

  document.getElementById("updateConsumerName").value = name
  document.getElementById("updateConsumerPicture").value = picture

  document.getElementsByClassName("updateConsumerUI")[0].classList.remove("hidden");
  document.getElementsByClassName("updateConsumerUI")[1].classList.remove("hidden");

  document.getElementById("updateButton").focus();
}

function updateConsumerCancel() {
  document.getElementsByClassName("updateConsumerUI")[0].classList.add("hidden");
  document.getElementsByClassName("updateConsumerUI")[1].classList.add("hidden");
}

function updateConsumerServer() {
  let id = document.getElementById("updateConsumerId").value;
  let name = document.getElementById("updateConsumerName").value;

  let picture = document.getElementById("updateConsumerPicture").value;


  if (id && name && picture || String(id).toLocaleLowerCase != "all") {
    let UPDATE_USER_API = "../consumers/" + id;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    const data = {
      id: id,
      name: name,
      picture: picture,

    }
    axios.put(UPDATE_USER_API, data, config)
      .then(function (response) {
        document.getElementById("updateConsumerLabel").classList.remove("hidden");
        setTimeout(() => { window.location.reload() }, 3000);
      })
      .catch(function (error) {
        document.getElementById("updateConsumerErrorLabel").innerHTML = "Error creating new consumer: " + error;
        document.getElementById("updateConsumerErrorLabel").classList.remove("hidden");
        setTimeout(() => { document.getElementById("updateConsumerErrorLabel").classList.add("hidden"); }, 3000)
        console.log(error);
      });
  }
  else {
    document.getElementById("updateConsumerErrorLabel").innerHTML = "ID, name and picture cannot be empty or ID cannot be 'all'";
    document.getElementById("updateConsumerErrorLabel").classList.remove("hidden");
    setTimeout(() => { document.getElementById("updateConsumerErrorLabel").classList.add("hidden"); }, 3000)
  }
}