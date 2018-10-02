const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

const addBlizzardApiKey = () => {
    if(fs.existsSync('./KEY')){
        const key = fs.readFileSync('./KEY', {encoding: 'utf8'});
        app.set('apikey', key.trim());
    } else {
        console.error(`The file KEY containing api key for blizzard api doesn't exist`);
        process.exit(1);
    }
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

addBlizzardApiKey();

app.use('/', indexRouter);
app.use('/api', apiRouter(app));

module.exports = app;
