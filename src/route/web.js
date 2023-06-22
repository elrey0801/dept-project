import express from "express";
import homeController from "../controller/homeController.js";
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';
import pool from "../configs/connectDB.js";
import { log } from "console";
import bcrypt from 'bcrypt';
import passport from "passport";

let router = express.Router();


const initWebRoute = (app) => {
    router.get('/', checkAuthenticated, homeController.getHomepage);
    router.get('/create-group-detail/:id', checkAuthenticated, homeController.getCreateGroupDetail);
    router.get('/ptvh', checkAuthenticated, homeController.getPTVH);
    router.get('/about', checkAuthenticated, (req, res) => {
        res.send('Hello from the about site :3');
    })

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