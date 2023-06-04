const api_url =
    "http://192.168.1.17:8888/api/v1/users";

// Defining async function
async function getapi(url) {

    // Storing response
    const response = await fetch(url);

    // Storing data in form of JSON
    var res = await response.json();
    console.log(res.data);
    if (response) {
        hideloader();
    }
    show(res.data);
}
// Calling that async function
getapi(api_url);

// Function to hide the loader
function hideloader() {
    document.getElementById('loading').style.display = 'none';
}
// Function to define innerHTML for HTML table
function show(data) {
    let tab =
        `<th>ID</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Address</th>
        <th>Action</th>`;

    // Loop to access all rows
    for (let row of data) {
        tab += `<tr>
    <td>${row.id} </td>
    <td>${row.firstName}</td>
    <td>${row.lastName}</td>
    <td>${row.email}</td>       
    <td>${row.address}</td>
    <td><button onclick="deleteAccount(${row.id})">Delete Account</button></td>
</tr>`;
    }
    // Setting innerHTML as tab variable
    document.getElementById("employees").innerHTML = tab;
}