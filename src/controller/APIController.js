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



let createNewGroup = async (req, res) => {

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

module.exports = {
    getAllUsers, getDetailPage, createNewUser, updateUser, deleteUser, createNewGroup,
}