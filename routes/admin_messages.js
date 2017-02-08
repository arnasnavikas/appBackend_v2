var express = require ('express');
var router = express.Router();
var async = require ('async');
var messageModel = require('../mongoDB/mail_schema');

/**###################################################################
 * Get all messages
 * ################################################################### */ 
router.get('/:group_id',function(req,res,next){
    var id = req.params.group_id; //parameter from request

    messageModel.find({group_id:id},function(err,data){
        if(err){ res.json(err); return;}
        res.json(data);
    });
})
/**###################################################################
 * Delete message
 * ################################################################### */ 
.post('/', function(req,res,next){
    var body = req.body;
    var parsed_body = JSON.parse(body.data);
    async.waterfall([
        function(call){
                    messageModel.remove({_id:{$in:parsed_body}},function(err){
                        if(err)
                            call({error: err, message:'cant delete. File show_delete_messages.js'});
                    
                        call(null,'successfuly deleted all records.');
                    });
        }
    ],function(err,data){
        if(err) 
            res.json({error :err });
        else
        res.json({data: data});
    });
});

module.exports = router;