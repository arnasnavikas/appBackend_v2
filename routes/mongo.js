var express = require ('express');
var router = express.Router();
var async = require ('async');
var messageModel = require('../mongoDB/mail_schema');

router.post("/", function(req, res, next){
//   JSON from client
var message = req.body.data;
var fromClient=JSON.parse(message);

var mailMessage = new messageModel({ name: fromClient.name,
                                      email: fromClient.email,
                                      message: fromClient.message,
                                      confirm: fromClient.confirm
                                    });
                                  
async.waterfall([
//  saving message to database
    function(call){
        mailMessage.save(function (err) {
            if(err)  call(err);
            else  call(null,{confirm:'Record saved!'});
        });
    }
    ],function(err,data) {
        res.setHeader('Access-Control-Allow-Origin','*');
        // jei issaugant atsirado klaidu, grazinamas JSON su klaidu kodais
        if(err) {res.json({err: err}); return;};
// send respons to client
        res.json({message: data, dataSaved: fromClient});
    });
// get one message
}).get('/:id',function(req, res, next){
    
    var id_param = req.params.id;
//   finds message
    messageModel.find({_id: id_param},function(err,data){
    res.setHeader('Access-Control-Allow-Origin','*');
        if(err) 
            res.json({message:'Cannot get data from user message', error:err});
        
      res.json({data: data});
    });
// get all messages
}).get('/',function(req,res,next){
    messageModel.find(function(err,data){
    res.setHeader('Access-Control-Allow-Origin','*');
        if(err) 
            res.json({message:'Cannot get data from user message', error:err});
        
      res.json({data: data});
    });

});

module.exports = router;
