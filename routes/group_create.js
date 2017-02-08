var express = require ('express');
var router = express.Router();
var async = require ('async');
var categoryModel = require('../mongoDB/group-model')
var fs = require('fs-extra');
var customPath = require('./paths');
var messageModel = require('../mongoDB/mail_schema');
router.post('/',function(req,res,next){
  var data = JSON.parse(req.body.data);
    async.waterfall([
        function(call){
            fs.mkdir(customPath.public_folder+data.route,function(err,data){
                if(err){ call(err);}
                call(null,data);
            });
        },
        function(dummy,call){
            var newGroup = new categoryModel(data);
            newGroup.save(function(err,data){
                if(err){ call(err); return;}
                call(null,data);
            });
        }
    ],function(err,data){
        if(err){ res.json(err);return;}
        res.json(data);
    });
})
/**#############################################
 * suranda viena grupe
 */
.get('/:route',function(req,res,next){
    var route = req.params.route;
        categoryModel.findOne({route:route},function(err,data){
            if(err){res.json(err); return;}
            res.json(data);
        });
})
/**#############################################
 * suranda visas grupes, ir tai grupei priklausanciu
 * neperskaitytu zinuciu kieki
 */
.get('/',function(req,res,next){
    async.waterfall([
        function(call){
            categoryModel.find(function(err,data){
                if(err){call(err);}
                call(null,data);
            });
        },function(data,call){
            var newData = [];
           (function repeat(i){
               var newMailLength = 0;
               if(i>= data.length){
                   call(null,newData);
                   return;
               }
               messageModel.find({group_id:data[i]._id},function(err,message){
                   if(err)
                     call(err);
                   for(var ii in message){
                     if(!message[ii].ziuretas)
                         newMailLength +=1;
                   }
                data[i].newMessages = newMailLength;
                newData.push(data[i]);
                repeat(i+=1);
               });
           })(0);
        }
    ],function(err,call){
        if(err){res.json(err);return;}
        res.json(call);
    });
});

module.exports = router;