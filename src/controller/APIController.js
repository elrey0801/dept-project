import res from "express/lib/response.js";
import pool from "../configs/connectDB.js";
import fs from 'fs';

let createGroup = async (req, res) => {
    const user = await req.user;
    let username = user[0][0].username;

    let group_id = req.body.group_id;
    let [group, f] = await pool.execute('SELECT * FROM `list-ct` WHERE group_id = ?', [group_id]);
    if (group.length > 0) {
        let [ifPermiss, f2] = await pool.execute('SELECT * FROM `ct-permission` WHERE id_ct = ?', [group[0].hidden_id]);

        if (username != ifPermiss[0].username) {
            let logstr = '[' + new Date() + ']---' + username + `---try to add content to group_id: ${group_id}\n`;
            console.log(logstr);
            fs.appendFileSync("logs.txt", logstr);
            return res.status(403).json({
                error: `Your account don't have permission to add to this content`,
            })
        }
    }

    let schedule_start = req.body.schedule_start;
    let schedule_finish = req.body.schedule_finish;
    if (schedule_start !== null) {
        schedule_start = schedule_start.split('T')
        schedule_start[1] = schedule_start[1] + ':00'
        schedule_start = schedule_start.join(' ')
    }

    if (schedule_finish !== null) {
        schedule_finish = schedule_finish.split('T')
        schedule_finish[1] = schedule_finish[1] + ':00'
        schedule_finish = schedule_finish.join(' ')
    }

    let [checkPTVH, field_checkPTVH] = await pool.execute('SELECT * FROM `ptvh` WHERE (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?)\
    AND YEAR(ptvh_date) = YEAR(?)) OR (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?) AND YEAR(ptvh_date) = YEAR(?))',
        [schedule_start, schedule_start, schedule_start, schedule_finish, schedule_finish, schedule_finish]);

    if (checkPTVH.length > 0 && checkPTVH[0].is_locked) {
        let logstr = '[' + new Date() + ']---' + username + '---try to create a row when PTVH is locked\n';
        console.log(logstr);
        fs.appendFileSync("logs.txt", logstr);
        return res.status(406).json({
            message: `PTVH ngày này đã khóa, không thể thêm công tác!`,
        })
    }

    const hidden_id = username + '_' + Date.now()
    await pool.execute('INSERT INTO `list-ct`(hidden_id, group_id, schedule_start, schedule_finish, crew, content, element, station, ptt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [hidden_id, group_id, req.body.schedule_start, req.body.schedule_finish, req.body.crew, req.body.content, req.body.element, req.body.station, req.body.ptt]);

    await pool.execute('INSERT INTO `ct-permission`(username, id_ct) VALUES(?, ?)', [username, hidden_id]);

    console.log('[' + new Date() + ']---' + username + '---created---' + hidden_id);
    return res.status(200).json({
        message: 'createGroup ok',
    })
}

let getGroupDetail = async (req, res) => {
    let group_id = req.params.group_id;
    let [result, field] = await pool.execute('SELECT * FROM `list-ct` WHERE group_id = ?', [group_id]);
    return res.status(200).json({
        message: 'getGroupDetail ok',
        result: result,
    })
}

let getSingleDetail = async (req, res) => {
    let hidden_id = req.params.hidden_id;
    let [result, field] = await pool.execute('SELECT * FROM `list-ct` WHERE hidden_id = ?', [hidden_id]);
    return res.status(200).json({
        message: 'getSingleDetail ok',
        result: result,
    })
}

let updateSingle = async (req, res) => {
    let hidden_id = req.body.hidden_id;
    const user = await req.user;
    let username = user[0][0].username;
    let [ifPermiss, field] = await pool.execute('SELECT * FROM `ct-permission` WHERE id_ct = ?', [hidden_id]);

    if (username != ifPermiss[0].username) {
        let logstr = '[' + new Date() + ']---' + username + '---try to update---' + hidden_id + '\n';
        console.log(logstr);
        fs.appendFileSync("logs.txt", logstr);
        return res.status(403).json({
            message: `Your account don't have permission to update this content`,
        })
    }

    if (!hidden_id)
        return res.status(200).json({
            message: 'missing params update method',
        })

    let schedule_start = req.body.schedule_start;
    let schedule_finish = req.body.schedule_finish;
    if (schedule_start !== null) {
        schedule_start = schedule_start.split('T')
        schedule_start[1] = schedule_start[1] + ':00'
        schedule_start = schedule_start.join(' ')
    }

    if (schedule_finish !== null) {
        schedule_finish = schedule_finish.split('T')
        schedule_finish[1] = schedule_finish[1] + ':00'
        schedule_finish = schedule_finish.join(' ')
    }

    let [checkPTVH, field_checkPTVH] = await pool.execute('SELECT * FROM `ptvh` WHERE (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?)\
    AND YEAR(ptvh_date) = YEAR(?)) OR (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?) AND YEAR(ptvh_date) = YEAR(?))',
        [schedule_start, schedule_start, schedule_start, schedule_finish, schedule_finish, schedule_finish]);

    if (checkPTVH.length > 0 && checkPTVH[0].is_locked) {
        let logstr = '[' + new Date() + ']---' + username + '---try to update---' + hidden_id + '---when PTVH is locked---\n'
        console.log(logstr);
        fs.appendFileSync("logs.txt", logstr);
        return res.status(406).json({
            message: `PTVH ngày này đã khóa, không thể sửa!`,
        })
    }

    await pool.execute('UPDATE `list-ct` SET schedule_start = ?, schedule_finish = ?, crew = ?, station = ?, element = ?, content = ?, ptt = ? WHERE hidden_id = ?',
        [schedule_start, schedule_finish, req.body.crew, req.body.station, req.body.element, req.body.content, req.body.ptt, hidden_id]);

    let logstr = '[' + new Date() + ']---' + username + '---updated---' + hidden_id + '\n';
    console.log(logstr);
    fs.appendFileSync("logs.txt", logstr);

    return res.status(200).json({
        message: 'update ok',
    })
}

let deleteSingle = async (req, res) => {

    let hidden_id = req.params.hidden_id;
    const user = await req.user;
    let username = user[0][0].username;
    let [ifPermiss, field] = await pool.execute('SELECT * FROM `ct-permission` WHERE id_ct = ?', [hidden_id]);

    if (username != ifPermiss[0].username) {
        let logstr = '[' + new Date() + ']---' + username + '---try to delete---' + hidden_id + '\n';
        console.log(logstr);
        fs.appendFileSync("logs.txt", logstr);
        return res.status(403).json({
            error: `Your account don't have permission to delete this content`,
        })
    }

    if (!hidden_id)
        return res.status(200).json({
            message: 'missing params',
        })

    let [result, fields] = await pool.execute('SELECT * FROM `list-ct` WHERE hidden_id = ?', [hidden_id]);
    if (result.length == 0)
        return res.status(200).json({
            message: 'hidden_id ' + hidden_id + ' does not exist',
        })

    let schedule_start = result[0].schedule_start;
    let schedule_finish = result[0].schedule_finish;
    let [checkPTVH, field_checkPTVH] = await pool.execute('SELECT * FROM `ptvh` WHERE (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?)\
    AND YEAR(ptvh_date) = YEAR(?)) OR (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?) AND YEAR(ptvh_date) = YEAR(?))',
        [schedule_start, schedule_start, schedule_start, schedule_finish, schedule_finish, schedule_finish]);

    if (checkPTVH.length > 0 && checkPTVH[0].is_locked) {
        let logstr = '[' + new Date() + ']---' + username + '---try to delete---' + hidden_id + '---when PTVH is locked---\n'
        console.log(logstr);
        fs.appendFileSync("logs.txt", logstr);
        return res.status(406).json({
            message: `PTVH ngày này đã khóa, không thể xóa!`,
        })
    }

    await pool.execute('DELETE FROM `list-ct` WHERE hidden_id = ?', [hidden_id]);

    let logstr = '[' + new Date() + ']---' + username + '---deleted---' + hidden_id + '\n';
    console.log(logstr);
    fs.appendFileSync("logs.txt", logstr);

    return res.status(200).json({
        message: 'delete ok',
    })
}

let getDateDetail = async (req, res) => {
    let date = req.params.date.split('-');
    let day = date[2], month = date[1], year = date[0];

    let [result, fields] = await pool.execute('SELECT * FROM `list-ct` WHERE (DAY(schedule_start) = ? AND MONTH(schedule_start) = ?  AND YEAR(schedule_start) = ?) OR\
                                                (DAY(schedule_finish) = ? AND MONTH(schedule_finish) = ?  AND YEAR(schedule_finish) = ?)',
        [day, month, year, day, month, year]);

    return res.status(200).json({
        message: 'get date data ok',
        result: result,
    })
}

let getWeekDetail = async (req, res) => {
    let date = req.params.date;

    let [result, fields] = await pool.execute('SELECT * FROM `list-ct` WHERE (WEEK(schedule_start) = WEEK(?)  AND YEAR(schedule_start) = YEAR(?)) OR \
                                                                            (WEEK(schedule_finish) = WEEK(?)  AND YEAR(schedule_finish) = YEAR(?))', [date, date, date, date]);

    return res.status(200).json({
        message: 'get week data ok',
        result: result,
    })
}

let getUndefinedDetail = async (req, res) => {
    let [result, fields] = await pool.execute('SELECT * FROM `list-ct` WHERE schedule_start IS NULL OR schedule_finish IS NULL');
    return res.status(200).json({
        message: 'get undefined data ok',
        result: result,
    })
}

let getUserCreatedDetail = async (req, res) => {
    const user = await req.user;
    let username = user[0][0].username;
    let [result, fields] = await pool.execute('SELECT * FROM `list-ct`, `ct-permission` WHERE `list-ct`.hidden_id = `ct-permission`.`id_ct` AND `ct-permission`.username = ?', [username]);
    return res.status(200).json({
        message: 'get user-created data ok',
        result: result,
    })
}

let getUserCreatedDateDetail = async (req, res) => {
    let date = req.params.date.split('-');
    let day = date[2], month = date[1], year = date[0];

    const user = await req.user;
    let username = user[0][0].username;

    let [result, fields] = await pool.execute(
        'SELECT * FROM `list-ct`, `ct-permission` WHERE (DAY(schedule_start) = ? AND MONTH(schedule_start) = ?  AND YEAR(schedule_start) = ?) OR\
        (DAY(schedule_finish) = ? AND MONTH(schedule_finish) = ?  AND YEAR(schedule_finish) = ?)\
        INTERSECT\
        SELECT * FROM `list-ct`, `ct-permission` WHERE `list-ct`.hidden_id = `ct-permission`.`id_ct` AND `ct-permission`.username = ?',
        [day, month, year, day, month, year, username]);

    return res.status(200).json({
        message: 'get user-created-date data ok',
        result: result,
    })
}

let getUserCreatedWeekDetail = async (req, res) => {
    let date = req.params.date;
    const user = await req.user;
    let username = user[0][0].username;

    let [result, fields] = await pool.execute(
        'SELECT * FROM `list-ct`, `ct-permission` WHERE (WEEK(schedule_start) = WEEK(?)  AND YEAR(schedule_start) = YEAR(?)) OR \
        (WEEK(schedule_finish) = WEEK(?)  AND YEAR(schedule_finish) = YEAR(?))\
        INTERSECT\
        SELECT * FROM `list-ct`, `ct-permission` WHERE `list-ct`.hidden_id = `ct-permission`.`id_ct` AND `ct-permission`.username = ?',
        [date, date, date, date, username]);

    return res.status(200).json({
        message: 'get user-created-week data ok',
        result: result,
    })
}

let getSingleNote = async (req, res) => {
    let idNote = req.params.id;

    let [note, fields] = await pool.execute('SELECT * FROM `ptvh-note` WHERE id = ?', [idNote]);

    return res.status(200).json({
        message: 'get single PTVH note ok',
        result: note,
    })
}

let getPTVHNote = async (req, res) => {
    let date = req.params.date.split('-');
    let day = date[2], month = date[1], year = date[0];

    let [result, fields] = await pool.execute('SELECT * FROM `ptvh-note` WHERE DAY(ptvh_date) = ? AND MONTH(ptvh_date) = ?  AND YEAR(ptvh_date) = ?',
        [day, month, year]);

    return res.status(200).json({
        message: 'get PTVH note ok',
        result: result,
    })
}

let deleteSingleNote = async (req, res) => {
    let idNote = req.params.id;
    const user = await req.user;
    let username = user[0][0].username;
    console.log(idNote);
    if (!idNote)
        return res.status(200).json({
            message: 'missing params',
        })

    let [result, fields] = await pool.execute('SELECT * FROM `ptvh-note` WHERE id = ?', [idNote]);
    if (result.length == 0)
        return res.status(200).json({
            message: 'idNote ' + idNote + ' does not exist',
        })

    let ptvh_date = result[0].ptvh_date;
    let [checkPTVH, field_checkPTVH] = await pool.execute('SELECT * FROM `ptvh` WHERE (DAY(ptvh_date) = DAY(?) AND MONTH(ptvh_date) = MONTH(?)\
    AND YEAR(ptvh_date) = YEAR(?))',
        [ptvh_date, ptvh_date, ptvh_date]);

    if (checkPTVH.length > 0 && checkPTVH[0].is_locked) {
        let logstr = '[' + new Date() + ']---' + username + '---try to delete note---' + idNote + '---when PTVH is locked---\n'
        console.log(logstr);
        fs.appendFileSync("logs.txt", logstr);
        return res.status(406).json({
            message: `PTVH ngày này đã khóa, không thể xóa nội dung!`,
        })
    }

    await pool.execute('DELETE FROM `ptvh-note` WHERE id = ?', [idNote]);

    let logstr = '[' + new Date() + ']---' + username + '---deleted a PTVH note---' + idNote + '\n';
    console.log(logstr);
    fs.appendFileSync("logs.txt", logstr);

    return res.status(200).json({
        message: 'delete PTVH note ok',
    })
}

let getPTVHStatus = async (req, res) => {
    let date = req.params.date.split('-');
    let day = date[2], month = date[1], year = date[0];

    let [result, fields] = await pool.execute('SELECT * FROM `ptvh` WHERE DAY(ptvh_date) = ? AND MONTH(ptvh_date) = ?  AND YEAR(ptvh_date) = ?',
        [day, month, year]);

    let ptvhStatus = 0;
    if (result.length == 0) {
        await pool.execute('INSERT INTO `ptvh` (`ptvh_date`, `is_locked`, `id`) VALUES (? , ?, NULL);', [req.params.date, 0]);
    } else ptvhStatus = result[0].is_locked;
    return res.status(200).json({
        message: 'get PTVH status ok',
        ptvhStatus: ptvhStatus,
    })
}

let lockPTVH = async (req, res) => {
    let date = req.body.date.split('-');
    let day = date[2], month = date[1], year = date[0];

    var [result, fields] = await pool.execute('SELECT * FROM `ptvh` WHERE DAY(ptvh_date) = ? AND MONTH(ptvh_date) = ?  AND YEAR(ptvh_date) = ?',
    [day, month, year]);

    console.log(result[0].is_locked);
    if(!result[0].is_locked) {
        await pool.execute('UPDATE `ptvh` SET `is_locked` = 1  WHERE `ptvh`.`id` = ?',
    [result[0].id]);
    } else {
        await pool.execute('UPDATE `ptvh` SET `is_locked` = 0  WHERE `ptvh`.`id` = ?',
    [result[0].id]);
    }

    return res.status(200).json({
        message: 'update PTVH status ok',
    })
}

export default {
    createGroup, getGroupDetail, updateSingle, deleteSingle, getSingleDetail, getDateDetail, getWeekDetail, getUndefinedDetail,
    getUserCreatedDetail, getSingleNote, getPTVHNote, deleteSingleNote, getPTVHStatus, getUserCreatedDateDetail, getUserCreatedWeekDetail,
    lockPTVH,
}