import pool from "../configs/connectDB";

let getAllUsers = async (req, res) => {

    const [rows, fields] = await pool.execute('SELECT * FROM `users`');
    return res.status(200).json({
        message: 'ok',
        data: rows,
    })
}

let getDetailPage = async (req, res) => {
    let userId = req.params.userId;
    const [user, fields] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [userId]);
    return res.status(200).json({
        message: 'ok',
        data: user,
    })
}

let createNewUser = async (req, res) => {

    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.address)
        return res.status(200).json({
            message: 'missing params',
        })

    await pool.execute(`INSERT INTO users(firstName, lastName, email, address) 
                        VALUES(?, ?, ?, ?)`, [req.body.firstName, req.body.lastName, req.body.email, req.body.address]);

    return res.status(200).json({
        message: 'ok',
    })
}

let updateUser = async (req, res) => {
    let { firstName, lastName, email, address, id } = req.body;

    if (!id)
        return res.status(200).json({
            message: 'missing params',
        })


    await pool.execute(`UPDATE users SET firstName = ?, lastName = ?, email = ?, address = ? WHERE id = ?`, [firstName, lastName, email, address, id]);

    return res.status(200).json({
        message: 'ok',
    })
}

let deleteUser = async (req, res) => {
    let userId = req.params.userId;

    if (!userId)
        return res.status(200).json({
            message: 'missing params',
        })

    let [user, fields] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (user.length == 0)
        return res.status(200).json({
            message: 'Account ' + userId + ' does not exist',
        })

    await pool.execute(`DELETE FROM users WHERE id = ?`, [userId]);

    return res.status(200).json({
        message: 'ok',
    })
}



let createGroup = async (req, res) => {
    const username = req.body.username;
    console.log(req.body)
    let schedule_start = req.body.schedule_start
    let schedule_finish = req.body.schedule_finish
    schedule_start = schedule_start.split('T')
    schedule_start[1] = schedule_start[1] + ':00'
    schedule_start = schedule_start.join(' ')

    schedule_finish = schedule_finish.split('T')
    schedule_finish[1] = schedule_finish[1] + ':00'
    schedule_finish = schedule_finish.join(' ')

    console.log(schedule_start, schedule_finish)

    const hidden_id = username + '_' + Date.now()
    console.log(hidden_id)
    await pool.execute('INSERT INTO `list-ct`(hidden_id, group_id, schedule_start, schedule_finish, crew, content, element, station, ptt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [hidden_id, req.body.group_id, req.body.schedule_start, req.body.schedule_finish, req.body.crew, req.body.content, req.body.element, req.body.station, req.body.ptt]);

    await pool.execute('INSERT INTO `ct-permission`(username, id_ct) VALUES(?, ?)', [username, hidden_id]);
    return res.status(200).json({
        message: 'ok',
    })
}

let getGroupDetail = async (req, res) => {
    let group_id = req.params.group_id;
    let [result, field] = await pool.execute('SELECT * FROM `list-ct` WHERE group_id = ?', [group_id]);
    return res.status(200).json({
        message: 'ok',
        result: result,
    })
}

let updateSingle = async (req, res) => {
}

let deleteSingle = async (req, res) => {
    let hidden_id = req.params.hidden_id;
    console.log(hidden_id);
    if (!hidden_id)
        return res.status(200).json({
            message: 'missing params',
        })

    let [result, fields] = await pool.execute('SELECT * FROM `list-ct` WHERE hidden_id = ?', [hidden_id]);
    if (result.length == 0)
        return res.status(200).json({
            message: 'hidden_id ' + hidden_id + ' does not exist',
        })

    await pool.execute('DELETE FROM `list-ct` WHERE hidden_id = ?', [hidden_id]);

    return res.status(200).json({
        message: 'ok',
    })
}
module.exports = {
    getAllUsers, getDetailPage, createNewUser, updateUser, deleteUser, createGroup, getGroupDetail, updateSingle, deleteSingle,
}