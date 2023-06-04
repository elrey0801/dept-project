import express from 'express';
import configViewEngine from './configs/viewEngine';
import initWebRoute from "./route/web"
import initAPIRoute from "./route/api"
import cors from 'cors';
import pool from "./configs/connectDB";

require('dotenv').config();
// import * as path from 'path';
// const express = require('express');
// const path = require('path');

// add authenticater libraries
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./route/passport-config');
const methodOverride = require('method-override')


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
    async function getEmail(email) {
        const [user, fields] = await pool.execute('SELECT * FROM `account` WHERE email = ?', [email]);
        return user;
    },
    async function getId(id) {
        return await pool.execute('SELECT * FROM `account` WHERE id = ?', [id]);
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