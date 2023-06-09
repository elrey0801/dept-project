import express from "express";
import homeController from "../controller/homeController.js";
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';
import pool from "../configs/connectDB.js";
import { log } from "console";
import bcrypt from 'bcrypt';
import passport from "passport";

// const bcrypt = require('bcrypt');
// const passport = require('passport');

let router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cb(null, "E:/dev/node/learning_basic/src/public/img");
        cb(null, appRoot + "/src/public/xlsx");
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const xlsxFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(xlsx|XLSX|xls|XLS)$/)) {
        req.fileValidationError = 'Only EXCEL files are allowed!';
        return cb(new Error('Only EXCEL files are allowed!'), false);
    }
    cb(null, true);
};

let upload = multer({ storage: storage, fileFilter: xlsxFilter });
let uploadMultipleFiles = multer({ storage: storage, fileFilter: xlsxFilter });

const initWebRoute = (app) => {
    router.get('/', checkAuthenticated, homeController.getHomepage);
    router.get('/create-group-detail/:id', checkAuthenticated, homeController.getCreateGroupDetail);
    router.get('/ptvh', checkAuthenticated, homeController.getPTVH);
    router.get('/op-data', checkAuthenticated, homeController.getOPData);

    router.get('/python', homeController.runPython);

    router.get('/about', checkAuthenticated, (req, res) => {
        res.send('Hello from the about site :3');
    })

    router.get('/upload', checkAuthenticated, homeController.getUploadFilePage);
    router.post('/upload-profile-pic', upload.single('profile_pic'), homeController.handleUploadFile);
    router.post('/upload-multi-pic', uploadMultipleFiles.array('multi_pic', 3), homeController.handleUploadMultiFiles);

    // authentication
    router.get('/login', checkNotAuthenticated, (req, res) => {
        res.render('login.ejs')
    })

    router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }))

    router.get('/register', checkNotAuthenticated, (req, res) => {
        res.render('register.ejs')
    })

    router.post('/register', checkNotAuthenticated, async (req, res) => {
        try {
            console.log(req.body.password);
            const hashedPass = await bcrypt.hash(req.body.password, 10);
            await pool.execute(`INSERT INTO users(username, password) 
                        VALUES(?, ?)`, [req.body.username, hashedPass]);
            res.redirect('/login');
        }
        catch (e) {
            console.log(e);
            res.redirect('/register');
        }
    })

    router.delete('/logout', (req, res, next) => {
        req.logOut((err) => {
            if (err) return next(err);
            res.redirect('/login');
        });
    });

    return app.use('/', router);
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

export default initWebRoute;