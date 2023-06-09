async function get_single_detail(hidden_id) {
    const response = await fetch('http://192.168.1.17:8888/api/v1/get-single-detail/' + hidden_id);
    var res = await response.json();
    console.log(res);
    return res.result[0];
}

function updateElemnent(hidden_id) {
    var schedule_start = document.getElementById('schedule_start').value;
    var schedule_finish = document.getElementById('schedule_finish').value;
    var crew = document.getElementById('crew').value;
    var content = document.getElementById('content').value;
    var element = document.getElementById('element').value;
    var station = document.getElementById('station').value;
    var ptt = document.getElementById('ptt').value;
    const options = {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            schedule_start: schedule_start,
            schedule_finish: schedule_finish,
            crew: crew,
            content: content,
            element: element,
            station: station,
            ptt: ptt,
            hidden_id: hidden_id,
        })
    };
    fetch('http://192.168.1.17:8888/api/v1/update-single', options).then((res) => res.json()).then(data => console.log(data));
    save_update_button(1);
    displayScheduleTable();
}

async function save_update_button(btn_type, hidden_id = 0) {
    let tag;
    if (btn_type == 1) {
        document.getElementById("form-btn").innerHTML = "";
        tag = `
        <button id = "create-button" class="button">Save</button>
        <input type="reset" value="Reset" class="button" />`
        document.getElementById("form-btn").innerHTML = tag;
        reset_save_btn();
    } else {
        document.getElementById("form-btn").innerHTML = "";
        var { schedule_start, schedule_finish, crew, content, element, station, ptt } = await get_single_detail(hidden_id);

        if (schedule_start !== null) {
            schedule_start = new Date(schedule_start);
            schedule_start.setMinutes(schedule_start.getMinutes() - schedule_start.getTimezoneOffset());
            schedule_start = schedule_start.toISOString().slice(0, -1);
        }
        if (schedule_finish !== null) {
            schedule_finish = new Date(schedule_finish);
            schedule_finish.setMinutes(schedule_finish.getMinutes() - schedule_finish.getTimezoneOffset());
            schedule_finish = schedule_finish.toISOString().slice(0, -1);
        }
        console.log(schedule_start);
        console.log(schedule_finish);
        document.getElementById('schedule_start').value = schedule_start;
        document.getElementById('schedule_finish').value = schedule_finish;
        document.getElementById('crew').value = crew;
        document.getElementById('content').value = content;
        document.getElementById('element').value = element;
        document.getElementById('station').value = station;
        document.getElementById('ptt').value = ptt;
        tag = `
        <button id="update-button" class="button" onclick="updateElemnent('${hidden_id}')">Update</button>
        <input type="reset" value="Reset" class="button" />`
        document.getElementById("form-btn").innerHTML = tag;
        // <button id="update-button" class="button" onclick="updateElemnent('${hidden_id}')" method="put">Update</button>
        // document.getElementById("update-button").addEventListener("click", updateElemnent(), hidden_id);
        // document.addEventListener('DOMContentLoaded', updateElemnent, hidden_id);
    }
}
save_update_button(1);
function reset_save_btn() {
    const createButton = document.getElementById('create-button');
    createButton.onclick = createGroup;
    function createGroup(event) {
        event.preventDefault();
        var username = document.getElementById('username').textContent.trim();
        var schedule_start = document.getElementById('schedule_start').value;
        var schedule_finish = document.getElementById('schedule_finish').value;
        var crew = document.getElementById('crew').value;
        var content = document.getElementById('content').value;
        var element = document.getElementById('element').value;
        var station = document.getElementById('station').value;
        var ptt = document.getElementById('ptt').value;
        var group_id = document.getElementById('group_id').value;
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
        displayScheduleTable();
    }
}
reset_save_btn();

async function get_detail(group_id) {
    const response = await fetch('http://192.168.1.17:8888/api/v1/get-group-detail/' + group_id);
    var res = await response.json();
    return res.result;
}

async function displayScheduleTable() {
    let group_id = document.getElementById('group_id').value;
    console.log(group_id);
    let data = await get_detail(group_id);
    console.log(data);
    let table = `
            <h2> Group List</h2>
                <table border="1" width="100%" class="w3-table-all w3-hoverable">
                    <thead>
                        <tr class="w3-light-grey">
                            <th style="width:9%">Bắt đầu</th>
                            <th style="width:9%">Kết thúc</th>
                            <th style="width:9%">Đơn vị</th>
                            <th style="width:9%">Trạm/NM</th>
                            <th>Phần tử</th>
                            <th>Nội dung</th>
                            <th style="width:9%">PTT</th>
                            <th style="width:9%">Edit/Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        `
    if (data.length > 0) {
        for (let row of data) {
            var hidden_id = row.hidden_id;
            var schedule_start = '';
            var schedule_finish = '';
            if (row.schedule_start !== null) {
                schedule_start = new Date(row.schedule_start);
                schedule_start = schedule_start.getFullYear() + '-' + (schedule_start.getMonth() + 1) + '-' + schedule_start.getDate() + ' ' + schedule_start.getHours() +
                    ':' + schedule_start.getMinutes();
            }
            if (row.schedule_finish !== null) {
                schedule_finish = new Date(row.schedule_finish);

                schedule_finish = schedule_finish.getFullYear() + '-' + (schedule_finish.getMonth() + 1) + '-' + schedule_finish.getDate() + ' ' + schedule_finish.getHours() +
                    ':' + schedule_finish.getMinutes();
            }
            table += `<tr>
                            <td>${schedule_start} </td>
                            <td>${schedule_finish}</td>
                            <td>${row.crew}</td>
                            <td>${row.station}</td>
                            <td>${row.element.replaceAll("\n", "<br/>")}</td>
                            <td style="text-align: left;">${row.content.replaceAll("\n", "<br/>")}</td>
                            <td>${row.ptt}</td>
                            <td>
                                <div style="width: 100%;" class="div-table">
                                    <button id="edit-button-${hidden_id}" class="button-table" onclick="preEditEle('${hidden_id}')">Edit</button>
                                    <button id="delete-button-${hidden_id}" class="button-table" onclick="deleteEle('${hidden_id}')">Delete</button>
                                </div>
                            </td>
                        </tr>`;
        }
    }

    table += `</tbody>
                </table>`
    document.getElementById("list-ct-container").innerHTML = table;
}
document.addEventListener('DOMContentLoaded', displayScheduleTable);

function preEditEle(hidden_id) {
    document.getElementById("create-group-detail-form").reset();
    save_update_button(2, hidden_id)
}

async function deleteEle(hidden_id) {
    console.log('deleting' + hidden_id);
    await fetch('http://192.168.1.17:8888/api/v1/delete-single/' + hidden_id, { method: 'DELETE' }).then(res => res.text()).then(res => console.log(res));
    displayScheduleTable();
}