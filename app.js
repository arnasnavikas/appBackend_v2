var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connectDB = require('./mongoDB/db');
// routes
var delete_pictures = require('./routes/delete_pictures');
var admin_messages = require('./routes/admin_messages');
var client_messages = require('./routes/client_messages');
var skaiciuokle = require('./routes/skaiciuokle');
// var gallery_create_new = require('./routes/gallery_create_new');
var gallery_add_pictures = require('./routes/gallery_add_pictures');
var gallery_add_index = require('./routes/gallery_add_index');
// var gallery_delete = require('./routes/gallery_delete');
var send_mail = require('./routes/send_mail');
// var get_gallerys = require('./routes/gallery_get')
var get_pictures = require('./routes/pictures_get');
// var group_delete = require('./routes/group_delete');
// var group_rename = require('./routes/group_rename');
var upload_pictures = require('./routes/upload-pictures');
var my_resume = require('./routes/my-resume');
// var get_pictures_by_gallery = require('./routes/get-pictures-by-gallery-name');

/****************new route files************** */
var group = require('./routes/group');
var gallery = require('./routes/gallery')
var picture = require('./routes/pictures')
//application
var app = express();
/**connecting mongo database */
connectDB();

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
// new routes
app.use('/group',group);
app.use('/gallery',gallery);
app.use('/picture',picture);

//old routes for delete later
app.use('/addPictures', gallery_add_pictures);
app.use('/addindex', gallery_add_index);
app.use('/create-resume',my_resume);
// app.use('/galleryDelete', gallery_delete);
// app.use('/get-gallerys',get_gallerys);
app.use('/get-pictures',get_pictures);
// app.use('/group-delete/',group_delete);
// app.use('/group-rename',group_rename);
app.use('/galerija', delete_pictures);
app.use('/messages', admin_messages );
app.use('/message', client_messages);
// app.use('/new_gallery', gallery_create_new);
// app.use('/pictures-by-gallery',get_pictures_by_gallery);
app.use('/sendMail', send_mail);
app.use('/skaiciuokle', skaiciuokle);
app.use('/upload-pictures',upload_pictures);

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
