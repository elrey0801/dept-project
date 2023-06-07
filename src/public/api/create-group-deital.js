const button = document.getElementById('create-button');
button.onclick = createGroup;
function createGroup(event) {
    event.preventDefault();
    var username = document.getElementById('username').textContent.trim();
    var schedule_start = document.getElementsByName('schedule_start')[0].value;
    var schedule_finish = document.getElementsByName('schedule_finish')[0].value;
    var crew = document.getElementsByName('crew')[0].value;
    var content = document.getElementsByName('content')[0].value;
    var element = document.getElementsByName('element')[0].value;
    var station = document.getElementsByName('station')[0].value;
    var ptt = document.getElementsByName('ptt')[0].value;
    var group_id = document.getElementsByName('group_id')[0].value;
    if (element != '') {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                schedule_start: schedule_start,
                schedule_finish: schedule_finish,
                crew: crew,
                content: content,
                element: element,
                station: station,
                ptt: ptt,
                group_id: group_id,
            })
        };
        console.log(options)
        fetch('http://192.168.1.17:8888/api/v1/create-group-detail', options).then((res) => res.text()).then(data => console.log(data));
        alert("Added")
    }
    else
        alert("Chưa đủ dữ liệu");
}