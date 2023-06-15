import express from 'express';
import configViewEngine from './configs/viewEngine.js';
import initWebRoute from "./route/web.js"
import initAPIRoute from "./route/api.js"
import cors from 'cors';
import pool from "./configs/connectDB.js";
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config();
// import * as path from 'path';
// const express = require('express');
// const path = require('path');

// add authenticater libraries
import flash from 'express-flash';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './route/passport-config.js';
import methodOverride from 'method-override';

// const flash = require('express-flash');
// const session = require('express-session');
// const passport = require('passport');
// const initializePassport = require('./route/passport-config');
// const methodOverride = require('method-override');


const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// authenticating

initializePassport(
    passport,

    // have to modify to get data from DB
    async function getUserName(username) {
        const [user, fields] = await pool.execute('SELECT * FROM `users` WHERE username = ?', [username]);
        return user;
    },
    async function getId(id) {
        return await pool.execute('SELECT * FROM `users` WHERE id = ?', [id]);
    }
);

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// setup view engine
configViewEngine(app);

// init web route
initWebRoute(app);

// init API route
initAPIRoute(app);




app.listen(port, host, () => {
    console.log(`App is running on port ${port} of ${host}`);
})