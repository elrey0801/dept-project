const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        firstName: 'Tung',
        lastName: 'Nguyen',
        email: 'testapi@api.api',
        address: 'LMN'
    })
};

fetch('http://192.168.1.17:8888/api/v1/create-user', options).then((res) => res.json()).then(data => console.log(data));