var email = require('emailjs');
var express = require('express');
var router = express.Router();
var messageModel = require('../mongoDB/mail_schema');

router.post('/',function(req,res,next){

var server 	= email.server.connect({
   user:	"arnoadaila@gmail.com", 
   password:"colapepsi", 
   host:	"smtp.gmail.com", 
   port:    "465",
   ssl:		true
});

var message	= {
   text:	"i hope this works", 
   from:	"you <username@your-email.com>", 
   to:		"someone <arnoadaila@gmail.com>, another <another@your-email.com>",
   cc:		"else <else@your-email.com>",
   subject:	"testing emailjs",
   attachment: 
   [
      {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
   ]
};
 
server.send(message, function(err, message) {
     
    res.json({message:message, err:err});
});
 
}).put('/:id',function(req,res,next){
 
 var message_id = req.params["id"];
 var body = JSON.parse(req.body.data);
 messageModel.update({_id:message_id},{ziuretas:body.perskaityta, atsakytas:body.atsakyta },function(err,data){
     if(err){
         res.json({error:err, message:'Cant udate message'});
         return;
     }

    res.json({message:'sita zinute skaityta!!', id:message_id, data:data});
 });
});

module.exports = router;