import pool from "../configs/connectDB";


let getHomepage = async (req, res) => {

    const [rows, fields] = await pool.execute('SELECT * FROM `users`');

    return res.render('index.ejs', { results: rows });
}

let getCreateGroupDetail = async (req, res) => {
    const userId = await req.user;
    const username = userId[0][0].username;
    const date = new Date();
    const groupId = username + '_' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-'
        + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();

    console.log(date.getFullYear());
    console.log(req.body)
    return res.render('create-group.ejs', { userId: username, groupId: groupId });
}

let createGroup = async (req, res) => {

    console.log(req.body)
    //'2023-06-02 14:17:15'
    // await pool.execute(`INSERT INTO users(firstName, lastName, email, address) 
    //                     VALUES(?, ?, ?, ?)`, [req.body.firstName, req.body.lastName, req.body.email, req.body.address]);
    return res.render('create-group.ejs');
}

let getDetailPage = async (req, res) => {
    let userId = req.params.userId;
    const [user, fields] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [userId]);

    return res.send(JSON.stringify(user));
}

let createNewUser = async (req, res) => {
    await pool.execute(`INSERT INTO users(firstName, lastName, email, address) 
                        VALUES(?, ?, ?, ?)`, [req.body.firstName, req.body.lastName, req.body.email, req.body.address]);
    return res.redirect('/');
}

let deleteUser = async (req, res) => {
    let userId = req.body.userId;
    await pool.execute(`DELETE FROM users WHERE id = ?`, [userId]);
    return res.redirect('/');
}

let editUserView = async (req, res) => {
    let userId = req.params.userId;
    const [user, fields] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [userId]);
    return res.render('update.ejs', { dataUser: user[0] });
}

let editUser = async (req, res) => {
    let { firstName, lastName, email, address, id } = req.body;
    await pool.execute(`UPDATE users SET firstName = ?, lastName = ?, email = ?, address = ? WHERE id = ?`, [firstName, lastName, email, address, id]);
    return res.redirect('/');
}

let getUploadFilePage = async (req, res) => {
    return res.render('uploadFile.ejs');
}

let handleUploadFile = async (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form

    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

    if (req.fileValidationError) {

        return res.send(req.fileValidationError);
    }
    else if (!req.file) {
        return res.send('Please select an image to upload');
    }

    // Display uploaded image for user validation
    res.render('updateSc.ejs', { req: req });
}

let handleUploadMultiFiles = async (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form

    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

    if (req.fileValidationError) {

        return res.send(req.fileValidationError);
    }
    else if (!req.files) {
        return res.send('Please select an image to upload');
    }
    console.log(req.files)
    let result = "";
    let files = req.files;
    // Display uploaded image for user validation
    for (let index = 0, len = files.length; index < len; ++index) {
        result += `<img src="/img/${files[index].filename}" width="300" style="margin-right: 20px;"/>`;
    }
    result += '<hr/><a href="/upload">Upload more images</a>';
    res.send(result);
}

let runPython = (req, res) => {
    const { exec } = require('child_process');
    exec(`E:\\dev\\node\\learning_basic\\src\\controller\\call.bat "hello from .bat"`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
        console.log('DONE script')
        return res.send('DONE script');
    });

}

module.exports = {
    getHomepage, getDetailPage, createNewUser, deleteUser, editUserView, editUser, getUploadFilePage,
    handleUploadFile, handleUploadMultiFiles, runPython, getCreateGroupDetail, createGroup
}