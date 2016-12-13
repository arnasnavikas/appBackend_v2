var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var connectDB = require('./mongoDB/db');
// routes
// var selected_gallery = require('./routes/selected_gallery');
var galerija = require('./routes/galerija');
var message = require('./routes/messages');
var limit_messages = require('./routes/show_delete_messages');
var skaiciuokle = require('./routes/skaiciuokle');
var login = require ('./routes/login');
var create_gallery = require('./routes/create_gallery');
var addPictures = require('./routes/addPictures');
//application
var app = express();
/**connecting mongo database */
connectDB();


// var DIR = '/home/arnas/nodeJS/my-app/backend/public/images/';
// var upload = multer({dest: DIR});

var allowCrossDomain = function(req, res, next) {
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
}


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/galerija', galerija);
app.use('/skaiciuokle', skaiciuokle);
app.use('/messages', limit_messages);
app.use('/message', message);
app.use('/login', login);
app.use('/new_gallery', create_gallery);
app.use('/addPictures', addPictures);
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
