var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
dotenv.config({ path: "./.env" });
var cors = require('cors')
var deserializeUser = require('./middlewares/deserialiseUser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatRouter = require('./routes/chats');
var bookRouter = require('./routes/book');
var docRouter = require('./routes/docs');

require('./utils/connectDB');


var app = express();

// Rate Limiter
const limiter = require("express-rate-limit");
app.use(
  limiter({
    windowMs: 5000,
    max: 5,
    message: {
      code: 429,
      message: "Too many requests from single IP address, please try again later."
    }
  }))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(deserializeUser);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);
app.use('/books', bookRouter);
app.use('/documents', docRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
