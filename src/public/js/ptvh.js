const HOST = 'https://elrey0801.tech'

//not implemented yet
function lockPTVH() {
    
}

function init_panel(date) {
    let panel = `<div style="display:inline-block; padding-right: 2%">
                    <label>Xem PTVH ngày: </label>
                    <input type="date" name="date" id="calender" value="${date}">
                    <button id = "ptvh-list-button" class="button" onclick="displayPTVHTable()">Xem PTVN ngày</button>
                    <button id="ptvh-lock-button" class="button" onclick="lockPTVH()">Khóa/Mở khóa</button>
                </div>`;
                    
    document.getElementById("date-list-container").innerHTML = panel;
}
document.addEventListener('DOMContentLoaded', function() {
    let today = new Date();
    today = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, "0") + '-' + today.getDate();
    init_panel(today);
});


//not implemented yet
async function save_update_button(btn_type, date) {
    let tag;
    if (btn_type == 1) {
        tag = `
        <button id = "create-button" class="button" onclick="createNote(event)">Save</button>`
        document.getElementById("form-btn").innerHTML = tag;
    } else {
        var { content } = await get_ptvh_note(hidden_id);
        document.getElementById('content').value = content;
        tag = `
        <button id="update-button" class="button" onclick="updateNote(event)" hidden_id="${hidden_id}">Update</button>`;
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
                        <th>Lưu ý vận hành ngày</th>
                        <th style="width:9%">Edit/Delete</th>
                    </tr>
                </thead>
                <tbody>`

    let date = document.getElementById('calender').value; 
    
    let data = await get_ptvh_note(date);
    addStatus();
    for(let row of data) {
        table += `<tr>  
                    <td style="text-align: left;">${row.note.replaceAll("\n", "<br/>")}</td>
                    <td>
                        <div style="width: 100%;" class="div-table">
                            <button id="edit-button-${row.id}" class="button-table" onclick="preEditNote('${row.id}')">Sửa</button>
                            <button id="delete-button-${row.id}" class="button-table" onclick="deleteNote('${row.id}')">Xóa</button>
                        </div>
                    </td>
                </tr>`;
    }
    table += '</tbody> </table>';
    document.getElementById("note-ct-container").innerHTML = table;
}

document.addEventListener('DOMContentLoaded', function() {displayNoteTable();});

async function displayPTVHTable() {
    displayNoteTable();
    async function get_date_detail(date) {
        let res, response;
        response = await fetch(HOST + '/api/v1/get-date-detail/' + date);
        res = await response.json();
        return res.result;
    }

    let data, date = document.getElementById('calender').value; 
    data = await get_date_detail(date);
    let table = `
                <table border="1" width="100%" class="w3-table-all w3-hoverable">
                <thead>
                    <tr class="w3-light-grey">
                        <th>Lịch công tác ngày</th>
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
document.addEventListener('DOMContentLoaded', function() {displayPTVHTable();});

async function deleteNote(note_id) {
    console.log('deleting note ' + note_id);
    let response;
    try {
        response = await fetch(HOST + '/api/v1/delete-single-note/' + note_id, { method: 'DELETE' })
        // .then(res => res.text()).then(res => console.log(res));
        if(response.status == 403) alert(`Your account don't have permission to delete this content`);
        else if (response.status == 406) alert(`PTVH ngày này đã khóa, không thể xóa nội dung!`);
        else alert(`Deleted`);
    } catch (error) {
        console.log(error);
    }
    save_update_button(1);
    displayNoteTable();
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
    let statusText = status === 1 ? '<label style="color:red;"><b>PTVH đã khóa</b></label>' : '<label><b>PTVH chưa khóa</b></label>';
    document.getElementById('ptvh-status').innerHTML = statusText; 
}
document.addEventListener('DOMContentLoaded', function() {addStatus();});