var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var pathutil = require('path');

var app = express();

// view engine setup
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(pathutil.join(__dirname, '../')));

app.use('/', require('../home/routes'));
app.use('/', require('../dance/routes'));
app.use('/', require('../bundle/routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
