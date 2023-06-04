// function get_detail(userId) {

//     const response = fetch('http://192.168.1.17:8888/api/v1/users-detail/' + userId, {
//         method: 'GET',
//     }).then(res => res.text()) // or res.json()
//         .then(res => {
//             console.log(res);
//         })

//     return response;
// }

async function get_detail(userId) {
    const response = await fetch('http://192.168.1.17:8888/api/v1/users-detail/' + userId);
    var res = await response.json();
    return res.data[0];
}

function update(userId) {
    console.log(userId);
    console.log(document.getElementById('user_firstName_' + userId).value);
    let fN = document.getElementById('user_firstName_' + userId).value;
    let lN = document.getElementById('user_lastName_' + userId).value;
    let eM = document.getElementById('user_email_' + userId).value;
    let aD = document.getElementById('user_address_' + userId).value;
    const options = {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            firstName: fN,
            lastName: lN,
            email: eM,
            address: aD,
            id: userId,
        })
    };

    fetch('http://192.168.1.17:8888/api/v1/update-user', options).then((res) => res.json()).then(data => console.log(data));
}
