var express = require ('express');
var router = express.Router();
var async = require ('async');
var messageModel = require('../mongoDB/mail_schema');
/**###################################################################
 * Get all messages
 * ################################################################### */ 
router.get('/:page',function(req,res,next){
/**###################################################################
 * Sets ofset parameter
 * ################################################################### */ 
    var page_param = req.params.page; //parameter from request
    var page_number = parseInt(page_param);
    console.log("page number - "+page_number);
    // checks if parameter is valid
    if(page_number <= 0 || page_number == NaN || page_number == undefined ){
        page_number = 1;
    }
    var ofset = page_number * 10;

    async.waterfall([
    /**###################################################################
    * Finds length of messages for page indexing purpose
    * ################################################################### */
        function(call){
            messageModel.find().count(function(err,data){
                if(err) 
                    call({message:'Cannot get count from user message', error:err});
            call(null,data);
            });
    /**###################################################################
    * Finds 10 messages
    * ################################################################### */
        },function(_number, call){
            if(page_param =='1'){
                ofset = 0;
                call(null, ofset, _number);
            }
            else if(_number >= ofset || _number<= ofset){
                        var new_page = page_number -1;
                        ofset = new_page * 10;
                        call(null, ofset, _number);
            } else{
                ofset = 0;
                call(null, ofset, _number);
            }
        }, function(_ofset, size, call){
                messageModel.find({},{confirm:0,message:0}).sort({date: -1}).skip(_ofset).limit(10).exec(function(err,data){
                    if(err) call({message:'i failed'});

                call(null, {data:data, size: size});
                });
        }
    /**###################################################################
    * Sends response ro user with 10 messages, and size of all messages 
    * ################################################################### */
    ],function(err,call){
        if(err) 
            res.json({message: err});
        else
            res.json(call);
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