var email        = require('emailjs');
var express      = require('express');
var router       = express.Router();
var async        = require('async');
var messageModel = require('../mongoDB/mail_schema');

router.post('/:id',function(req,res,next){
var message_id = req.params["id"];
var body = JSON.parse(req.body.data);
var server 	= email.server.connect({
   user:	"arnoadaila@gmail.com", 
   password:"colapepsi", 
   host:	"smtp.gmail.com", 
   port:    "465",
   ssl:		true
});

var message	= {
   text:	"", 
   from:	"you <arnoadaila@gmail.com>", 
   to:		body.email,
   cc:		"else <arnoadaila@gmail.com>",
   subject:	 body.subject,
   attachment: 
   [
      {data: body.message, alternative:true},
   ]
};
 async.parallel([
     function(call){
        messageModel.update({_id:message_id},{atsakymas:body.message},function(err,data){
            if(err){ call(err); return;}
            call(data);
        });
     },function(call){
        server.send(message, function(err, message) {
            if(err){ call(err); return; }
            call(message);
        });

     }
 ],function(err,call){
     if(err){
        res.json({err});
        return;
     }
     res.json(call);
 });
 /**###################################################################
* UPDATES MESSAGES AS READED
* ################################################################### */ 
}).put('/:id',function(req,res,next){
 
 var message_id = req.params["id"];
 var body = JSON.parse(req.body.data);
 messageModel.update({_id:message_id},{ziuretas:body.perskaityta},function(err,data){
     if(err){
         res.json({error:err, message:'Cant update message'});
         return;
     }

    res.json({message:'sita zinute skaityta!!', id:message_id, data:data});
 });
 /**###################################################################
* delete one message
* ################################################################### */ 
}).delete('/:id',function(req,res,next){
    var id = req.params['id'];
 messageModel.remove({_id:id},function(err,data){
     if(err){
         res.json({error:err, message:'Cant delete message'});
         return;
     }
    res.json({message:'Zinute istrinta.'});
 });
});

module.exports = router;