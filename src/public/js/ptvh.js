const HOST = 'https://elrey0801.tech'


async function lockPTVH() {
    let date = document.getElementById('calender').value;
    const options = {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            date: date,
        })
    };
    try {
        response = await fetch(HOST + '/api/v1/lock-ptvh', options)
    } catch (error) {
        console.log(error);
    }
    await addStatus();
    await displayPTVHTable();
}

//not implemented yet
async function copyNote() {
    let date = document.getElementById('calender').value;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            date: date,
        })
    };
    let response;
    try {
        response = await fetch(HOST + '/api/v1/copy-prev-date-note', options);
        if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể thêm lưu ý!`);
        else alert("Đã chuyển các lưu ý ngày trước sang.");
    } catch (error) {
        console.log(error);
    }
    await displayPTVHTable();
}

function init_panel(date) {
    let panel = `<div style="display:inline-block; padding-right: 2%">
                    <label>Xem PTVH ngày: </label>
                    <input type="date" name="date" id="calender" value="${date}">
                    <button id = "ptvh-list-button" class="button" onclick="displayPTVHTable()">Xem PTVN ngày</button>
                    <button id="ptvh-lock-button" class="button" onclick="copyNote()">Copy lưu ý ngày trước</button>
                    <button id="ptvh-lock-button" class="button" onclick="lockPTVH()">Khóa/Mở khóa</button>
                </div>`;

    document.getElementById("date-list-container").innerHTML = panel;
}
document.addEventListener('DOMContentLoaded', function () {
    let today = new Date();
    today = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, "0") + '-' + today.getDate();
    init_panel(today);
});


async function createNote() {
    let note = document.getElementById('content').value;
    let date = document.getElementById('calender').value;
    if (note != '') {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: date,
                note: note,
            })
        };
        let response;
        try {
            response = await fetch(HOST + '/api/v1/create-ptvh-note', options);
            if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể thêm lưu ý!`);
            else alert("Added");
        } catch (error) {
            console.log(error);
        }
    }
    else
        alert("Chưa nhập nội dung");
    await displayNoteTable();
}

async function updateNote(noteId) {
    //calling udpate
    let note = document.getElementById('content').value;
    let date = document.getElementById('calender').value;
    if (note != '') {
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: noteId,
                date: date,
                note: note,
            })
        };
        let response;
        try {
            response = await fetch(HOST + '/api/v1/update-ptvh-note', options);
            if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể sửa lưu ý!`);
            else alert("Updated");
        } catch (error) {
            console.log(error);
        }
    }
    else
        alert("Chưa nhập nội dung");

    await displayNoteTable();
    await save_update_button(1)
}

//not implemented yet
async function save_update_button(btn_type, noteId) {
    let tag;
    if (btn_type == 1) {
        tag = `
        <button id = "create-button" class="button" onclick="createNote(event)" type="button">Save</button>`
        document.getElementById("form-btn").innerHTML = tag;
    } else {
        document.getElementById('content').value = document.getElementById(`note-${noteId}`).innerText;
        let allrow = document.querySelectorAll(`#note-tab td`);
        [...allrow].map((row) => row.style = 'font-weight: normal; text-align: left;')
        document.getElementById('note-' + noteId).style = 'font-weight: bold; color: blue; text-align: left;';
        tag = `
        <button id="update-button" class="button" onclick="updateNote(${noteId})" type="button">Update</button>`;
        document.getElementById("form-btn").innerHTML = tag;
    }
}
save_update_button(1);

async function get_ptvh_note(date) {
    const response = await fetch(HOST + '/api/v1/get-ptvh-note/' + date);
    var res = await response.json();
    console.log(res);
    return res.result;
}

async function displayNoteTable() {
    let table = `
            <table border="1" width="100%" class="w3-table-all w3-hoverable">
                <thead>
                    <tr class="w3-light-grey">
                        <th>LƯU Ý VẬN HÀNH NGÀY</th>
                    </tr>
                </thead>
            </table>
            <table border="1" width="100%" class="w3-table-all w3-hoverable">
                <thead>
                    <tr class="w3-light-grey">
                        <th>Nội dung lưu ý</th>
                        <th style="width:9%">Edit/Delete</th>
                    </tr>
                </thead>
                <tbody id="note-tab">`

    let date = document.getElementById('calender').value;

    let data = await get_ptvh_note(date);
    addStatus();
    for (let row of data) {
        table += `<tr id="tr-${row.id}">  
                    <td id='note-${row.id}' style="text-align: left;">${row.note.replaceAll("\n", "<br/>")}</td>
                    <td>
                        <div style="width: 100%;" class="div-table">
                            <button id="edit-button-${row.id}" class="button-table" onclick="save_update_button(2, '${row.id}')" type="button">Sửa</button>
                            <button id="delete-button-${row.id}" class="button-table" onclick="deleteNote('${row.id}')">Xóa</button>
                        </div>
                    </td>
                </tr>`;
    }
    table += '</tbody> </table>';
    document.getElementById("note-ct-container").innerHTML = table;
}

document.addEventListener('DOMContentLoaded', function () { displayNoteTable(); });

async function displayPTVHTable() {
    await displayNoteTable();
    async function get_date_detail(date) {
        let res, response;
        response = await fetch(HOST + '/api/v1/get-date-detail/' + date);
        res = await response.json();
        console.log(res.result);
        return res.result;
    }

    let data, date = document.getElementById('calender').value;
    data = await get_date_detail(date);
    let table = `
                <table border="1" width="100%" class="w3-table-all w3-hoverable">
                <thead>
                    <tr class="w3-light-grey">
                        <th>LỊCH CÔNG TÁC NGÀY</th>
                    </tr>
                    </thead>
                </table>

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
                schedule_start = schedule_start.getDate() + '-' + (schedule_start.getMonth() + 1) + '-' + schedule_start.getFullYear() + ' ' + schedule_start.getHours() +
                    ':' + String(schedule_start.getMinutes()).padStart(2, "0");
            }
            if (row.schedule_finish !== null) {
                schedule_finish = new Date(row.schedule_finish);

                schedule_finish = schedule_finish.getDate() + '-' + (schedule_finish.getMonth() + 1) + '-' + schedule_finish.getFullYear() + ' ' + schedule_finish.getHours() +
                    ':' + String(schedule_finish.getMinutes()).padStart(2, "0");
            }
            table += `<tr>  
                        <td>${schedule_start} </td>
                        <td>${schedule_finish}</td>
                        <td>${row.crew}</td>
                        <td>${row.station}</td>
                        <td style="text-align: left;">${row.element.replaceAll("\n", "<br/>")}</td>
                        <td style="text-align: left;">${row.content.replaceAll("\n", "<br/>")}</td>
                        <td>${row.ptt}</td>
                    </tr>`;
        }
    }
    table += `</tbody>
                </table>`
    document.getElementById("list-ct-container").innerHTML = table;
}
document.addEventListener('DOMContentLoaded', function () { displayPTVHTable(); });

async function deleteNote(note_id) {
    console.log('deleting note ' + note_id);
    let response;
    try {
        response = await fetch(HOST + '/api/v1/delete-single-note/' + note_id, { method: 'DELETE' })
        // .then(res => res.text()).then(res => console.log(res));
        if (response.status == 403) alert(`Your account don't have permission to delete this content`);
        else if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể xóa nội dung!`);
        else alert(`Deleted`);
    } catch (error) {
        console.log(error);
    }
    await save_update_button(1);
    await displayNoteTable();
}

async function get_ptvh_status(date) {
    const response = await fetch(HOST + '/api/v1/get-ptvh-status/' + date);
    var res = await response.json();
    console.log(res);
    return res.ptvhStatus;
}

async function addStatus() {
    let date = document.getElementById('calender').value;
    let status = await get_ptvh_status(date);
    let statusText = status === 1 ? '<label style="color:red;"><b>PTVH đã khóa</b></label>' : '<label style="color:blue;"><b>PTVH chưa khóa</b></label>';
    document.getElementById('ptvh-status').innerHTML = statusText;
}
document.addEventListener('DOMContentLoaded', function () { addStatus(); });