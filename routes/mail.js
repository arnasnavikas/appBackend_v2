var email        = require('emailjs');
var express      = require('express');
var router       = express.Router();
var async        = require('async');
var messageModel = require('../mongoDB/mail_schema');

router.put('/delete',function(req,res,next){
    /**###################################################################
   * UPDATES MESSAGES AS READED
   * ################################################################### */ 
 var id = JSON.parse(req.body.data);
 messageModel.remove({_id:{$in:id}},function(err,data){
     if(err){res.json(err);return;}
    res.json(data);
 });
}).put('/readed-message/:id',function(req,res,next){
    /**###################################################################
   * UPDATES MESSAGES AS READED
   * ################################################################### */ 
 var id = req.params.id;
 messageModel.update({_id:id},{newMail:false},function(err,data){
     if(err){res.json(err);return;}
    res.json(data);
 });
}).post("/send-answer", function(req, res, next){
    /**###################################################################
    * sends answer message to client email
    * ################################################################### */ 
var body = JSON.parse(req.body.data);
// res.json({fromServer:body});
var server 	= email.server.connect({
    user:	"arnoadaila@gmail.com", 
    password: process.env.gmail, 
    host:	"smtp.gmail.com", 
    port:    "465",
    ssl:		true
 });
//  email.message()
 var message	= {
    text:	body.answer, 
    from:    '<arnoadaila@gmail.com>',
    to:		body.email,
    subject: body.subject,
 };
//  res.json(body)
 async.parallel([
    function(call){
      messageModel.findOneAndUpdate({_id:body.message_id},{answer:body.answer},function(err,data) {
           if(err){ call(err); return; }
           call(null,data);
       });
    },function(call){
       server.send(message, function(err, message) {
           if(err){ call(err); return; }
           call(null,message);
       });

    }
],function(err,call){
    if(err){res.json({err});return;}
    res.json(call);
});
}).post("/send", function(req, res, next){
    /**###################################################################
    * Save message from client to database
    * ################################################################### */ 
var body = JSON.parse(req.body.data);
new messageModel(body).save(function (err,data) {
            if(err){ res.json(err); return; }
            res.json(data);
        });
}).get('/all/:user_id',function(req, res, next){
    /**###################################################################
    * Get all  messages from selected user
    * ################################################################### */ 
    var user = req.params.user_id;
    messageModel.find({user_id: user},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).get('/readed/:user_id',function(req, res, next){
    /**###################################################################
    * Get all readed messages from selected user
    * ################################################################### */ 
    var user = req.params.user_id;
    messageModel.find({user_id: user,newMail:false},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).get('/replayed/:user_id',function(req, res, next){
    /**###################################################################
    * Get all  messages from selected user
    * ################################################################### */ 
    var user = req.params.user_id;
    messageModel.find({user_id: user, answer: { $exists: true,}},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).get('/new/:user_id',function(req, res, next){
    /**###################################################################
    * Get all new  messages from selected user
    * ################################################################### */ 
    var user = req.params.user_id;
    messageModel.find({user_id: user,newMail:true},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
}).get('/message/:message_id',function(req, res, next){
    /**###################################################################
    * Get one message 
    * ################################################################### */ 
    var message_id = req.params.message_id;
    messageModel.findOne({_id: message_id},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
});
module.exports = router;