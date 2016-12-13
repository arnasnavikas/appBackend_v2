var express = require ('express');
var router = express.Router();
var async = require ('async');
var messageModel = require('../mongoDB/mail_schema');
/**###################################################################
* Save message to database
* ################################################################### */ 
router.post("/", function(req, res, next){
//   JSON from client
var message = req.body.data;
var fromClient=JSON.parse(message);
console.log(fromClient);
var mailMessage = new messageModel({ name: fromClient.formData.name,
                                      email: fromClient.formData.email,
                                      message: fromClient.formData.message,
                                      confirm: fromClient.formData.confirm,
                                      tableData: fromClient.tableData,
                                      suma: fromClient.suma
                                    });
                                  
async.waterfall([
//  saving message to database
    function(call){
        mailMessage.save(function (err) {
            if(err)  call(err);
            call(null,{confirm:'Record saved!'});
        });
    }
    ],function(err,data) {
        // jei issaugant atsirado klaidu, grazinamas JSON su klaidu kodais
        if(err) 
            res.json({err: err});
        else
            res.json({message: data, dataSaved: fromClient});
    });
})
/**###################################################################
* Get one message
* ################################################################### */ 
.get('/:id',function(req, res, next){
    
    var id_param = req.params.id;
//   finds message
    messageModel.find({_id: id_param},function(err,data){
        if(err)
            res.json({message:'Cannot get data from user message', error:err});
        else
            res.json({data: data});
    });
});


module.exports = router;
