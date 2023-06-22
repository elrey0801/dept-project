import pool from "../configs/connectDB.js";

let getHomepage = async (req, res) => {
    const userId = await req.user;
    const username = userId[0][0].username;
    const [rows, fields] = await pool.execute('SELECT * FROM `users`');

    return res.render('index.ejs', { userId: username, results: rows });
}

let getCreateGroupDetail = async (req, res) => {
    const userId = await req.user;
    const username = userId[0][0].username;
    let date = new Date();
    let group_id = 0, hidden_id = 0;
    if(req.params.id == 0) 
        group_id = username + '_' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-'
            + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
    else hidden_id = req.params.id;

    return res.render('create-group-detail.ejs', { userId: username, group_id: group_id, hidden_id: hidden_id });
}

let getPTVH = async (req, res) => {
    const userId = await req.user;
    const username = userId[0][0].username;
    const [rows, fields] = await pool.execute('SELECT * FROM `users`');

    return res.render('ptvh.ejs', { userId: username, results: rows });
}

export default {
    getHomepage, getUploadFilePage, handleUploadFile, handleUploadMultiFiles, runPython, getCreateGroupDetail, getPTVH
}