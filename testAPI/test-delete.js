function deleteAccount(a) {
    fetch('http://192.168.1.17:8888/api/v1/delete-user/' + a, {
        method: 'DELETE',
    })
        .then(res => res.text()) // or res.json()
        .then(res => {
            console.log(res);
            getapi(api_url);
        })

}

