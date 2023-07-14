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

let getOPData = async (req, res) => {
    const userId = await req.user;
    const username = userId[0][0].username;
    const [rows, fields] = await pool.execute('SELECT * FROM `users`');

    return res.render('opData.ejs', { userId: username, results: rows });
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

export default {
    getHomepage, getUploadFilePage, handleUploadFile, handleUploadMultiFiles, runPython, getCreateGroupDetail, getPTVH, getOPData,
}