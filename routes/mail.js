var email        = require('emailjs');
var express      = require('express');
var router       = express.Router();
var async        = require('async');
var messageModel = require('../mongoDB/mail_schema');

router.post('/answer/:id',function(req,res,next){
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
     if(err){res.json({err});return;}
     res.json(call);
 });
 /**###################################################################
* UPDATES MESSAGES AS READED
* ################################################################### */ 
}).put('/:id',function(req,res,next){
 var id = req.params.id;
 messageModel.update({_id:id},{ziuretas:true},function(err,data){
     if(err){res.json(err);return;}
    res.json(data);
 });
 /**###################################################################
* delete one message
* ################################################################### */ 
}).delete('/:id',function(req,res,next){
    var id = req.params['id'];
    messageModel.remove({_id:id},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).post("/send", function(req, res, next){
    /**###################################################################
    * Save message from client to database
    * ################################################################### */ 
var body = JSON.parse(req.body.data);
var mailMessage = new messageModel(body);
        mailMessage.save(function (err,data) {
            if(err){ res.json(err); return; }
            res.json(data);
        });
})
/**###################################################################
* Get one message
* ################################################################### */ 
.get('/:id',function(req, res, next){
    var id_param = req.params.id;
    messageModel.findOne({_id: id_param},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
});
module.exports = router;