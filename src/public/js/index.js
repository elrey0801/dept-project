const HOST = 'http://192.168.1.17:8888/'
let current_view = 0;

function init_panel() {
    let today = new Date();
    today = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, "0") + '-' + today.getDate();
    let panel = `<div style="display:inline-block; padding-right: 2%">
                    <label>Xem lịch ngày: </label>
                    <input type="date" name="date" id="calender" value="${today}">
                    <button id = "date-list-button" class="button" onclick="displayScheduleTable(0)" type=0>Xem lịch ngày</button>
                    <button id = "week-list-button" class="button" onclick="displayScheduleTable(1)" type=1>Xem lịch tuần</button>
                    <button id = "undefined-list-button" class="button" onclick="displayScheduleTable(2)" type=1>Công tác chưa nhập ngày</button>
                    <button id = "undefined-list-button" class="button" onclick="displayScheduleTable(3)" type=1>Cá nhân</button>
                </div>`
    document.getElementById("date-list-container").innerHTML = panel;
}
document.addEventListener('DOMContentLoaded', init_panel);

async function displayScheduleTable(type) {

    async function get_dateWeek_detail(date, type) {
        current_view = type;
        let res, response;
        if(type==0) response = await fetch(HOST + '/api/v1/get-date-detail/' + date);
        else if(type==1) response = await fetch(HOST + '/api/v1/get-week-detail/' + date);
        else if(type==2) response = await fetch(HOST + '/api/v1/get-undefined-detail/');
        else if(type==3) response = await fetch(HOST + '/api/v1/get-usercreated-detail/');
        res = await response.json();
        return res.result;
    }

    let data, dateWeek = document.getElementById('calender').value; 
    data = await get_dateWeek_detail(dateWeek, type);
    let table = `
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
                            <td>
                            <div style="width: 100%;" class="div-table">
                                <button id="edit-button-${hidden_id}" class="button-table" onclick="location.href='/create-group-detail/${hidden_id}'">Sửa</button>
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
document.addEventListener('DOMContentLoaded', function() {displayScheduleTable(current_view);});

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
    displayScheduleTable(current_view);
}