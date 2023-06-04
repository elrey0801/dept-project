function show(data) {
    let tab =
        `<th>ID</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Address</th>`;

    // Loop to access all rows
    for (let row of data) {
        tab += `<tr>
    <td>${row.id} </td>
    <td>${row.firstName}</td>
    <td>${row.lastName}</td>
    <td>${row.email}</td>       
    <td>${row.address}</td>     
</tr>`;
    }
    // Setting innerHTML as tab variable
    document.getElementById("employees").innerHTML = tab;
}