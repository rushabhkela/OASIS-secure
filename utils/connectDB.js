const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI;
const winstonLogger = require('./logger');
const mongoose = require("mongoose");

mongoose.connect(uri)
    .then(() => {
        winstonLogger.info('Connected to database')
    })
    .catch((err) => {
        winstonLogger.error(`Error connecting to the database: \n${err}`);
    })

global.User = require('../models/userSchema');
global.Chat = require('../models/chatSchema');
global.Book = require('../models/bookSchema');
global.Docs = require('../models/docSchema');