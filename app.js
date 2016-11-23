var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var connectDB = require('./mongoDB/db');

var selected_gallery = require('./routes/selected_gallery');
var galerija = require('./routes/galerija');
var mongo = require('./routes/mongo');
var skaiciuokle = require('./routes/skaiciuokle');
var login = require ('./routes/login');
var app = express();
/**connecting mongo database */
connectDB();



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/galerija', galerija);
app.use('/galerija/:id', selected_gallery);
app.use('/skaiciuokle', skaiciuokle);
app.use('/mongo', mongo);
app.use('/login', login);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({error: {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
 res.json({error: {
      message: err.message,
      error: err
    }});
});


module.exports = app;
