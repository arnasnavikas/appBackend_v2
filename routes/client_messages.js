var express = require ('express');
var router = express.Router();
var async = require ('async');
var messageModel = require('../mongoDB/mail_schema');
/**###################################################################
* Save message to database
* ################################################################### */ 
router.post("/", function(req, res, next){
var body = JSON.parse(req.body.data);
console.log(messageModel);
console.log(body);
var mailMessage = new messageModel({ 
                        address  : body.addres ,
                        email    : body.email,
                        forname  : body.forname ,
                        message  : body.message ,
                        mobile   : body.mobile ,
                        name     : body.name ,
                        suma     : body.suma ,
                        tableData: body.tableData,
                    });
        mailMessage.save(function (err,data) {
            console.log(err);
            if(err){ res.json({err: err}); return; }
            res.json({message: 'message saved.',data:data});
        });
})
/**###################################################################
* Get one message
* ################################################################### */ 
.get('/:id',function(req, res, next){
    
    var id_param = req.params.id;
//   finds message
    messageModel.find({_id: id_param},function(err,data){
        if(err){
            res.json({message:'Cannot get data from user message', error:err});
            return;
        }
        else
            res.json(data);
    });
});


module.exports = router;
