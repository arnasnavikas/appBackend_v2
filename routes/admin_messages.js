var express = require ('express');
var router = express.Router();
var messageModel = require('../mongoDB/mail_schema');

/**###################################################################
 * Get all messages from group
 * ################################################################### */ 
router.get('/:group_id',function(req,res,next){
    var id = req.params.group_id; //parameter from request
    messageModel.find({group_id:id},function(err,data){
        if(err){ res.json(err); return;}
        res.json(data);
    });
/**###################################################################
 * Get all messages
*/
})
.get('/',function(req,res,next){
    messageModel.find(function(err,data){
        if(err){ res.json(err); return;}
        res.json(data);
    });
})
/**###################################################################
 * Delete message
 * ################################################################### */ 
.post('/', function(req,res,next){
    var body = JSON.parse(req.body.data);
    messageModel.remove({_id:{$in:body}},function(err,data){
        if(err){res.json(err);return;}
        res.json(data);
    });
});
module.exports = router;