var express = require('express');
var router = express.Router();
var async = require ('async');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var request = require('request');
var oauth2Client = new OAuth2('81393626756-bjpp1q7a68vp5tlv8204bj5pvsm5embg.apps.googleusercontent.com','fq-MD4N7EBrAiRKpujpQomV8','http://127.0.0.1:3000/login/');
var scopes = ['https://www.googleapis.com/auth/gmail.modify'];
var url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope : scopes
});
google.options({
  auth: oauth2Client
});
/* GET home page. */
router.post('/', function(req, res, next) {
var loginData = req.body.data;
var jsonData=JSON.parse(loginData); 

  if(jsonData.name == 'Arnas' && jsonData.password=='password'){
    res.json({login:url, valid:false});
    return;
  }else{
    res.json({login:url, valid:false});
  }

}).get('/data', function(req,res,next){
  var gmail = google.gmail('v1');

    gmail.users.messages.list({
    auth: oauth2Client,
    userId: 'arnoadaila@gmail.com',
    }, function(err, resp) {
      if (err) {
        res.json(err);
        return;
      }
      request({
      method: "GET",
      uri: "https://www.googleapis.com/gmail/v1/users/arnoadaila@gmail.com/messages/"+resp.messages[1].id,
      headers: {
        "Authorization": "Bearer "+oauth2Client.credentials.access_token,
        "Content-Type": "application/json"
      }
    },
    function(err, response) {
      if(err){
        res.json(err);
        return;
      } else {
        var body = JSON.parse(response.body);
        res.json(body);
      }
    });
  });

}).get('/',function(req,res,next){
   var  code = req.url.slice(7);
  oauth2Client.getToken(code,function(err,tokens){
    if(err){
      res.json(err);
      return;
    }
    oauth2Client.setCredentials(tokens);
    res.redirect('http://127.0.0.1:3000/login/data');
  });

});

module.exports = router;
