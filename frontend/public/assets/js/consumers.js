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
                      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                          viewBox="0 0 422.894 422.894" style="enable-background:new 0 0 422.894 422.894;" xml:space="preserve">
                        <g id="XMLID_22_">
                          <path id="XMLID_481_" d="M420.679,160.174c-7.681-23.637-33.066-36.572-56.704-28.893c-18.632,6.054-30.606,23.112-31.081,41.643
                            l-32.068,10.42c4.452,8.842,7.627,18.432,9.288,28.525l32.051-10.414c11.276,14.711,30.99,21.476,49.623,15.421
                            C415.422,209.195,428.359,183.809,420.679,160.174z"/>
                          <path id="XMLID_482_" d="M226.447,129.281V95.586c17.476-6.18,30-22.838,30-42.43c0-24.852-20.148-45-45-45
                            c-24.853,0-45,20.147-45,45c0,19.592,12.524,36.25,30,42.43v33.695c4.894-0.739,9.903-1.125,15-1.125
                            C216.544,128.156,221.553,128.542,226.447,129.281z"/>
                          <path id="XMLID_483_" d="M90,172.924c-0.477-18.529-12.449-35.589-31.082-41.643c-23.636-7.68-49.023,5.256-56.703,28.892
                            c-7.68,23.637,5.256,49.023,28.892,56.703c18.634,6.054,38.348-0.709,49.624-15.421l32.05,10.414
                            c1.661-10.094,4.836-19.683,9.288-28.525L90,172.924z"/>
                          <path id="XMLID_484_" d="M121.388,326.591c-17.77-5.272-37.694,0.843-49.209,16.692c-14.607,20.106-10.15,48.248,9.955,62.856
                            c20.107,14.607,48.248,10.15,62.856-9.956c11.516-15.85,11.175-36.689,0.668-51.96l19.819-27.278
                            c-8.959-4.657-17.127-10.631-24.249-17.662L121.388,326.591z"/>
                          <path id="XMLID_486_" d="M277.235,344.226c-10.506,15.271-10.847,36.108,0.669,51.959c14.608,20.106,42.75,24.564,62.855,9.956
                            c20.106-14.609,24.564-42.75,9.955-62.857c-11.516-15.85-31.44-21.966-49.21-16.691l-19.841-27.309
                            c-7.122,7.032-15.29,13.005-24.249,17.662L277.235,344.226z"/>
                          <circle id="XMLID_487_" cx="211.447" cy="228.156" r="70"/>
                        </g>
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