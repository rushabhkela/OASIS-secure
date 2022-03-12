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

const sessions = {};

const getSession = (sessionId) => {
  const session = sessions[sessionId];
  return session && session.valid ? session : null;
}

const invalidateSession = (sessionId) => {
  const session = sessions[sessionId];
  if (session) {
    sessions[sessionId].valid = false;
  }
  return sessions[sessionId];
}

const createSession = (user) => {
  const sessionId = String(Object.keys(sessions).length + 1);
  const session = {
    sessionId,
    email: user.email,
    valid: true,
  };
  sessions[sessionId] = session;
  return session;
}

module.exports = {
  createSession: createSession,
  invalidateSession: invalidateSession,
  getSession: getSession,
  sessions: sessions
}