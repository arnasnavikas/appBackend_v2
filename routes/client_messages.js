var express = require ('express');
var router = express.Router();
var messageModel = require('../mongoDB/mail_schema');
/**###################################################################
* Save message to database
* ################################################################### */ 
router.post("/", function(req, res, next){
var body = JSON.parse(req.body.data);
var mailMessage = new messageModel({
                        group_id : body.group_id, 
                        address  : body.address,
                        email    : body.email,
                        forname  : body.forname ,
                        message  : body.message ,
                        mobile   : body.mobile ,
                        name     : body.name ,
                        suma     : body.suma ,
                        tableData: body.tableData,
                    });
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
