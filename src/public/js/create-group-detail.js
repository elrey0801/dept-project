const HOST = 'https://elrey0801.tech';

async function fill_group_id() {
    let group_id = document.getElementById('group_id');
    if (group_id.getAttribute('group_key') != 0) group_id.value = group_id.getAttribute('group_key');
    else {
        let result = await get_single_detail(group_id.getAttribute('single_key'));
        let hidden_id = result.hidden_id;
        group_id.value = result.group_id;
        await displayScheduleTable();
        preEditEle(hidden_id);
    }
}
document.addEventListener('DOMContentLoaded', fill_group_id);

function preEditEle(hidden_id) {
    resetButton();
    let group_id = document.getElementById('group_id').value;
    let allrow = document.querySelectorAll('#tbody-' + group_id + ' tr');
    [...allrow].map((row) => row.style = 'font-weight: normal;')
    document.getElementById('tr-' + hidden_id).style = 'font-weight: bold; color: blue;';
    save_update_button(2, hidden_id)
}

function resetButton() {
    let group_id = document.getElementById('group_id').value;
    document.getElementById("create-group-detail-form").reset();
    document.getElementById('group_id').value = group_id;
}

async function updateElemnent(event) {
    event.preventDefault();
    let hidden_id = event.target.getAttribute('hidden_id');
    var schedule_start = document.getElementById('schedule_start').value === "" ? null : document.getElementById('schedule_start').value;
    var schedule_finish = document.getElementById('schedule_finish').value === "" ? null : document.getElementById('schedule_finish').value;
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
    let response;
    try {
        response = await fetch(HOST + '/api/v1/update-single', options)
        // .then((res) => res.json()).then(data => {
        //     console.log(data);
        // });
        console.log(response)
        if (response.status == 403) alert(`Your account don't have permission to update this content`);
        if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể sửa công tác!`);
    } catch (error) {
        console.log(error);
    }
    save_update_button(1);
    displayScheduleTable();
    document.getElementById('tr-' + hidden_id).style = 'font-weight: normal;';
}

async function get_single_detail(hidden_id) {
    const response = await fetch(HOST + '/api/v1/get-single-detail/' + hidden_id);
    var res = await response.json();
    console.log(res);
    return res.result[0];
}

async function save_update_button(btn_type, hidden_id = 0) {

    let tag;
    if (btn_type == 1) {
        tag = `
        <button id = "create-button" class="button" onclick="createGroup(event)">Save</button>
        <button type="button" id="reset-button" class="button" onclick="resetButton(event)">Reset</button>`
        document.getElementById("form-btn").innerHTML = tag;
    } else {
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
        document.getElementById('schedule_start').value = schedule_start;
        document.getElementById('schedule_finish').value = schedule_finish;
        document.getElementById('crew').value = crew;
        document.getElementById('content').value = content;
        document.getElementById('element').value = element;
        document.getElementById('station').value = station;
        document.getElementById('ptt').value = ptt;
        tag = `
        <button id="update-button" class="button" onclick="updateElemnent(event)" hidden_id="${hidden_id}">Update</button>
        <button type="button" id="reset-button" class="button" onclick="resetButton(event)">Reset</button>`

        document.getElementById("form-btn").innerHTML = tag;
    }
}
save_update_button(1);

async function createGroup(event) {
    event.preventDefault();
    var username = document.getElementById('username').textContent.trim();
    var schedule_start = document.getElementById('schedule_start').value === "" ? null : document.getElementById('schedule_start').value;
    var schedule_finish = document.getElementById('schedule_finish').value === "" ? null : document.getElementById('schedule_finish').value;
    console.log(schedule_start, schedule_finish);
    var crew = document.getElementById('crew').value;
    var content = document.getElementById('content').value;
    var element = document.getElementById('element').value;
    var station = document.getElementById('station').value;
    var ptt = document.getElementById('ptt').value;
    var group_id = document.getElementById('group_id').value;
    console.log(schedule_start, schedule_finish)
    if (element != '' && schedule_start != null && schedule_finish != null) {
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
        let response;
        try {
            response = await fetch(HOST + '/api/v1/create-group-detail', options);
            if (response.status == 403) alert(`Your account don't have permission to add to this content`);
            else if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể thêm công tác!`);
            else alert("Added");
        } catch (error) {
            console.log(error);
        }
    }
    else
        alert("Chưa đủ dữ liệu");
    displayScheduleTable();
}

async function displayScheduleTable() {

    async function get_detail(group_id) {
        const response = await fetch(HOST + '/api/v1/get-group-detail/' + group_id);
        var res = await response.json();
        return res.result;
    }

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
                    <tbody id="tbody-${group_id}">
                        `
    if (data.length > 0) {
        for (let row of data) {
            var hidden_id = row.hidden_id;
            var schedule_start = '';
            var schedule_finish = '';
            if (row.schedule_start !== null) {
                schedule_start = new Date(row.schedule_start);
                schedule_start = schedule_start.getDate() + '-' + (schedule_start.getMonth() + 1) + '-' + schedule_start.getFullYear() + ' ' + schedule_start.getHours() +
                    ':' + String(schedule_start.getMinutes()).padStart(2, "0");
            }
            if (row.schedule_finish !== null) {
                schedule_finish = new Date(row.schedule_finish);

                schedule_finish = schedule_finish.getDate() + '-' + (schedule_finish.getMonth() + 1) + '-' + schedule_finish.getFullYear() + ' ' + schedule_finish.getHours() +
                    ':' + String(schedule_finish.getMinutes()).padStart(2, "0");
            }
            table += `<tr id="tr-${hidden_id}">
                            <td>${schedule_start} </td>
                            <td>${schedule_finish}</td>
                            <td>${row.crew}</td>
                            <td>${row.station}</td>
                            <td style="text-align: left;">${row.element.replaceAll("\n", "<br/>")}</td>
                            <td style="text-align: left;">${row.content.replaceAll("\n", "<br/>")}</td>
                            <td>${row.ptt}</td>
                            <td>
                                <div style="width: 100%;" class="div-table">
                                    <button id="edit-button-${hidden_id}" class="button-table" onclick="preEditEle('${hidden_id}')">Sửa</button>
                                    <button id="delete-button-${hidden_id}" class="button-table" onclick="deleteEle('${hidden_id}')">Xóa</button>
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



async function deleteEle(hidden_id) {
    console.log('deleting' + hidden_id);
    let response;
    try {
        response = await fetch(HOST + '/api/v1/delete-single/' + hidden_id, { method: 'DELETE' })
        // .then(res => res.text()).then(res => console.log(res));
        if(response.status == 403) alert(`Your account don't have permission to delete this content`);
        else if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể xóa công tác!`);
        else alert(`Deleted`);
    } catch (error) {
        console.log(error);
    }
    save_update_button(1);
    displayScheduleTable();
}